import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { getOrderById, confirmOrder, cancelOrder, updateOrderStatus } from '../../api/orderApi';
import { canManageOrders } from '../../utils/roles';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, formatDateTime, getStatusColor } from '../../utils/formatters';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, Divider, MenuItem, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, LocalShipping } from '@mui/icons-material';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [statusValue, setStatusValue] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await getOrderById(id);
      setOrder(res.data);
      setStatusValue(res.data.status);
    } catch {
      enqueueSnackbar('Failed to load order', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleConfirm = async () => {
    try {
      await confirmOrder(id);
      enqueueSnackbar('Order confirmed', { variant: 'success' });
      fetchOrder();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to confirm', { variant: 'error' });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(id);
      enqueueSnackbar('Order cancelled', { variant: 'success' });
      setCancelDialog(false);
      fetchOrder();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to cancel', { variant: 'error' });
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      enqueueSnackbar(`Status updated to ${newStatus}`, { variant: 'success' });
      fetchOrder();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to update status', { variant: 'error' });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <Typography color="error">Order not found</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/orders')} sx={{ mb: 2 }}>
        Back to Orders
      </Button>

      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Order #{order.orderNumber}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={order.orderType} color={order.orderType === 'SALES' ? 'primary' : 'secondary'} variant="outlined" />
                  <Chip label={order.status} color={getStatusColor(order.status)} />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Created By</Typography><Typography sx={{ fontWeight: 600 }}>{order.createdBy?.fullName || '-'}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Order Date</Typography><Typography sx={{ fontWeight: 600 }}>{formatDateTime(order.orderDate)}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Total Amount</Typography><Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{formatCurrency(order.totalAmount)}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Notes</Typography><Typography>{order.notes || '-'}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Actions</Typography>

              {canManageOrders(user?.role) && order.status === 'PENDING' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={handleConfirm} fullWidth>
                    Confirm Order
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setCancelDialog(true)} fullWidth>
                    Cancel Order
                  </Button>
                </Box>
              )}

              {canManageOrders(user?.role) && ['CONFIRMED', 'SHIPPED'].includes(order.status) && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    label="Update Status" select fullWidth value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                  >
                    {['CONFIRMED', 'SHIPPED', 'DELIVERED'].map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    startIcon={<LocalShipping />}
                    onClick={() => handleStatusUpdate(statusValue)}
                    fullWidth
                    disabled={statusValue === order.status}
                  >
                    Update Status
                  </Button>
                </Box>
              )}

              {order.status === 'CANCELLED' && (
                <Typography color="error" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  This order has been cancelled
                </Typography>
              )}
              {order.status === 'DELIVERED' && (
                <Typography color="success.main" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  ✅ This order has been delivered
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Items ({order.orderItems?.length || 0})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(order.orderItems || []).map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{item.product?.name}</TableCell>
                        <TableCell><Chip label={item.product?.sku} size="small" variant="outlined" /></TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'primary.main' }}>{formatCurrency(order.totalAmount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={cancelDialog}
        title="Cancel Order"
        message={`Cancel order #${order.orderNumber}? This action cannot be undone.`}
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog(false)}
      />
    </Box>
  );
};

export default OrderDetailPage;
