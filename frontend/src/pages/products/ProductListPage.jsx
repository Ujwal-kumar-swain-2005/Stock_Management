import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';
import { canCreate, canDelete } from '../../utils/roles';
import { formatCurrency } from '../../utils/formatters';
import { getActiveProducts, deleteProduct, searchProducts } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import RoleGuard from '../../components/common/RoleGuard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductForm from '../../components/forms/ProductForm';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, InputAdornment, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Add, Search, Edit, Delete, Visibility } from '@mui/icons-material';

const ProductListPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

 const fetchProducts = async () => {
  try {
    const res = await getActiveProducts();
    console.log("FULL RESPONSE:", res);
    console.log("DATA:", res.data);
    console.log("IS ARRAY:", Array.isArray(res.data));

    setProducts(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.log("ERROR:", err);
  } finally {
    setLoading(false);
  }
};

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchProducts();
      return;
    }
    try {
      const res = await searchProducts(searchKeyword);
      setProducts(res.data);
    } catch {
      enqueueSnackbar('Search failed', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteDialog.id);
      enqueueSnackbar('Product deleted', { variant: 'success' });
      setDeleteDialog({ open: false, id: null, name: '' });
      fetchProducts();
    } catch {
      enqueueSnackbar('Failed to delete product', { variant: 'error' });
    }
  };

  const handleFormClose = (refresh) => {
    setFormOpen(false);
    setEditProduct(null);
    if (refresh) fetchProducts();
  };

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category?.id === Number(categoryFilter))
    : products;

  if (loading) return <LoadingSpinner message="Loading products..." />;

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Products ({filteredProducts.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search products..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }
            }}
            sx={{ width: 220 }}
          />
          <TextField
            size="small"
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFormOpen(true)}
              id="add-product-btn"
            >
              Add Product
            </Button>
          </RoleGuard>
        </Box>
      </Box>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cost</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reorder Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                  <TableCell>
                    <Chip label={product.sku} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell>{product.category?.name || '-'}</TableCell>
                  <TableCell>{product.supplier?.name || '-'}</TableCell>
                  <TableCell>{product.reorderLevel}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={product.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/products/${product.id}`)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                      <IconButton
                        size="small"
                        onClick={() => { setEditProduct(product); setFormOpen(true); }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </RoleGuard>
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, id: product.id, name: product.name })}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </RoleGuard>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => handleFormClose(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editProduct ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent>
          <ProductForm
            product={editProduct}
            onClose={handleFormClose}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null, name: '' })}
      />
    </Box>
  );
};

export default ProductListPage;
