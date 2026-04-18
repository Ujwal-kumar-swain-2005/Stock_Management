import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../api/productApi';
import { getInventoryByProduct, getTransactionsByProduct } from '../../api/inventoryApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, invRes, txRes] = await Promise.allSettled([
          getProductById(id),
          getInventoryByProduct(id),
          getTransactionsByProduct(id),
        ]);
        if (prodRes.status === 'fulfilled') setProduct(prodRes.value.data);
        if (invRes.status === 'fulfilled') setInventory(invRes.value.data);
        if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <Typography color="error">Product not found.</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/products')} sx={{ mb: 2 }}>
        Back to Products
      </Button>

      <Grid container spacing={3}>
        {/* Product Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{product.name}</Typography>
                <Chip label={product.active ? 'Active' : 'Inactive'} color={product.active ? 'success' : 'default'} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">SKU</Typography><Typography sx={{ fontWeight: 600 }}>{product.sku}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Selling Price</Typography><Typography sx={{ fontWeight: 600 }}>{formatCurrency(product.price)}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Cost Price</Typography><Typography sx={{ fontWeight: 600 }}>{formatCurrency(product.costPrice)}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Reorder Level</Typography><Typography sx={{ fontWeight: 600 }}>{product.reorderLevel}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Category</Typography><Typography sx={{ fontWeight: 600 }}>{product.category?.name || '-'}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Supplier</Typography><Typography sx={{ fontWeight: 600 }}>{product.supplier?.name || '-'}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Expiry Date</Typography><Typography sx={{ fontWeight: 600 }}>{formatDate(product.expiryDate)}</Typography></Grid>
                <Grid size={{ xs: 6 }}><Typography variant="body2" color="text.secondary">Created</Typography><Typography sx={{ fontWeight: 600 }}>{formatDateTime(product.createdAt)}</Typography></Grid>
              </Grid>
              {product.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography>{product.description}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>Current Stock</Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: inventory
                    ? inventory.quantity === 0 ? 'error.main'
                    : inventory.quantity <= product.reorderLevel ? 'warning.main'
                    : 'success.main'
                    : 'text.secondary',
                }}
              >
                {inventory?.quantity ?? 'N/A'}
              </Typography>
              <Chip
                label={
                  !inventory ? 'No Inventory'
                  : inventory.quantity === 0 ? 'OUT OF STOCK'
                  : inventory.quantity <= product.reorderLevel ? 'LOW STOCK'
                  : 'IN STOCK'
                }
                color={
                  !inventory ? 'default'
                  : inventory.quantity === 0 ? 'error'
                  : inventory.quantity <= product.reorderLevel ? 'warning'
                  : 'success'
                }
                sx={{ mt: 1 }}
              />
              {inventory && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                  Last Updated: {formatDateTime(inventory.lastUpdated)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Transaction History
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
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
                        <TableCell>
                          <Chip label={tx.type} size="small" color={tx.type === 'IN' ? 'success' : 'error'} variant="outlined" />
                        </TableCell>
                        <TableCell>{tx.quantity}</TableCell>
                        <TableCell>{tx.referenceNumber || '-'}</TableCell>
                        <TableCell>{tx.notes || '-'}</TableCell>
                        <TableCell>{tx.performedBy?.fullName || '-'}</TableCell>
                        <TableCell>{formatDateTime(tx.transactionDate)}</TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;
