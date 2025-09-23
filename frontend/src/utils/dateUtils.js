import { format, subDays, subMonths, subYears } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  return format(new Date(date), formatStr, { locale: fr });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const getDateRange = (period) => {
  const now = new Date();
  let startDate = null;

  switch (period) {
    case '1d':
      startDate = subDays(now, 1);
      break;
    case '7d':
      startDate = subDays(now, 7);
      break;
    case '30d':
      startDate = subDays(now, 30);
      break;
    case '6m':
      startDate = subMonths(now, 6);
      break;
    case '1y':
      startDate = subYears(now, 1);
      break;
    default:
      return { startDate: null, endDate: null };
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(now, 'yyyy-MM-dd')
  };
};

export const periodLabels = {
  '1d': 'Aujourd\'hui',
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '6m': '6 derniers mois',
  '1y': 'Dernière année',
  'all': 'Toute la période'
};