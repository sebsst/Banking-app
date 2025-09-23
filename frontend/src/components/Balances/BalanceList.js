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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';
import BalanceDialog from './BalanceDialog';
import DateFilters from '../common/DateFilters';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

function BalanceList() {
  const [balances, setBalances] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBalance, setEditingBalance] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, balance: null });
  
  // Filters
  const [filters, setFilters] = useState({
    accountId: '',
    bankId: '',
    startDate: '',
    endDate: '',
    period: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchAccounts();
    fetchBanks();
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [filters, pagination.page]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get('/banks');
      setBanks(response.data);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.bankId) params.append('bankId', filters.bankId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      const response = await api.get(`/balances?${params.toString()}`);
      setBalances(response.data.balances);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }));
    } catch (error) {
      setError('Erreur lors de la récupération des soldes');
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBalance = () => {
    setEditingBalance(null);
    setDialogOpen(true);
  };

  const handleEditBalance = (balance) => {
    setEditingBalance(balance);
    setDialogOpen(true);
  };

  const handleDeleteBalance = (balance) => {
    setDeleteDialog({ open: true, balance });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/balances/${deleteDialog.balance.id}`);
      fetchBalances(); // Refresh the list
      setDeleteDialog({ open: false, balance: null });
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la suppression';
      setError(message);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBalance(null);
  };

  const handleBalanceSaved = () => {
    fetchBalances(); // Refresh the list
    handleDialogClose();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleAccountFilterChange = (event) => {
    const accountId = event.target.value;
    setFilters(prev => ({ ...prev, accountId, bankId: '' })); // Clear bank filter
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBankFilterChange = (event) => {
    const bankId = event.target.value;
    setFilters(prev => ({ ...prev, bankId, accountId: '' })); // Clear account filter
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      accountId: '',
      bankId: '',
      startDate: '',
      endDate: '',
      period: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Historique des Soldes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBalance}
        >
          Ajouter un solde
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtres
        </Typography>
        
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Compte</InputLabel>
            <Select
              value={filters.accountId}
              onChange={handleAccountFilterChange}
              label="Compte"
            >
              <MenuItem value="">Tous les comptes</MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({account.bank.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Banque</InputLabel>
            <Select
              value={filters.bankId}
              onChange={handleBankFilterChange}
              label="Banque"
            >
              <MenuItem value="">Toutes les banques</MenuItem>
              {banks.map((bank) => (
                <MenuItem key={bank.id} value={bank.id}>
                  {bank.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DateFilters
            startDate={filters.startDate}
            endDate={filters.endDate}
            period={filters.period}
            onChange={handleFilterChange}
          />

          <Button variant="outlined" onClick={clearFilters}>
            Effacer les filtres
          </Button>
        </Box>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Table */}
      {!loading && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Compte</TableCell>
                  <TableCell>Banque</TableCell>
                  <TableCell align="right">Montant</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        Aucun solde trouvé avec ces critères.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  balances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell>
                        {formatDate(balance.date)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {balance.account.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {balance.account.type === 'courant' ? 'Compte courant' : 'Compte épargne'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {balance.account.bank.name}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body1" 
                          fontWeight="medium"
                          color={parseFloat(balance.amount) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(balance.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleEditBalance(balance)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteBalance(balance)}
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <BalanceDialog
        open={dialogOpen}
        balance={editingBalance}
        onClose={handleDialogClose}
        onSave={handleBalanceSaved}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Supprimer le solde"
        message={`Êtes-vous sûr de vouloir supprimer ce solde du ${deleteDialog.balance?.date} ?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, balance: null })}
      />
    </Box>
  );
}

export default BalanceList;