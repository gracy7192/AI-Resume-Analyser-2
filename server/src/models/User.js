/**
 * User Model
 * -----------
 * Represents a registered user in the system.
 *
 * Fields:
 *   - id         : Auto-incrementing primary key
 *   - name       : User's full name
 *   - email      : Unique email address (used for login)
 *   - password   : Hashed password (NEVER store plain text!)
 *   - role       : Either 'user' or 'admin'
 *   - created_at : When the account was created (auto)
 *
 * WHY bcrypt?
 *   - bcrypt is a slow hashing algorithm by design.
 *   - This makes brute-force attacks very expensive.
 *   - We hash the password BEFORE saving it to the database.
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name cannot be empty' },
      len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'Email already registered' },
    validate: {
      isEmail: { msg: 'Please provide a valid email address' },
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
    },
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
  // Hook: hash password before saving to database
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10); // 10 rounds of salting
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

/**
 * Compare a plain-text password with the hashed password in the database.
 * Returns true if they match, false otherwise.
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Return user data WITHOUT the password field.
 * Use this when sending user info to the frontend.
 */
User.prototype.toSafeObject = function () {
  const { id, name, email, role, created_at } = this.toJSON();
  return { id, name, email, role, created_at };
};

module.exports = User;
