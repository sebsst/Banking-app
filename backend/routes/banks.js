const express = require('express');
const { body, validationResult } = require('express-validator');
const { Bank } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

// Get all banks
router.get('/', async (req, res) => {
  try {
    const banks = await Bank.findAll({
      order: [['name', 'ASC']]
    });
    res.json(banks);
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des banques' });
  }
});

// Get bank by ID
router.get('/:id', async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id);
    if (!bank) {
      return res.status(404).json({ error: 'Banque non trouvée' });
    }
    res.json(bank);
  } catch (error) {
    console.error('Get bank error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la banque' });
  }
});

// Create bank
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('code').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Le code doit contenir entre 2 et 20 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code } = req.body;

    const bank = await Bank.create({
      name,
      code: code || null
    });

    res.status(201).json({
      message: 'Banque créée avec succès',
      bank
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Une banque avec ce nom existe déjà' });
    }
    console.error('Create bank error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la banque' });
  }
});

// Update bank
router.put('/:id', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('code').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Le code doit contenir entre 2 et 20 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code } = req.body;
    const bank = await Bank.findByPk(req.params.id);

    if (!bank) {
      return res.status(404).json({ error: 'Banque non trouvée' });
    }

    await bank.update({
      name,
      code: code || null
    });

    res.json({
      message: 'Banque mise à jour avec succès',
      bank
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Une banque avec ce nom existe déjà' });
    }
    console.error('Update bank error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la banque' });
  }
});

// Delete bank
router.delete('/:id', async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id);

    if (!bank) {
      return res.status(404).json({ error: 'Banque non trouvée' });
    }

    await bank.destroy();

    res.json({ message: 'Banque supprimée avec succès' });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette banque car elle contient des comptes' 
      });
    }
    console.error('Delete bank error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la banque' });
  }
});

module.exports = router;