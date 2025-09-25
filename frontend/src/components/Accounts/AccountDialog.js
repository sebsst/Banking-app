import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import api from '../../services/api';

function AccountDialog({ open, account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'courant',
    iban: '',
    bankId: '',
    initialBalance: ''
  });
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBanks();
      
      if (account) {
        setFormData({
          name: account.name || '',
          type: account.type || 'courant',
          iban: account.iban || '',
          bankId: account.bankId || '',
          initialBalance: '' // Don't prefill for editing
        });
      } else {
        setFormData({
          name: '',
          type: 'courant',
          iban: '',
          bankId: '',
          initialBalance: ''
        });
      }
      setError('');
    }
  }, [account, open]);

  const fetchBanks = async () => {
    try {
      setBanksLoading(true);
      const response = await api.get('/banks');
      setBanks(response.data);
    } catch (error) {
      setError('Erreur lors de la récupération des banques');
    } finally {
      setBanksLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const formatIBAN = (iban) => {
    // Remove spaces and convert to uppercase
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    
    // Add spaces every 4 characters
    return cleanIBAN.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleIBANChange = (e) => {
    const formattedIBAN = formatIBAN(e.target.value);
    setFormData({
      ...formData,
      iban: formattedIBAN
    });
    setError('');
  };

  const validateIBAN = (iban) => {
    const cleanIBAN = iban.replace(/\s/g, '');
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    return cleanIBAN.length >= 15 && cleanIBAN.length <= 34 && ibanRegex.test(cleanIBAN);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!validateIBAN(formData.iban)) {
      setError('IBAN invalide');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        name: formData.name.trim(),
        type: formData.type,
        iban: formData.iban.replace(/\s/g, ''),
        bankId: parseInt(formData.bankId),
        initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : undefined
      };

      let response;
      if (account) {
        // Update existing account (no initial balance for updates)
        const { initialBalance, ...updateData } = dataToSend;
        response = await api.put(`/accounts/${account.id}`, updateData);
      } else {
        // Create new account
        response = await api.post('/accounts', dataToSend);
      }

      onSave(response.data.account);
    } catch (error) {
      const message = error.response?.data?.error || 
                     error.response?.data?.errors?.[0]?.msg || 
                     'Erreur lors de la sauvegarde';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.type && 
           formData.iban.trim() && 
           formData.bankId &&
           validateIBAN(formData.iban);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {account ? 'Modifier le compte' : 'Ajouter un compte'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nom du compte"
            type="text"
            fullWidth
            variant="outlined"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            helperText="Ex: Compte principal, Livret A..."
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth variant="outlined" margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Type de compte</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type de compte"
              disabled={loading}
            >
              <MenuItem value="courant">Compte courant</MenuItem>
              <MenuItem value="epargne">Compte épargne</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Banque</InputLabel>
            <Select
              name="bankId"
              value={formData.bankId}
              onChange={handleChange}
              label="Banque"
              disabled={loading || banksLoading}
              required
            >
              {banks.map((bank) => (
                <MenuItem key={bank.id} value={bank.id}>
                  {bank.name} {bank.code && `(${bank.code})`}
                </MenuItem>
              ))}
            </Select>
            {banks.length === 0 && !banksLoading && (
              <FormHelperText>
                Aucune banque disponible. Créez d'abord une banque.
              </FormHelperText>
            )}
          </FormControl>

          <TextField
            margin="dense"
            name="iban"
            label="IBAN"
            type="text"
            fullWidth
            variant="outlined"
            // required
            value={formData.iban}
            onChange={handleIBANChange}
            disabled={loading}
            helperText="Ex: FR76 3000 2005 5000 0015 7845 Z02"
            inputProps={{ style: { fontFamily: 'monospace' } }}
            sx={{ mb: 2 }}
          />

          {!account && (
            <TextField
              margin="dense"
              name="initialBalance"
              label="Solde initial (optionnel)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.initialBalance}
              onChange={handleChange}
              disabled={loading}
              helperText="Montant du solde initial en euros"
              inputProps={{
                step: "0.01",
                min: "-999999999999.99",
                max: "999999999999.99"
              }}
            />
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !isFormValid() || banks.length === 0}
          >
            {loading ? 'Sauvegarde...' : (account ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AccountDialog;