const { User } = require("../../models");
const { db } = require("../../config/firebase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

function isHashedPassword(password) {
  return typeof password === 'string' && password.startsWith('$2b$');
}

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    // 1. validate
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Thiếu email/số điện thoại hoặc password",
      });
    }

    // 2. tìm user trong SQL (graceful fallback nếu DB chưa chạy)
    let user = null;
    let userId;
    let userIdentifier;
    let userName;
    let passwordMatches = false;

    try {
      if (email) {
        user = await User.findOne({ where: { email } });
      } else if (phone) {
        user = await User.findOne({ where: { phone } });
      }
    } catch (sqlErr) {
      console.warn("SQL lookup skipped, fallback Firestore:", sqlErr.message);
    }

    if (user) {
      userId = user.id;
      userIdentifier = user.email || user.phone;
      userName = user.fullName;
      if (isHashedPassword(user.password)) {
        passwordMatches = await bcrypt.compare(password, user.password);
      } else {
        passwordMatches = user.password === password;
      }
    } else {
      // Fallback: tìm trong Firestore theo email hoặc phone
      let snapshot;
      if (email) {
        snapshot = await db
          .collection("users")
          .where("email", "==", email)
          .limit(1)
          .get();
      } else {
        snapshot = await db
          .collection("users")
          .where("phone", "==", phone)
          .limit(1)
          .get();
      }

      if (snapshot.empty) {
        return res.status(404).json({
          message: "User không tồn tại",
        });
      }

      const doc = snapshot.docs[0];
      const firestoreUser = doc.data();
      userId = doc.id;
      userIdentifier = firestoreUser.email || firestoreUser.phone;
      userName = firestoreUser.fullName || firestoreUser.name;
      passwordMatches = await bcrypt.compare(password, firestoreUser.password);
    }

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Sai mật khẩu",
      });
    }

    const token = jwt.sign(
      {
        id: userId,
        email: userIdentifier,
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: userId,
        email: userIdentifier,
        name: userName,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};


exports.register = async (req, res) => {
  try {
    const { email, phone, password, name } = req.body;

    // 1. validate
    if ((!email && !phone) || !password || !name) {
      return res.status(400).json({
        message: "Thiếu thông tin (email hoặc số điện thoại, password, name)",
      });
    }

    // 2. check existing user
    if (email) {
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return res.status(400).json({
          message: "Email đã được sử dụng",
        });
      }
    }

    if (phone) {
      const snapshot = await db
        .collection("users")
        .where("phone", "==", phone)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return res.status(400).json({
          message: "Số điện thoại đã được sử dụng",
        });
      }
    }

    // 3. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. save to db
    const userData = {
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    };
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const newUserRef = await db.collection("users").add(userData);

    // 5. response
    const responseUser = { id: newUserRef.id, name };
    if (email) responseUser.email = email;
    if (phone) responseUser.phone = phone;

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: responseUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Thiếu idToken" });
    }

    // 1. Verify Google ID token qua Google tokeninfo endpoint
    // (google_sign_in trả về Google ID token, không phải Firebase ID token)
    let uid, email, name, picture;
    try {
      const tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );
      const tokenInfo = await tokenInfoRes.json();

      if (tokenInfo.error_description || tokenInfo.error || !tokenInfo.email) {
        return res.status(401).json({ message: "Google token không hợp lệ" });
      }

      uid = tokenInfo.sub;
      email = tokenInfo.email;
      name = tokenInfo.name;
      picture = tokenInfo.picture;
    } catch (verifyErr) {
      console.error("Token verification error:", verifyErr);
      return res.status(401).json({ message: "Không thể xác minh token Google" });
    }

    // 2. Check if user exists in db
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    let userDoc;
    if (snapshot.empty) {
      // User doesn't exist, create new
      const newUserRef = await db.collection("users").add({
        email,
        name: name || "",
        avatar: picture || "",
        uid: uid,
        createdAt: new Date().toISOString(),
        authProvider: "google"
      });
      userDoc = { id: newUserRef.id, email, name: name || "" };
    } else {
      userDoc = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    // 3. Create our own JWT token
    const token = jwt.sign(
      {
        id: userDoc.id,
        email: userDoc.email,
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập Google thành công",
      token,
      user: {
        id: userDoc.id,
        email: userDoc.email,
        name: userDoc.name,
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};