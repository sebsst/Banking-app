import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { getDateRange, periodLabels } from '../../utils/dateUtils';

function DateFilters({ startDate, endDate, period, onChange }) {
  const handlePeriodChange = (event) => {
    const selectedPeriod = event.target.value;
    
    if (selectedPeriod === '') {
      // Clear all date filters
      onChange({
        period: '',
        startDate: '',
        endDate: ''
      });
    } else {
      const range = getDateRange(selectedPeriod);
      onChange({
        period: selectedPeriod,
        startDate: range.startDate || '',
        endDate: range.endDate || ''
      });
    }
  };

  const handleStartDateChange = (newDate) => {
    onChange({
      period: '', // Clear period when custom date is selected
      startDate: newDate ? newDate.toISOString().split('T')[0] : '',
      endDate
    });
  };

  const handleEndDateChange = (newDate) => {
    onChange({
      period: '', // Clear period when custom date is selected
      startDate,
      endDate: newDate ? newDate.toISOString().split('T')[0] : ''
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Box display="flex" gap={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={period}
            onChange={handlePeriodChange}
            label="Période"
          >
            <MenuItem value="">Personnalisée</MenuItem>
            {Object.entries(periodLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Date de début"
          value={startDate ? new Date(startDate) : null}
          onChange={handleStartDateChange}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{ minWidth: 150 }}
            />
          )}
          format="dd/MM/yyyy"
        />

        <DatePicker
          label="Date de fin"
          value={endDate ? new Date(endDate) : null}
          onChange={handleEndDateChange}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{ minWidth: 150 }}
            />
          )}
          format="dd/MM/yyyy"
        />
      </Box>
    </LocalizationProvider>
  );
}

export default DateFilters;