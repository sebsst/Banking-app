import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';
import BankDialog from './BankDialog';
import ConfirmDialog from '../common/ConfirmDialog';

function BankList() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bank: null });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/banks');
      setBanks(response.data);
    } catch (error) {
      setError('Erreur lors de la récupération des banques');
      console.error('Error fetching banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = () => {
    setEditingBank(null);
    setDialogOpen(true);
  };

  const handleEditBank = (bank) => {
    setEditingBank(bank);
    setDialogOpen(true);
  };

  const handleDeleteBank = (bank) => {
    setDeleteDialog({ open: true, bank });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/banks/${deleteDialog.bank.id}`);
      setBanks(banks.filter(b => b.id !== deleteDialog.bank.id));
      setDeleteDialog({ open: false, bank: null });
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la suppression';
      setError(message);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBank(null);
  };

  const handleBankSaved = (savedBank) => {
    if (editingBank) {
      // Update existing bank
      setBanks(banks.map(b => b.id === savedBank.id ? savedBank : b));
    } else {
      // Add new bank
      setBanks([...banks, savedBank]);
    }
    handleDialogClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestion des Banques
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBank}
        >
          Ajouter une banque
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">
                    Aucune banque trouvée. Commencez par en créer une.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              banks.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {bank.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{bank.code || '-'}</TableCell>
                  <TableCell>
                    {new Date(bank.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditBank(bank)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteBank(bank)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <BankDialog
        open={dialogOpen}
        bank={editingBank}
        onClose={handleDialogClose}
        onSave={handleBankSaved}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Supprimer la banque"
        message={`Êtes-vous sûr de vouloir supprimer la banque "${deleteDialog.bank?.name}" ? Cette action est irréversible.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, bank: null })}
      />
    </Box>
  );
}

export default BankList;