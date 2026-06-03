const db = require('../models');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    const email = 'admin@gmail.com';
    const password = 'admin';
    
    // Hash password with 10 salt rounds (same as client auth registration)
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Find or create admin user
    const [user, created] = await db.User.findOrCreate({
      where: { email },
      defaults: {
        id: 'admin-default-id-uuid-v4',
        fullName: 'System Administrator',
        name: 'System Admin',
        password: hashedPassword,
        authProvider: 'local'
      }
    });

    if (!created) {
      // If user already exists, update password to ensure it matches 'admin'
      user.password = hashedPassword;
      await user.save();
      console.log(`Admin user '${email}' already exists. Password updated successfully.`);
    } else {
      console.log(`Admin user '${email}' created successfully with password '${password}'.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
