import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllAlerts } from '../../api/alertApi';
import { DRAWER_WIDTH } from './Sidebar';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box, Menu, MenuItem,
  Avatar, Divider, ListItemIcon
} from '@mui/material';
import {
  NotificationsOutlined, Logout, Person, AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/inventory': 'Inventory',
  '/orders': 'Orders',
  '/reports': 'Reports',
  '/alerts': 'Alerts',
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [alertCount, setAlertCount] = useState(0);

  const currentTitle = Object.entries(pageTitles).find(
    ([path]) => location.pathname.startsWith(path)
  )?.[1] || 'StockFlow';

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await getAllAlerts();
        setAlertCount(res.data.totalAlerts || 0);
      } catch {
       
      }
    };
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    const colors = { ADMIN: '#f44336', MANAGER: '#ff9800', STAFF: '#4caf50' };
    return colors[role] || '#9e9e9e';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        backgroundColor: 'rgba(10, 25, 41, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {currentTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={() => navigate('/alerts')}
            id="topbar-alerts"
          >
            <Badge badgeContent={alertCount} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>

          <IconButton onClick={handleMenuOpen} id="topbar-user-menu">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { width: 220, mt: 1 },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem disabled>
              <ListItemIcon>
                <AdminPanelSettings fontSize="small" sx={{ color: getRoleColor(user?.role) }} />
              </ListItemIcon>
              <Typography variant="body2" sx={{ color: getRoleColor(user?.role), fontWeight: 600 }}>
                {user?.role}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
