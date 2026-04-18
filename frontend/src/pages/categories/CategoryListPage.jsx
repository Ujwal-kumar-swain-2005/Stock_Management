import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { getActiveCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';
import RoleGuard from '../../components/common/RoleGuard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Box, Card, Typography, Button, TextField, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { formatDateTime } from '../../utils/formatters';

const CategoryListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const fetchData = async () => {
    try {
      const res = await getActiveCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      enqueueSnackbar('Failed to load categories', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', description: '' });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '' });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await updateCategory(editItem.id, form);
        enqueueSnackbar('Category updated', { variant: 'success' });
      } else {
        await createCategory(form);
        enqueueSnackbar('Category created', { variant: 'success' });
      }
      setFormOpen(false);
      fetchData();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Operation failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteDialog.id);
      enqueueSnackbar('Category deleted', { variant: 'success' });
      setDeleteDialog({ open: false, id: null, name: '' });
      fetchData();
    } catch {
      enqueueSnackbar('Failed to delete category', { variant: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="Loading categories..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Categories ({categories.length})</Typography>
        <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} id="add-category-btn">
            Add Category
          </Button>
        </RoleGuard>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{cat.name}</TableCell>
                  <TableCell>{cat.description || '-'}</TableCell>
                  <TableCell>
                    <Chip label={cat.active ? 'Active' : 'Inactive'} size="small" color={cat.active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>{formatDateTime(cat.createdAt)}</TableCell>
                  <TableCell align="right">
                    <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                      <IconButton size="small" onClick={() => openEdit(cat)}><Edit fontSize="small" /></IconButton>
                    </RoleGuard>
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: cat.id, name: cat.name })}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </RoleGuard>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No categories found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editItem ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mt: 1, mb: 2 }} required />
          <TextField label="Description" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : (editItem ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Category"
        message={`Delete "${deleteDialog.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null, name: '' })}
      />
    </Box>
  );
};

export default CategoryListPage;
