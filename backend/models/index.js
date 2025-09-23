const sequelize = require('../config/database');
const User = require('./User');
const Bank = require('./Bank');
const Account = require('./Account');
const Balance = require('./Balance');

// Define associations
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Bank.hasMany(Account, { foreignKey: 'bankId', as: 'accounts' });
Account.belongsTo(Bank, { foreignKey: 'bankId', as: 'bank' });

Account.hasMany(Balance, { foreignKey: 'accountId', as: 'balances' });
Balance.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

module.exports = {
  sequelize,
  User,
  Bank,
  Account,
  Balance
};