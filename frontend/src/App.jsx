import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProductListPage = lazy(() => import('./pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const CategoryListPage = lazy(() => import('./pages/categories/CategoryListPage'));
const SupplierListPage = lazy(() => import('./pages/suppliers/SupplierListPage'));
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'));
const OrderListPage = lazy(() => import('./pages/orders/OrderListPage'));
const OrderDetailPage = lazy(() => import('./pages/orders/OrderDetailPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const AlertsPage = lazy(() => import('./pages/alerts/AlertsPage'));
const UsersPage = lazy(() => import('./pages/users/UsersPage'));

// Loading spinner shown while lazy chunks are being fetched
function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <CircularProgress size={48} thickness={4} />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Router>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="products" element={<ProductListPage />} />
                  <Route path="products/:id" element={<ProductDetailPage />} />
                  <Route path="categories" element={<CategoryListPage />} />
                  <Route path="suppliers" element={<SupplierListPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="orders" element={<OrderListPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="alerts" element={<AlertsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
