import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';
import api from '../../services/api';
import DateFilters from '../common/DateFilters';
import { formatCurrency } from '../../utils/dateUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const colors = [
  '#1976d2',
  '#dc004e',
  '#2e7d32',
  '#ed6c02',
  '#9c27b0',
  '#d32f2f',
  '#1565c0',
  '#5e35b1',
  '#c62828',
  '#2e7d32'
];

function BalanceChart() {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    accountIds: [],
    bankId: '',
    period: '1y'
  });

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    period: '1y'
  });

  useEffect(() => {
    fetchAccounts();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchChartData();
    }
  }, [filters, dateRange, accounts]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
      // Select all accounts by default
      setFilters(prev => ({
        ...prev,
        accountIds: response.data.map(account => account.id)
      }));
    } catch (error) {
      setError('Erreur lors de la récupération des comptes');
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get('/banks');
      setBanks(response.data);
    } catch (error) {
      setError('Erreur lors de la récupération des banques');
    }
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.accountIds.length > 0) {
        params.append('accountIds', filters.accountIds.join(','));
      }
      if (filters.bankId) {
        params.append('bankId', filters.bankId);
      }
      if (dateRange.period) {
        params.append('period', dateRange.period);
      }

      const response = await api.get(`/balances/chart/data?${params.toString()}`);
      
      const datasets = response.data.chartData.map((accountData, index) => ({
        label: accountData.accountName,
        data: accountData.data.map(point => ({
          x: point.date,
          y: point.amount
        })),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.4,
        fill: false
      }));

      setChartData({ datasets });
    } catch (error) {
      setError('Erreur lors de la récupération des données du graphique');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (event) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      accountIds: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleBankChange = (event) => {
    const bankId = event.target.value;
    setFilters(prev => ({ 
      ...prev, 
      bankId,
      accountIds: bankId ? accounts.filter(acc => acc.bankId === parseInt(bankId)).map(acc => acc.id) : []
    }));
  };

  const handleDateFilterChange = (newFilters) => {
    setDateRange(newFilters);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des soldes bancaires'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            day: 'dd/MM',
            week: 'dd/MM',
            month: 'MM/yyyy',
            year: 'yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Solde (€)'
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const getSelectedAccountNames = (selected) => {
    return selected.map(id => 
      accounts.find(acc => acc.id === parseInt(id))?.name || ''
    ).filter(name => name).join(', ');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Graphiques d'évolution
      </Typography>

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
            <InputLabel>Banque</InputLabel>
            <Select
              value={filters.bankId}
              onChange={handleBankChange}
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

          <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Comptes</InputLabel>
            <Select
              multiple
              value={filters.accountIds.map(String)}
              onChange={handleAccountChange}
              input={<OutlinedInput label="Comptes" />}
              renderValue={(selected) => getSelectedAccountNames(selected)}
            >
              {accounts
                .filter(account => !filters.bankId || account.bankId === parseInt(filters.bankId))
                .map((account) => (
                <MenuItem key={account.id} value={account.id.toString()}>
                  <Checkbox checked={filters.accountIds.includes(account.id)} />
                  <ListItemText primary={`${account.name} (${account.bank.name})`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DateFilters
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            period={dateRange.period}
            onChange={handleDateFilterChange}
          />
        </Box>
      </Paper>

      {/* Chart */}
      <Paper sx={{ p: 2, height: 500 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : chartData.datasets.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">
              Aucune donnée à afficher avec ces critères
            </Typography>
          </Box>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </Paper>
    </Box>
  );
}

export default BalanceChart;