const authService = require("../../services/admin/auth.service")

module.exports.login = async (req, res) => {
  const { email, password } = req.body || {}
  try {
    if(!email || !password){
      return res.status(400).json({
        err: 1,
        msg: "Missing input!"
      })
    }

    const response = await authService.loginService(req.body)
    return res.status(200).json(response)
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Fail at auth controller"
    })
  }
}