import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, FormControl, Select, MenuItem,
  Switch, CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { userApi } from '../../api/userApi';
import { ROLES } from '../../utils/roles';
import { Delete, Edit } from '@mui/icons-material';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await userApi.updateUserRole(id, newRole);
      setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
      enqueueSnackbar('User role updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update user role', { variant: 'error' });
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await userApi.updateUserStatus(id, newStatus);
      setUsers(users.map(user => user.id === id ? { ...user, active: newStatus } : user));
      enqueueSnackbar(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update user status', { variant: 'error' });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MANAGER': return 'info';
      case 'STAFF': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, className: 'gradient-text' }}>
          User Management
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      sx={{
                        '& .MuiSelect-select': { py: 0.5 },
                        fontSize: '0.875rem'
                      }}
                    >
                      {Object.values(ROLES).map(role => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Switch
                      checked={user.active}
                      onChange={() => handleStatusChange(user.id, user.active)}
                      color="primary"
                    />
                    <Chip 
                      label={user.active ? 'Active' : 'Inactive'} 
                      color={user.active ? 'success' : 'default'}
                      size="small"
                      variant={user.active ? 'filled' : 'outlined'}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UsersPage;
