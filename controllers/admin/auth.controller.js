const authService = require("../../services/admin/auth.service")

module.exports.login = async (req, res) => {
  const { email, password } = req.body || {}
  try {
    if (!email || !password) {
      return res.status(400).json({
        err: 1,
        msg: "Missing input!"
      })
    }

    const response = await authService.loginService(req.body)
    if (response.err === 0) {
      res.cookie('token', response.token, {
        httpOnly: true, // Trình duyệt không thể đọc cookie qua JS (Chống XSS)
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS khi deploy
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // Hết hạn sau 1 ngày
      });
      // Định dạng lại response theo chuẩn có data: { token, user } để frontend sử dụng
      return res.status(200).json({
        err: 0,
        data: {
          token: response.token,
          user: response.user
        },
        msg: response.msg
      });
    }
    return res.status(200).json(response)
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      err: -1,
      msg: "Fail at auth controller"
    })
  }
}