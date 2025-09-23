import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = "Confirmer", cancelText = "Annuler" }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;