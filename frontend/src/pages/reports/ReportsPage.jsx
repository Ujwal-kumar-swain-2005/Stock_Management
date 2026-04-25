import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { getSalesReport, getPurchaseReport, getInventoryReport, getExpiryReport } from '../../api/reportApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, TextField, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Slider
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#5c6bc0', '#26c6da', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#8d6e63', '#78909c'];

const ReportsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Date range
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  // Data
  const [salesData, setSalesData] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [expiryData, setExpiryData] = useState([]);
  const [expiryDays, setExpiryDays] = useState(30);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await getSalesReport(startDate, endDate);
      setSalesData(res.data);
    } catch {
      enqueueSnackbar('Failed to load sales report', { variant: 'error' });
    } finally { setLoading(false); }
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await getPurchaseReport(startDate, endDate);
      setPurchaseData(res.data);
    } catch {
      enqueueSnackbar('Failed to load purchase report', { variant: 'error' });
    } finally { setLoading(false); }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await getInventoryReport();
      setInventoryData(res.data);
    } catch {
      enqueueSnackbar('Failed to load inventory report', { variant: 'error' });
    } finally { setLoading(false); }
  };

  const fetchExpiry = async () => {
    setLoading(true);
    try {
      const res = await getExpiryReport(expiryDays);
      setExpiryData(res.data);
    } catch {
      enqueueSnackbar('Failed to load expiry report', { variant: 'error' });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 0) fetchSales();
    else if (tab === 1) fetchPurchases();
    else if (tab === 2) fetchInventory();
    else if (tab === 3) fetchExpiry();
  }, [tab]);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Reports & Analytics</Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Tab label="Sales Report" />
          <Tab label="Purchase Report" />
          <Tab label="Inventory Report" />
          <Tab label="Expiry Report" />
        </Tabs>
      </Card>

      {loading && <LoadingSpinner />}

      {/* Sales Report */}
      {!loading && tab === 0 && (
        <Box>
          <Card sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField label="Start Date" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <Button variant="contained" onClick={fetchSales}>Generate</Button>
            </Box>
          </Card>
          {salesData && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Total Revenue</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#66bb6a' }}>{formatCurrency(salesData.totalRevenue || salesData.totalAmount || 0)}</Typography></CardContent></Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Total Orders</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{salesData.totalOrders || salesData.orderCount || 0}</Typography></CardContent></Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Average Order Value</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#5c6bc0' }}>{formatCurrency(salesData.averageOrderValue || 0)}</Typography></CardContent></Card>
              </Grid>
              {salesData.ordersByDate && (
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ height: 350 }}><CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Sales Over Time</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={salesData.ordersByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#b0bec5" fontSize={11} />
                        <YAxis stroke="#b0bec5" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#132f4c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                        <Bar dataKey="amount" fill="#66bb6a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent></Card>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      )}

      {/* Purchase Report */}
      {!loading && tab === 1 && (
        <Box>
          <Card sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField label="Start Date" type="date" size="small" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="End Date" type="date" size="small" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <Button variant="contained" onClick={fetchPurchases}>Generate</Button>
            </Box>
          </Card>
          {purchaseData && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Total Purchases</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#ffa726' }}>{formatCurrency(purchaseData.totalAmount || 0)}</Typography></CardContent></Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Total Orders</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{purchaseData.totalOrders || purchaseData.orderCount || 0}</Typography></CardContent></Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="body2" color="text.secondary">Avg Order Value</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#5c6bc0' }}>{formatCurrency(purchaseData.averageOrderValue || 0)}</Typography></CardContent></Card>
              </Grid>
              {purchaseData.ordersByDate && (
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ height: 350 }}><CardContent sx={{ height: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Purchases Over Time</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={purchaseData.ordersByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#b0bec5" fontSize={11} />
                        <YAxis stroke="#b0bec5" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#132f4c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                        <Bar dataKey="amount" fill="#ffa726" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent></Card>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      )}

      {/* Inventory Report */}
      {!loading && tab === 2 && inventoryData && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card><CardContent><Typography variant="body2" color="text.secondary">Total Inventory Value</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#5c6bc0' }}>{formatCurrency(inventoryData.totalValue || 0)}</Typography></CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card><CardContent><Typography variant="body2" color="text.secondary">Total Items</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{inventoryData.totalItems || 0}</Typography></CardContent></Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card><CardContent><Typography variant="body2" color="text.secondary">Low Stock</Typography><Typography variant="h4" sx={{ fontWeight: 800, color: '#ff9800' }}>{inventoryData.lowStockCount || 0}</Typography></CardContent></Card>
          </Grid>
          {inventoryData.categoryBreakdown && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: 350 }}><CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Value by Category</Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie data={inventoryData.categoryBreakdown} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                      {(inventoryData.categoryBreakdown || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#132f4c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </Grid>
          )}
          {inventoryData.items && (
            <Grid size={{ xs: 12, md: inventoryData.categoryBreakdown ? 6 : 12 }}>
              <Card><CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Stock Details</Typography>
                <TableContainer sx={{ maxHeight: 280 }}>
                  <Table size="small" stickyHeader>
                    <TableHead><TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {(inventoryData.items || []).map((item, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{item.productName || item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.value || item.totalValue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent></Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Expiry Report */}
      {!loading && tab === 3 && (
        <Box>
          <Card sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Typography variant="body2">Products expiring within:</Typography>
              <Slider value={expiryDays} onChange={(_, v) => setExpiryDays(v)} min={7} max={180} step={7} sx={{ width: 200 }} valueLabelDisplay="auto" />
              <Typography sx={{ fontWeight: 600 }}>{expiryDays} days</Typography>
              <Button variant="contained" onClick={fetchExpiry}>Refresh</Button>
            </Box>
          </Card>
          <Card>
            <TableContainer>
              <Table>
                <TableHead><TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Days Left</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {expiryData.map((item, i) => {
                    const daysLeft = item.daysUntilExpiry != null
                      ? item.daysUntilExpiry
                      : Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000);
                    return (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{item.productName || item.name}</TableCell>
                        <TableCell><Chip label={item.sku} size="small" variant="outlined" /></TableCell>
                        <TableCell>{formatDate(item.expiryDate)}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: daysLeft <= 0 ? '#f44336' : daysLeft <= 7 ? '#ff9800' : '#66bb6a' }}>
                          {daysLeft <= 0 ? 'EXPIRED' : `${daysLeft} days`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={daysLeft <= 0 ? 'Expired' : daysLeft <= 7 ? 'Critical' : 'Warning'}
                            size="small"
                            color={daysLeft <= 0 ? 'error' : daysLeft <= 7 ? 'warning' : 'info'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {expiryData.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No expiring products found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default ReportsPage;
