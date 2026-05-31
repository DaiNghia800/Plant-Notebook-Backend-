const { User } = require("../../models");
const db = require("../../config/firebase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

function isHashedPassword(password) {
  return typeof password === 'string' && password.startsWith('$2b$');
}

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

    // 2. tìm user trong SQL
    let user = await User.findOne({ where: { email } });
    let userId;
    let userEmail;
    let userName;
    let passwordMatches = false;

    if (user) {
      userId = user.id;
      userEmail = user.email;
      userName = user.fullName;
      if (isHashedPassword(user.password)) {
        passwordMatches = await bcrypt.compare(password, user.password);
      } else {
        passwordMatches = user.password === password;
      }
    } else {
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
      const firestoreUser = doc.data();
      userId = doc.id;
      userEmail = firestoreUser.email;
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
        email: userEmail,
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: userId,
        email: userEmail,
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