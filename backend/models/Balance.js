const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Balance = sequelize.define('Balance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: -999999999999.99,
      max: 999999999999.99
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true
    }
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Accounts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  indexes: [
    {
      fields: ['accountId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['accountId', 'date']
    }
  ]
});

module.exports = Balance;