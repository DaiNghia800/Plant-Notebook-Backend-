const db = require("../../config/firebase");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config()

const SECRET_KEY = process.env.SECRET_KEY;

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