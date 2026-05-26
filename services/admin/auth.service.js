const db = require("../../models/index")
const { v4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require("dotenv").config()

const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(12))

module.exports.loginService = async ({email, password}) => {
  try{
    const response = await db.User.findOne({
      where: { email },
      raw: true
    })
    const isCorrectPassword = response && bcrypt.compareSync(password, response.password)
    
    const token = isCorrectPassword && jwt.sign({id: response.id, email: response.email}, process.env.SECRET_KEY, { expiresIn: "2d" })
    return ({
      err: token ? 0 : 2,
      msg: token ? "Login is successfully!" : response ? "Password is wrong!" : "Phone number not found!",
      token: token || null
    })
  } catch (error){
    return error
  }
}