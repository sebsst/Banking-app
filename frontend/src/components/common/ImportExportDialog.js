import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Divider
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import api from '../../services/api';

function ImportExportDialog({ open, mode, onClose, onImportComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [csvData, setCsvData] = useState('');

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/balances/export/csv', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `banking-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Export réussi ! Le fichier a été téléchargé.');
    } catch (error) {
      setError('Erreur lors de l\'export : ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!csvData.trim()) {
        setError('Veuillez coller des données CSV');
        return;
      }

      const response = await api.post('/balances/import/csv', {
        csvData: csvData.trim()
      });
      
      setSuccess(`Import réussi ! ${response.data.imported} soldes ont été importés.`);
      setCsvData('');
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setError('Erreur lors de l\'import : ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target.result);
      };
      reader.readAsText(file);
    } else {
      setError('Veuillez sélectionner un fichier CSV valide');
    }
  };

  const handleClose = () => {
    setCsvData('');
    setError('');
    setSuccess('');
    onClose();
  };

  const csvExample = `Date,Banque,Compte,Type,IBAN,Montant
2024-01-15,BNP Paribas,Compte Principal,courant,FR76300020055000001578450,1500.50
2024-01-16,Crédit Agricole,Livret A,epargne,FR14200030124000045678901,2000.00`;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'export' ? 'Exporter les données' : 'Importer les données'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {mode === 'export' ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Télécharger toutes vos données de comptes et soldes au format CSV.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Le fichier contiendra : date, banque, compte, type, IBAN, montant
            </Typography>
            
            {loading ? (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={20} />
                <Typography>Génération du fichier...</Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                size="large"
              >
                Télécharger CSV
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Importer des données depuis un fichier CSV ou coller directement les données.
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Option 1 : Sélectionner un fichier CSV
              </Typography>
              <input
                accept=".csv"
                type="file"
                onChange={handleFileUpload}
                style={{ marginBottom: 16 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Option 2 : Coller les données CSV
              </Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                placeholder="Coller vos données CSV ici..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Format attendu :
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 1, 
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}
              >
                {csvExample}
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Important :</strong> Les comptes et banques doivent déjà exister dans l'application.
              Seuls les soldes seront importés.
            </Typography>

            {loading ? (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={20} />
                <Typography>Import en cours...</Typography>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handleImportCSV}
                disabled={!csvData.trim()}
                size="large"
              >
                Importer les données
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportExportDialog;