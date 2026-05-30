const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "my_secret_key";

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
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        message: "Email đã được sử dụng",
      });
    }

    // 3. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. save to db
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      authProvider: "local",
    });

    // 5. response
    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
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
    const { email, password } = req.body;

    // 1. validate
    if (!email || !password) {
      return res.status(400).json({
        message: "Thiếu email hoặc password",
      });
    }

    // 2. tìm user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }

    // Nếu đăng ký qua google mà không có pass
    if (!user.password && user.authProvider === "google") {
      return res.status(400).json({
        message: "Tài khoản này được đăng ký bằng Google. Hãy đăng nhập bằng Google.",
      });
    }

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
        id: user.id,
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
        id: user.id,
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
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // User doesn't exist, create new
      user = await User.create({
        email,
        name: name || "",
        avatar: picture || "",
        authProvider: "google",
      });
    }

    // 3. Create our own JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập Google thành công",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    return res.status(401).json({ message: "Token không hợp lệ hoặc lỗi server" });
  }
};