const db = require("../../models/index")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require("dotenv").config()

module.exports.loginService = async ({ email, password }) => {
  try {
    // Find user by email
    const user = await db.User.findOne({
      where: { email },
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [{ model: db.Permission, as: 'permissions' }]
        }
      ]
    })

    // Verify password
    const isCorrectPassword = user && bcrypt.compareSync(password, user.password)

    // Ensure the user has admin role (either role string = 'admin' or roleId set)
    // Lưu ý: user.role trả về Role object (do alias), dùng getDataValue để lấy cột string
    const isAdmin = user && (user.getDataValue('role') === 'admin' || !!user.roleId)

    if (!user) {
      return { err: 2, msg: 'Email not found!', token: null }
    }
    if (!isCorrectPassword) {
      return { err: 3, msg: 'Password is wrong!', token: null }
    }
    if (!isAdmin) {
      return { err: 4, msg: 'Unauthorized: Not an admin user', token: null }
    }

    // user.role trả về Role object (do alias 'role'), dùng getDataValue để lấy cột string gốc
    const roleString = user.getDataValue('role');
    const roleObject = user.role; // Sequelize association object (Role model)

    const token = jwt.sign({ id: user.id, email: user.email, role: roleString, roleId: user.roleId }, process.env.SECRET_KEY, { expiresIn: "2d" })
    return {
      err: 0,
      msg: 'Login is successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: roleString,
        roleId: user.roleId,
        Role: roleObject
      }
    }
  } catch (error) {
    console.log("Error", error);
    return { err: -1, msg: 'Login service error', token: null }
  }
}