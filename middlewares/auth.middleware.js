const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "my_secret_key";

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực hoặc sai định dạng" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Lưu thông tin { id, email } vào req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
