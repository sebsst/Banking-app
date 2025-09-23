import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link
} from '@mui/material';
import { AccountBalance as BankIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password
    );
    
    if (result.success) {
      navigate('/accounts');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword;
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <BankIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Banking App
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Inscription
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="Prénom"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Nom"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmer le mot de passe"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'Les mots de passe ne correspondent pas'
                    : ''
                }
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading || !isFormValid()}
              >
                {loading ? 'Inscription...' : 'S\'inscrire'}
              </Button>
              <Box textAlign="center">
                <Link component={RouterLink} to="/login" variant="body2">
                  Déjà un compte ? Se connecter
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;