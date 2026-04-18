import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders, getOrdersByType, getOrdersByStatus, createOrder } from '../../api/orderApi';
import { getActiveProducts } from '../../api/productApi';
import RoleGuard from '../../components/common/RoleGuard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime, getStatusColor } from '../../utils/formatters';
import {
  Box, Card, Typography, Button, Tabs, Tab, Chip, MenuItem, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Autocomplete
} from '@mui/material';
import { Add, Visibility, Delete as DeleteIcon } from '@mui/icons-material';

const OrderListPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderForm, setOrderForm] = useState({ orderType: 'SALES', notes: '', items: [{ productId: null, quantity: 1, unitPrice: 0 }] });
  const [saving, setSaving] = useState(false);

  const tabTypes = ['', 'SALES', 'PURCHASE'];

  const fetchOrders = async () => {
    try {
      let res;
      if (tabTypes[tab]) {
        res = await getOrdersByType(tabTypes[tab]);
      } else {
        res = await getAllOrders();
      }
      let data = Array.isArray(res.data) ? res.data : [];
      if (statusFilter) {
        data = data.filter((o) => o.status === statusFilter);
      }
      setOrders(data);
    } catch {
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [tab, statusFilter]);

  const openCreateDialog = async () => {
    try {
      const res = await getActiveProducts();
      setProducts(res.data);
    } catch { /* ignore */ }
    setOrderForm({ orderType: 'SALES', notes: '', items: [{ productId: null, quantity: 1, unitPrice: 0 }] });
    setCreateOpen(true);
  };

  const addItem = () => {
    setOrderForm({ ...orderForm, items: [...orderForm.items, { productId: null, quantity: 1, unitPrice: 0 }] });
  };

  const removeItem = (index) => {
    const items = orderForm.items.filter((_, i) => i !== index);
    setOrderForm({ ...orderForm, items: items.length ? items : [{ productId: null, quantity: 1, unitPrice: 0 }] });
  };

  const updateItem = (index, field, value) => {
    const items = [...orderForm.items];
    items[index] = { ...items[index], [field]: value };
    // Auto-fill price when product selected
    if (field === 'productId' && value) {
      const product = products.find((p) => p.id === value);
      if (product) {
        items[index].unitPrice = orderForm.orderType === 'PURCHASE' ? product.costPrice || product.price : product.price;
      }
    }
    setOrderForm({ ...orderForm, items });
  };

  const handleCreateOrder = async () => {
    const validItems = orderForm.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      enqueueSnackbar('Add at least one product', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await createOrder({
        orderType: orderForm.orderType,
        notes: orderForm.notes,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: parseInt(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
        })),
      });
      enqueueSnackbar('Order created', { variant: 'success' });
      setCreateOpen(false);
      setLoading(true);
      fetchOrders();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to create order', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Orders ({orders.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small" select label="Status" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)} sx={{ width: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog} id="create-order-btn">
            New Order
          </Button>
        </Box>
      </Box>

      <Card>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setLoading(true); }} sx={{ px: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Tab label="All Orders" />
          <Tab label="Sales" />
          <Tab label="Purchase" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.orderType}
                      size="small"
                      color={order.orderType === 'SALES' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={order.status} size="small" color={getStatusColor(order.status)} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{order.createdBy?.fullName || '-'}</TableCell>
                  <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/orders/${order.id}`)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 3 }}>
            <TextField
              label="Order Type" select fullWidth value={orderForm.orderType}
              onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value })}
            >
              <MenuItem value="SALES">Sales Order</MenuItem>
              <MenuItem value="PURCHASE">Purchase Order</MenuItem>
            </TextField>
            <TextField
              label="Notes" fullWidth value={orderForm.notes}
              onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Order Items</Typography>
          {orderForm.items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                label="Product" select fullWidth value={item.productId || ''}
                onChange={(e) => updateItem(index, 'productId', Number(e.target.value))}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Qty" type="number" sx={{ width: 100 }} value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              />
              <TextField
                label="Unit Price" type="number" sx={{ width: 140 }} value={item.unitPrice}
                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
              />
              <Typography sx={{ minWidth: 100, fontWeight: 600 }}>
                {formatCurrency(item.quantity * item.unitPrice)}
              </Typography>
              <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button size="small" onClick={addItem}>+ Add Item</Button>

          <Typography variant="h6" sx={{ mt: 2, textAlign: 'right', fontWeight: 700 }}>
            Total: {formatCurrency(orderForm.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0))}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreateOrder} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderListPage;
