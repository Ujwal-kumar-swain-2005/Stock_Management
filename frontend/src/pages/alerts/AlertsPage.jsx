import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getAllAlerts } from '../../api/alertApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, Divider
} from '@mui/material';
import { WarningAmber, ReportProblemOutlined, Visibility, Inventory2 } from '@mui/icons-material';

const AlertsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getAllAlerts();
        setAlerts(res.data);
      } catch {
        enqueueSnackbar('Failed to load alerts', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return <LoadingSpinner message="Loading alerts..." />;
  if (!alerts) return <Typography color="error">Failed to load alerts</Typography>;

  const { lowStockAlerts = [], expiryAlerts = [], totalAlerts = 0 } = alerts;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Alerts & Notifications
        </Typography>
        <Chip
          label={`${totalAlerts} Total Alerts`}
          color={totalAlerts > 0 ? 'error' : 'success'}
          sx={{ fontWeight: 700, fontSize: '0.9rem' }}
        />
      </Box>

      {totalAlerts === 0 && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Inventory2 sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
              All Clear! 🎉
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No stock or expiry alerts at this time.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <WarningAmber sx={{ color: '#ff9800' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Low Stock Alerts ({lowStockAlerts.length})
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {lowStockAlerts.map((alert, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card
                  sx={{
                    borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#f44336' : '#ff9800'}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={alert.severity === 'CRITICAL' ? 'error' : 'warning'}
                        icon={alert.severity === 'CRITICAL' ? <ReportProblemOutlined /> : <WarningAmber />}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {alert.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {alert.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Current Stock</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: alert.currentStock === 0 ? 'error.main' : 'warning.main' }}>
                          {alert.currentStock}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Reorder Level</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{alert.reorderLevel}</Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/products/${alert.productId}`)}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Expiry Alerts */}
      {expiryAlerts.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ReportProblemOutlined sx={{ color: '#f44336' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Expiry Alerts ({expiryAlerts.length})
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {expiryAlerts.map((alert, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card
                  sx={{
                    borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#f44336' : '#ff9800'}`,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={alert.severity === 'CRITICAL' ? 'error' : 'warning'}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {alert.productName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {alert.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
                        <Typography sx={{ fontWeight: 600, color: alert.severity === 'CRITICAL' ? 'error.main' : 'warning.main' }}>
                          {formatDate(alert.expiryDate)}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/products/${alert.productId}`)}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AlertsPage;
