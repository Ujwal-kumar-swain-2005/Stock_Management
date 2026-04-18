import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Inventory2, Category, LocalShipping, ShoppingCart, WarningAmber, RemoveShoppingCart } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { getDashboardStats } from '../../api/dashboardApi';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const COLORS = ['#5c6bc0', '#26c6da', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#8d6e63'];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!stats) return <Typography color="error">Failed to load dashboard data.</Typography>;

  const kpiCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: <Inventory2 sx={{ fontSize: 28, color: '#5c6bc0' }} />, color: '#5c6bc0' },
    { title: 'Categories', value: stats.totalCategories, icon: <Category sx={{ fontSize: 28, color: '#26c6da' }} />, color: '#26c6da' },
    { title: 'Suppliers', value: stats.totalSuppliers, icon: <LocalShipping sx={{ fontSize: 28, color: '#66bb6a' }} />, color: '#66bb6a' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCart sx={{ fontSize: 28, color: '#ffa726' }} />, color: '#ffa726' },
    { title: 'Low Stock Items', value: stats.lowStockItems, icon: <WarningAmber sx={{ fontSize: 28, color: '#ff9800' }} />, color: '#ff9800' },
    { title: 'Out of Stock', value: stats.outOfStockItems, icon: <RemoveShoppingCart sx={{ fontSize: 28, color: '#f44336' }} />, color: '#f44336' },
  ];

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={card.title}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Financial Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>Inventory Value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#5c6bc0' }}>
                {formatCurrency(stats.totalInventoryValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>Total Sales</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#66bb6a' }}>
                {formatCurrency(stats.totalSales)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>Total Purchases</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffa726' }}>
                {formatCurrency(stats.totalPurchases)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Sales Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: 400 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Monthly Sales Trend
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={stats.monthlySales || []}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5c6bc0" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5c6bc0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#b0bec5" fontSize={12} />
                  <YAxis stroke="#b0bec5" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#132f4c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#5c6bc0" fill="url(#salesGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Products */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 400 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Low Stock Products
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={(stats.lowStockProducts || []).slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#b0bec5" fontSize={12} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#b0bec5" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#132f4c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  />
                  <Bar dataKey="quantity" fill="#ff9800" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stats.recentTransactions || []).slice(0, 10).map((tx, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{tx.productName || tx.product}</TableCell>
                    <TableCell>
                      <Chip
                        label={tx.type}
                        size="small"
                        color={tx.type === 'IN' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{tx.quantity}</TableCell>
                    <TableCell>{formatDateTime(tx.date || tx.transactionDate)}</TableCell>
                  </TableRow>
                ))}
                {(!stats.recentTransactions || stats.recentTransactions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No recent transactions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
