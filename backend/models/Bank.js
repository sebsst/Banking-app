const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bank = sequelize.define('Bank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: [2, 20]
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

module.exports = Bank;