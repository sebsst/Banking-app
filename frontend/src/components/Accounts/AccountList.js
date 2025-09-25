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
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import api from '../../services/api';
import AccountDialog from './AccountDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import ImportExportDialog from '../common/ImportExportDialog';
import { formatCurrency } from '../../utils/dateUtils';

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
  const [importExportDialog, setImportExportDialog] = useState({ open: false, mode: 'export' });

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

  const handleExport = () => {
    setImportExportDialog({ open: true, mode: 'export' });
  };

  const handleImport = () => {
    setImportExportDialog({ open: true, mode: 'import' });
  };

  const formatIBAN = (iban) => {
    if (!iban) return 'Non renseigné';
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  const getEvolutionIcon = (percentage) => {
    if (percentage > 0) {
      return <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />;
    } else if (percentage < 0) {
      return <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />;
    }
    return null;
  };

  const getEvolutionColor = (percentage) => {
    if (percentage > 0) return 'success.main';
    if (percentage < 0) return 'error.main';
    return 'text.secondary';
  };

  // Calculate global statistics
  const globalStats = accounts.reduce((stats, account) => {
    if (account.statistics) {
      stats.totalInitial += account.statistics.initialBalance || 0;
      stats.totalCurrent += account.statistics.currentBalance || 0;
      stats.accountsCount += 1;
    }
    return stats;
  }, { totalInitial: 0, totalCurrent: 0, accountsCount: 0 });

  const globalEvolution = globalStats.totalInitial !== 0 ? 
    ((globalStats.totalCurrent - globalStats.totalInitial) / Math.abs(globalStats.totalInitial)) * 100 : 0;

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
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={handleImport}
          >
            Importer
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Exporter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateAccount}
          >
            Ajouter un compte
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Global Statistics */}
      {accounts.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Solde Initial Total
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(globalStats.totalInitial)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Solde Actuel Total
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(globalStats.totalCurrent)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Évolution Globale
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getEvolutionIcon(globalEvolution)}
                  <Typography 
                    variant="h6"
                    sx={{ color: getEvolutionColor(globalEvolution) }}
                  >
                    {globalEvolution > 0 ? '+' : ''}{globalEvolution.toFixed(2)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Nombre de Comptes
                </Typography>
                <Typography variant="h6">
                  {globalStats.accountsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom du compte</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Banque</TableCell>
              <TableCell>IBAN</TableCell>
              <TableCell align="right">Solde Initial</TableCell>
              <TableCell align="right">Solde Actuel</TableCell>
              <TableCell align="right">Évolution</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
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
                  <TableCell align="right">
                    <Typography variant="body2">
                      {account.statistics ? 
                        formatCurrency(account.statistics.initialBalance) : 
                        'N/A'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      sx={{ 
                        color: account.statistics && account.statistics.currentBalance >= 0 ? 
                          'success.main' : 'error.main' 
                      }}
                    >
                      {account.statistics ? 
                        formatCurrency(account.statistics.currentBalance) : 
                        'N/A'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {account.statistics && account.statistics.balanceCount > 1 ? (
                      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                        {getEvolutionIcon(account.statistics.evolutionPercentage)}
                        <Typography 
                          variant="body2"
                          sx={{ color: getEvolutionColor(account.statistics.evolutionPercentage) }}
                        >
                          {account.statistics.evolutionPercentage > 0 ? '+' : ''}
                          {account.statistics.evolutionPercentage}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
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

      <ImportExportDialog
        open={importExportDialog.open}
        mode={importExportDialog.mode}
        onClose={() => setImportExportDialog({ open: false, mode: 'export' })}
        onImportComplete={fetchAccounts}
      />
    </Box>
  );
}

export default AccountList;
