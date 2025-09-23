const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Check password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Connexion réussie',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations utilisateur' });
  }
});

module.exports = router;