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
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';
import AccountDialog from './AccountDialog';
import ConfirmDialog from '../common/ConfirmDialog';

const accountTypeColors = {
  courant: 'primary',
  epargne: 'success'
};

const accountTypeLabels = {
  courant: 'Compte courant',
  epargne: 'Compte épargne'
};

function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      setError('Erreur lors de la récupération des comptes');
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setDialogOpen(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleDeleteAccount = (account) => {
    setDeleteDialog({ open: true, account });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/accounts/${deleteDialog.account.id}`);
      setAccounts(accounts.filter(a => a.id !== deleteDialog.account.id));
      setDeleteDialog({ open: false, account: null });
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la suppression';
      setError(message);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAccount(null);
  };

  const handleAccountSaved = (savedAccount) => {
    if (editingAccount) {
      // Update existing account
      setAccounts(accounts.map(a => a.id === savedAccount.id ? savedAccount : a));
    } else {
      // Add new account
      setAccounts([...accounts, savedAccount]);
    }
    handleDialogClose();
  };

  const formatIBAN = (iban) => {
    return iban.replace(/(.{4})/g, '$1 ').trim();
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
          Mes Comptes Bancaires
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateAccount}
        >
          Ajouter un compte
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
              <TableCell>Nom du compte</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Banque</TableCell>
              <TableCell>IBAN</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    Aucun compte trouvé. Commencez par créer votre premier compte.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {account.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={accountTypeLabels[account.type]}
                      color={accountTypeColors[account.type]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {account.bank.name}
                    </Typography>
                    {account.bank.code && (
                      <Typography variant="caption" color="text.secondary">
                        ({account.bank.code})
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {formatIBAN(account.iban)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(account.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEditAccount(account)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteAccount(account)}
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

      <AccountDialog
        open={dialogOpen}
        account={editingAccount}
        onClose={handleDialogClose}
        onSave={handleAccountSaved}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Supprimer le compte"
        message={`Êtes-vous sûr de vouloir supprimer le compte "${deleteDialog.account?.name}" ? Cette action supprimera également tous les soldes associés.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, account: null })}
      />
    </Box>
  );
}

export default AccountList;
  