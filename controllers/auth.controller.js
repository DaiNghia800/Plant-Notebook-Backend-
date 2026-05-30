const db = require("../config/firebase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
require("dotenv").config()

const SECRET_KEY = process.env.SECRET_KEY;

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. validate
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Thiếu thông tin (email, password, name)",
      });
    }

    // 2. check existing user
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

    // 3. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. save to db
    const newUserRef = await db.collection("users").add({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date().toISOString()
    });

    // 5. response
    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUserRef.id,
        email,
        name
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log(await bcrypt.hash("123456", 10));
    const { email, password } = req.body;

    // 1. validate
    if (!email || !password) {
      return res.status(400).json({
        message: "Thiếu email hoặc password",
      });
    }

    // 2. tìm user
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    const doc = snapshot.docs[0];
    const user = doc.data();

    // 3. check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Sai mật khẩu",
      });
    }

    // 4. tạo token
    const token = jwt.sign(
      {
        id: doc.id,
        email: user.email,
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    // 5. response
    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: doc.id,
        email: user.email,
        name: user.name,
      },
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

    // 1. Verify token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

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
    return res.status(401).json({ message: "Token không hợp lệ hoặc lỗi server" });
  }
};