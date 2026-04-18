import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { getActiveSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/supplierApi';
import RoleGuard from '../../components/common/RoleGuard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Box, Card, Typography, Button, TextField, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const SupplierListPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const fetchData = async () => {
    try {
      const res = await getActiveSuppliers();
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch {
      enqueueSnackbar('Failed to load suppliers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, contactPerson: item.contactPerson || '',
      email: item.email || '', phone: item.phone || '', address: item.address || '',
    });
    setFormOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await updateSupplier(editItem.id, form);
        enqueueSnackbar('Supplier updated', { variant: 'success' });
      } else {
        await createSupplier(form);
        enqueueSnackbar('Supplier created', { variant: 'success' });
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
      await deleteSupplier(deleteDialog.id);
      enqueueSnackbar('Supplier deleted', { variant: 'success' });
      setDeleteDialog({ open: false, id: null, name: '' });
      fetchData();
    } catch {
      enqueueSnackbar('Failed to delete supplier', { variant: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="Loading suppliers..." />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Suppliers ({suppliers.length})</Typography>
        <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} id="add-supplier-btn">
            Add Supplier
          </Button>
        </RoleGuard>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact Person</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((sup) => (
                <TableRow key={sup.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{sup.name}</TableCell>
                  <TableCell>{sup.contactPerson || '-'}</TableCell>
                  <TableCell>{sup.email || '-'}</TableCell>
                  <TableCell>{sup.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip label={sup.active ? 'Active' : 'Inactive'} size="small" color={sup.active ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                      <IconButton size="small" onClick={() => openEdit(sup)}><Edit fontSize="small" /></IconButton>
                    </RoleGuard>
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, id: sup.id, name: sup.name })}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </RoleGuard>
                  </TableCell>
                </TableRow>
              ))}
              {suppliers.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>No suppliers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editItem ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <TextField name="name" label="Company Name" fullWidth value={form.name} onChange={handleChange} sx={{ mt: 1, mb: 2 }} required />
          <TextField name="contactPerson" label="Contact Person" fullWidth value={form.contactPerson} onChange={handleChange} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField name="email" label="Email" type="email" fullWidth value={form.email} onChange={handleChange} />
            <TextField name="phone" label="Phone" fullWidth value={form.phone} onChange={handleChange} />
          </Box>
          <TextField name="address" label="Address" fullWidth multiline rows={2} value={form.address} onChange={handleChange} />
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
        title="Delete Supplier"
        message={`Delete "${deleteDialog.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, id: null, name: '' })}
      />
    </Box>
  );
};

export default SupplierListPage;
