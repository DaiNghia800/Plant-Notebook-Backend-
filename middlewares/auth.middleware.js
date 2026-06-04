const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "my_secret_key";

module.exports = (req, res, next) => {
  try {
    // Try Authorization header first
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      // Fallback to HttpOnly cookie set by login
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực hoặc sai định dạng" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Lưu thông tin { id, email, role, ... } vào req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
