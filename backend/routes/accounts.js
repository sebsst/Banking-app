const express = require('express');
const { body, validationResult } = require('express-validator');
const { Account, Bank, Balance } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

// Get user's accounts with balance information
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['id', 'name', 'code']
        },
        {
          model: Balance,
          as: 'balances',
          attributes: ['amount', 'date'],
          order: [['date', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate statistics for each account
    const accountsWithStats = accounts.map(account => {
      const balances = account.balances || [];
      const initialBalance = balances.length > 0 ? parseFloat(balances[0].amount) : 0;
      const currentBalance = balances.length > 0 ? parseFloat(balances[balances.length - 1].amount) : 0;
      
      let evolutionPercentage = 0;
      if (initialBalance !== 0 && balances.length > 1) {
        evolutionPercentage = ((currentBalance - initialBalance) / Math.abs(initialBalance)) * 100;
      }

      return {
        ...account.toJSON(),
        statistics: {
          initialBalance,
          currentBalance,
          evolutionPercentage: Math.round(evolutionPercentage * 100) / 100,
          balanceCount: balances.length
        }
      };
    });

    res.json(accountsWithStats);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des comptes' });
  }
});

// Get account by ID
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du compte' });
  }
});

// Create account
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('type').isIn(['courant', 'epargne']).withMessage('Type de compte invalide'),
  body('iban').trim().isLength({ min: 15, max: 34 }).withMessage('IBAN invalide'),
  body('bankId').isInt({ min: 1 }).withMessage('Banque invalide'),
  body('initialBalance').optional().isDecimal().withMessage('Solde initial invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, iban, bankId, initialBalance } = req.body;

    // Check if bank exists
    const bank = await Bank.findByPk(bankId);
    if (!bank) {
      return res.status(400).json({ error: 'Banque non trouvée' });
    }

    // Create account
    const account = await Account.create({
      name,
      type,
      iban: iban.replace(/\s/g, '').toUpperCase(),
      bankId,
      userId: req.user.id
    });

    // Create initial balance if provided
    if (initialBalance !== undefined && initialBalance !== null && initialBalance !== '') {
      await Balance.create({
        amount: parseFloat(initialBalance),
        date: new Date().toISOString().split('T')[0],
        accountId: account.id
      });
    }

    // Return account with bank info
    const accountWithBank = await Account.findByPk(account.id, {
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      account: accountWithBank
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Un compte avec cet IBAN existe déjà' });
    }
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Update account
router.put('/:id', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('type').isIn(['courant', 'epargne']).withMessage('Type de compte invalide'),
  body('iban').trim().isLength({ min: 15, max: 34 }).withMessage('IBAN invalide'),
  body('bankId').isInt({ min: 1 }).withMessage('Banque invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, iban, bankId } = req.body;
    
    const account = await Account.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    // Check if bank exists
    const bank = await Bank.findByPk(bankId);
    if (!bank) {
      return res.status(400).json({ error: 'Banque non trouvée' });
    }

    await account.update({
      name,
      type,
      iban: iban.replace(/\s/g, '').toUpperCase(),
      bankId
    });

    // Return account with bank info
    const accountWithBank = await Account.findByPk(account.id, {
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      message: 'Compte mis à jour avec succès',
      account: accountWithBank
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Un compte avec cet IBAN existe déjà' });
    }
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du compte' });
  }
});

// Delete account
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }

    await account.destroy();

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
  }
});

module.exports = router