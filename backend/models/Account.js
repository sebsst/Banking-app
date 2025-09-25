const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  type: {
    type: DataTypes.ENUM('courant', 'epargne'),
    allowNull: false,
    defaultValue: 'courant'
  },
  iban: {
    type: DataTypes.STRING(34),
    allowNull: true,
    unique: true,
    validate: {
      len: [15, 34],
      isIBAN(value) {
        // Basic IBAN validation (simplified) - only if provided
        if (value && value.trim()) {
          const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
          if (!ibanRegex.test(value.replace(/\s/g, ''))) {
            throw new Error('Format IBAN invalide');
          }
        }
      }
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bankId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Banks',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['iban']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['bankId']
    }
  ]
});

module.exports = Account;