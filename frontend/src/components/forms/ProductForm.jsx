import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { createProduct, updateProduct } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import { getAllSuppliers } from '../../api/supplierApi';
import { Box, TextField, Button, MenuItem, CircularProgress } from '@mui/material';

const ProductForm = ({ product, onClose, categories: propCategories }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(propCategories || []);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || '',
    costPrice: product?.costPrice || '',
    reorderLevel: product?.reorderLevel || 10,
    expiryDate: product?.expiryDate || '',
    imageUrl: product?.imageUrl || '',
    categoryId: product?.category?.id || '',
    supplierId: product?.supplier?.id || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!propCategories || propCategories.length === 0) {
          const catRes = await getAllCategories();
          setCategories(catRes.data);
        }
        const supRes = await getAllSuppliers();
        setSuppliers(supRes.data);
      } catch { /* ignore */ }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price) {
      enqueueSnackbar('Name, SKU, and Price are required', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        reorderLevel: parseInt(form.reorderLevel),
        categoryId: form.categoryId || null,
        supplierId: form.supplierId || null,
        expiryDate: form.expiryDate || null,
      };
      if (product) {
        await updateProduct(product.id, payload);
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await createProduct(payload);
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }
      onClose(true);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Operation failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <TextField name="name" label="Product Name" fullWidth value={form.name} onChange={handleChange} sx={{ mb: 2 }} required />
      <TextField name="sku" label="SKU" fullWidth value={form.sku} onChange={handleChange} sx={{ mb: 2 }} required disabled={!!product} />
      <TextField name="description" label="Description" fullWidth multiline rows={2} value={form.description} onChange={handleChange} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField name="price" label="Selling Price" type="number" fullWidth value={form.price} onChange={handleChange} required />
        <TextField name="costPrice" label="Cost Price" type="number" fullWidth value={form.costPrice} onChange={handleChange} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField name="reorderLevel" label="Reorder Level" type="number" fullWidth value={form.reorderLevel} onChange={handleChange} />
        <TextField name="expiryDate" label="Expiry Date" type="date" fullWidth value={form.expiryDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField name="categoryId" label="Category" select fullWidth value={form.categoryId} onChange={handleChange}>
          <MenuItem value="">None</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </TextField>
        <TextField name="supplierId" label="Supplier" select fullWidth value={form.supplierId} onChange={handleChange}>
          <MenuItem value="">None</MenuItem>
          {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>
      </Box>
      <TextField name="imageUrl" label="Image URL" fullWidth value={form.imageUrl} onChange={handleChange} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={() => onClose(false)} color="inherit">Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : (product ? 'Update' : 'Create')}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductForm;
