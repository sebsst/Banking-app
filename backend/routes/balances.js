const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Balance, Account, Bank } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

// Get balances with filters
router.get('/', [
  query('accountId').optional().isInt({ min: 1 }).withMessage('ID de compte invalide'),
  query('bankId').optional().isInt({ min: 1 }).withMessage('ID de banque invalide'),
  query('startDate').optional().isISO8601().withMessage('Date de début invalide'),
  query('endDate').optional().isISO8601().withMessage('Date de fin invalide'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountId, bankId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};
    
    if (startDate) {
      whereConditions.date = { [Op.gte]: startDate };
    }
    
    if (endDate) {
      if (whereConditions.date) {
        whereConditions.date[Op.lte] = endDate;
      } else {
        whereConditions.date = { [Op.lte]: endDate };
      }
    }

    // Build include conditions
    const includeConditions = {
      model: Account,
      as: 'account',
      where: { userId: req.user.id },
      attributes: ['id', 'name', 'type', 'iban'],
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['id', 'name', 'code']
        }
      ]
    };

    if (accountId) {
      includeConditions.where.id = accountId;
    }

    if (bankId) {
      includeConditions.include[0].where = { id: bankId };
    }

    const { count, rows: balances } = await Balance.findAndCountAll({
      where: whereConditions,
      include: [includeConditions],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      balances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des soldes' });
  }
});

// Get balance by ID
router.get('/:id', async (req, res) => {
  try {
    const balance = await Balance.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { userId: req.user.id },
          attributes: ['id', 'name', 'type', 'iban'],
          include: [
            {
              model: Bank,
              as: 'bank',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    });

    if (!balance) {
      return res.status(404).json({ error: 'Solde non trouvé' });
    }

    res.json(balance);
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du solde' });
  }
});

// Create balance
router.post('/', [
  body('amount').isDecimal().withMessage('Montant invalide'),
  body('date').isISO8601().toDate().withMessage('Date invalide'),
  body('accountId').isInt({ min: 1 }).withMessage('ID de compte invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, date, accountId } = req.body;

    // Check if account belongs to user
    const account = await Account.findOne({
      where: { 
        id: accountId,
        userId: req.user.id 
      }
    });

    if (!account) {
      return res.status(400).json({ error: 'Compte non trouvé' });
    }

    const balance = await Balance.create({
      amount: parseFloat(amount),
      date: new Date(date).toISOString().split('T')[0],
      accountId
    });

    // Return balance with account and bank info
    const balanceWithDetails = await Balance.findByPk(balance.id, {
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'name', 'type', 'iban'],
          include: [
            {
              model: Bank,
              as: 'bank',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Solde créé avec succès',
      balance: balanceWithDetails
    });
  } catch (error) {
    console.error('Create balance error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du solde' });
  }
});

// Update balance
router.put('/:id', [
  body('amount').isDecimal().withMessage('Montant invalide'),
  body('date').isISO8601().toDate().withMessage('Date invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, date } = req.body;

    const balance = await Balance.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { userId: req.user.id }
        }
      ]
    });

    if (!balance) {
      return res.status(404).json({ error: 'Solde non trouvé' });
    }

    await balance.update({
      amount: parseFloat(amount),
      date: new Date(date).toISOString().split('T')[0]
    });

    // Return balance with account and bank info
    const balanceWithDetails = await Balance.findByPk(balance.id, {
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'name', 'type', 'iban'],
          include: [
            {
              model: Bank,
              as: 'bank',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    });

    res.json({
      message: 'Solde mis à jour avec succès',
      balance: balanceWithDetails
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du solde' });
  }
});

// Delete balance
router.delete('/:id', async (req, res) => {
  try {
    const balance = await Balance.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Account,
          as: 'account',
          where: { userId: req.user.id }
        }
      ]
    });

    if (!balance) {
      return res.status(404).json({ error: 'Solde non trouvé' });
    }

    await balance.destroy();

    res.json({ message: 'Solde supprimé avec succès' });
  } catch (error) {
    console.error('Delete balance error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du solde' });
  }
});

// Get chart data
router.get('/chart/data', [
  query('accountIds').optional().custom((value) => {
    if (value) {
      const ids = value.split(',').map(id => parseInt(id));
      if (ids.some(id => isNaN(id))) {
        throw new Error('IDs de comptes invalides');
      }
    }
    return true;
  }),
  query('bankId').optional().isInt({ min: 1 }).withMessage('ID de banque invalide'),
  query('period').optional().isIn(['1d', '7d', '30d', '6m', '1y', 'all']).withMessage('Période invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accountIds, bankId, period = 'all' } = req.query;

    // Calculate date range
    let startDate = null;
    const now = new Date();
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    // Build where conditions
    const whereConditions = {};
    if (startDate) {
      whereConditions.date = { [Op.gte]: startDate.toISOString().split('T')[0] };
    }

    // Build include conditions
    const includeConditions = {
      model: Account,
      as: 'account',
      where: { userId: req.user.id },
      attributes: ['id', 'name', 'type', 'iban'],
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['id', 'name', 'code']
        }
      ]
    };

    if (accountIds) {
      const ids = accountIds.split(',').map(id => parseInt(id));
      includeConditions.where.id = { [Op.in]: ids };
    }

    if (bankId) {
      includeConditions.include[0].where = { id: bankId };
    }

    const balances = await Balance.findAll({
      where: whereConditions,
      include: [includeConditions],
      order: [['date', 'ASC']]
    });

    // Group data by account for chart
    const chartData = {};
    balances.forEach(balance => {
      const accountId = balance.account.id;
      const accountName = `${balance.account.name} (${balance.account.bank.name})`;
      
      if (!chartData[accountId]) {
        chartData[accountId] = {
          accountName,
          data: []
        };
      }
      
      chartData[accountId].data.push({
        date: balance.date,
        amount: parseFloat(balance.amount)
      });
    });

    res.json({ chartData: Object.values(chartData) });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données du graphique' });
  }
});

module.exports = router;