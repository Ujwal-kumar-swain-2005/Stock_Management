import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canViewReports } from '../../utils/roles';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider
} from '@mui/material';
import {
  Dashboard, Inventory2, Category, LocalShipping, Warehouse,
  ShoppingCart, Assessment, NotificationsActive, Group
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Products', icon: <Inventory2 />, path: '/products' },
  { text: 'Categories', icon: <Category />, path: '/categories' },
  { text: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
  { text: 'Inventory', icon: <Warehouse />, path: '/inventory' },
  { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
  { text: 'Reports', icon: <Assessment />, path: '/reports', roles: ['ADMIN', 'MANAGER'] },
  { text: 'Users', icon: <Group />, path: '/users', roles: ['ADMIN'] },
  { text: 'Alerts', icon: <NotificationsActive />, path: '/alerts' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const filteredItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" className="gradient-text" sx={{ fontWeight: 800, letterSpacing: 1 }}>
          StockFlow
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Inventory Management
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <List sx={{ px: 1.5, mt: 1 }}>
        {filteredItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  backgroundColor: isActive ? 'rgba(92, 107, 192, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #5c6bc0' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(92, 107, 192, 0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
