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
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';

function BalanceDialog({ open, balance, onClose, onSave }) {
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date(),
    accountId: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAccounts();
      
      if (balance) {
        setFormData({
          amount: balance.amount.toString(),
          date: new Date(balance.date),
          accountId: balance.accountId
        });
      } else {
        setFormData({
          amount: '',
          date: new Date(),
          accountId: ''
        });
      }
      setError('');
    }
  }, [balance, open]);

  const fetchAccounts = async () => {
    try {
      setAccountsLoading(true);
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      setError('Erreur lors de la récupération des comptes');
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        amount: parseFloat(formData.amount),
        date: formData.date.toISOString().split('T')[0],
        accountId: parseInt(formData.accountId)
      };

      let response;
      if (balance) {
        // Update existing balance
        response = await api.put(`/balances/${balance.id}`, dataToSend);
      } else {
        // Create new balance
        response = await api.post('/balances', dataToSend);
      }

      onSave(response.data.balance);
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
    return formData.amount !== '' && 
           formData.date && 
           formData.accountId;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {balance ? 'Modifier le solde' : 'Ajouter un solde'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth variant="outlined" margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Compte</InputLabel>
              <Select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                label="Compte"
                disabled={loading || accountsLoading}
                required
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} - {account.bank.name} ({account.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              name="amount"
              label="Montant (€)"
              type="number"
              fullWidth
              variant="outlined"
              required
              value={formData.amount}
              onChange={handleChange}
              disabled={loading}
              inputProps={{
                step: "0.01",
                min: "-999999999999.99",
                max: "999999999999.99"
              }}
              helperText="Montant en euros (positif ou négatif)"
              sx={{ mb: 2 }}
            />

            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  required
                  helperText="Date du relevé de solde"
                />
              )}
              format="dd/MM/yyyy"
              sx={{ mb: 2 }}
            />
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || !isFormValid() || accounts.length === 0}
            >
              {loading ? 'Sauvegarde...' : (balance ? 'Modifier' : 'Ajouter')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}

export default BalanceDialog;