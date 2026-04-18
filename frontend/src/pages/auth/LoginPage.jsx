import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Inventory2 } from '@mui/icons-material';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a1929 0%, #1a2940 50%, #0d2137 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          p: 2,
          background: 'rgba(19, 47, 76, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        className="fade-in"
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Inventory2 sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" className="gradient-text" sx={{ fontWeight: 800 }}>
              StockFlow
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Inventory Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              id="login-username"
              name="username"
              label="Username"
              fullWidth
              value={form.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
              autoFocus
            />
            <TextField
              id="login-password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={form.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <Button
              id="login-submit"
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #5c6bc0, #26c6da)',
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3f51b5, #00acc1)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }} color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#26c6da', fontWeight: 600 }}>
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
