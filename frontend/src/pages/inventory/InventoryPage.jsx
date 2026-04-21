import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { getAllInventory, getAllTransactions, stockIn, stockOut } from '../../api/inventoryApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const InventoryPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [tab, setTab] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustDialog, setAdjustDialog] = useState({ open: false, type: '', productId: null, productName: '' });
  const [adjustForm, setAdjustForm] = useState({ quantity: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [invRes, txRes] = await Promise.all([getAllInventory(), getAllTransactions()]);
      setInventory(Array.isArray(invRes.data) ? invRes.data : []);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
    } catch {
      enqueueSnackbar('Failed to load inventory', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdjust = (type, productId, productName) => {
    setAdjustDialog({ open: true, type, productId, productName });
    setAdjustForm({ quantity: '', notes: '' });
  };

  const handleAdjust = async () => {
    const qty = parseInt(adjustForm.quantity);
    if (!qty || qty <= 0) {
      enqueueSnackbar('Enter a valid quantity', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const payload = { productId: adjustDialog.productId, quantity: qty, notes: adjustForm.notes };
      if (adjustDialog.type === 'IN') {
        await stockIn(payload);
        enqueueSnackbar('Stock added successfully', { variant: 'success' });
      } else {
        await stockOut(payload);
        enqueueSnackbar('Stock removed successfully', { variant: 'success' });
      }
      setAdjustDialog({ open: false, type: '', productId: null, productName: '' });
      fetchData();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Operation failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'error' };
    if (item.quantity <= (item.product?.reorderLevel || 10)) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  if (loading) return <LoadingSpinner message="Loading inventory..." />;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Inventory Management</Typography>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Tab label={`Stock Levels (${inventory.length})`} />
          <Tab label={`Transactions (${transactions.length})`} />
        </Tabs>

        {/* Stock Levels Tab */}
        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reorder Level</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Updated</TableCell>
                  {canEdit && <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        backgroundColor: item.quantity === 0 ? 'rgba(244,67,54,0.05)' : item.quantity <= (item.product?.reorderLevel || 10) ? 'rgba(255,152,0,0.05)' : 'transparent',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{item.product?.name}</TableCell>
                      <TableCell><Chip label={item.product?.sku} size="small" variant="outlined" /></TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.quantity}</TableCell>
                      <TableCell>{item.product?.reorderLevel}</TableCell>
                      <TableCell><Chip label={status.label} size="small" color={status.color} /></TableCell>
                      <TableCell>{formatDateTime(item.lastUpdated)}</TableCell>
                      {canEdit && (
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => openAdjust('IN', item.product?.id, item.product?.name)}
                            title="Stock In"
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openAdjust('OUT', item.product?.id, item.product?.name)}
                            title="Stock Out"
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {inventory.length === 0 && (
                  <TableRow><TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No inventory data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Transactions Tab */}
        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Performed By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{tx.product?.name}</TableCell>
                    <TableCell><Chip label={tx.type} size="small" color={tx.type === 'IN' ? 'success' : 'error'} variant="outlined" /></TableCell>
                    <TableCell>{tx.quantity}</TableCell>
                    <TableCell>{tx.referenceNumber || '-'}</TableCell>
                    <TableCell>{tx.notes || '-'}</TableCell>
                    <TableCell>{tx.performedBy?.fullName || '-'}</TableCell>
                    <TableCell>{formatDateTime(tx.transactionDate)}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No transactions</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Stock Adjust Dialog */}
      <Dialog open={adjustDialog.open} onClose={() => setAdjustDialog({ ...adjustDialog, open: false })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {adjustDialog.type === 'IN' ? '📦 Stock In' : '📤 Stock Out'} — {adjustDialog.productName}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={adjustForm.quantity}
            onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
            autoFocus
          />
          <TextField
            label="Notes (optional)"
            fullWidth
            multiline
            rows={2}
            value={adjustForm.notes}
            onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAdjustDialog({ ...adjustDialog, open: false })} color="inherit">Cancel</Button>
          <Button onClick={handleAdjust} variant="contained" color={adjustDialog.type === 'IN' ? 'success' : 'error'} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : (adjustDialog.type === 'IN' ? 'Add Stock' : 'Remove Stock')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;
