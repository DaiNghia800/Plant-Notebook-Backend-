const db = require("../../models/index")
const { v4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require("dotenv").config()

const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(12))

module.exports.loginService = async ({ email, password }) => {
  try {
    // Find user by email
    const user = await db.User.findOne({
      where: { email },
      raw: true,
      attributes: { include: ['password'] }
    })

    // Verify password
    const isCorrectPassword = user && bcrypt.compareSync(password, user.password)

    // Ensure the user has admin role (either role string = 'admin' or roleId set)
    const isAdmin = user && (user.role === 'admin' || !!user.roleId)

    if (!user) {
      return { err: 2, msg: 'Email not found!', token: null }
    }
    if (!isCorrectPassword) {
      return { err: 3, msg: 'Password is wrong!', token: null }
    }
    if (!isAdmin) {
      return { err: 4, msg: 'Unauthorized: Not an admin user', token: null }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, roleId: user.roleId }, process.env.SECRET_KEY, { expiresIn: "2d" })
    return { err: 0, msg: 'Login is successfully!', token }
  } catch (error) {
    console.log("Error", error);
    return { err: -1, msg: 'Login service error', token: null }
  }
}