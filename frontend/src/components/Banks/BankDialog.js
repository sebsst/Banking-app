import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import api from '../../services/api';

function BankDialog({ open, bank, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bank) {
      setFormData({
        name: bank.name || '',
        code: bank.code || ''
      });
    } else {
      setFormData({
        name: '',
        code: ''
      });
    }
    setError('');
  }, [bank, open]);

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

    try {
      const dataToSend = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined
      };

      let response;
      if (bank) {
        // Update existing bank
        response = await api.put(`/banks/${bank.id}`, dataToSend);
      } else {
        // Create new bank
        response = await api.post('/banks', dataToSend);
      }

      onSave(response.data.bank);
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {bank ? 'Modifier la banque' : 'Ajouter une banque'}
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
            label="Nom de la banque"
            type="text"
            fullWidth
            variant="outlined"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            helperText="Ex: BNP Paribas, Crédit Agricole..."
          />
          
          <TextField
            margin="dense"
            name="code"
            label="Code (optionnel)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.code}
            onChange={handleChange}
            disabled={loading}
            helperText="Code court pour identifier la banque (ex: BNP, CA...)"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Sauvegarde...' : (bank ? 'Modifier' : 'Ajouter')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default BankDialog;