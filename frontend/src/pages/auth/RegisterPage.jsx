import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
  MenuItem, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Inventory2 } from '@mui/icons-material';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '', password: '', email: '', fullName: '', role: 'STAFF'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.email || !form.fullName) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          maxWidth: 480,
          p: 2,
          background: 'rgba(19, 47, 76, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        className="fade-in"
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Inventory2 sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" className="gradient-text" sx={{ fontWeight: 800 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Join StockFlow Inventory System
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              id="register-fullname"
              name="fullName"
              label="Full Name"
              fullWidth
              value={form.fullName}
              onChange={handleChange}
              sx={{ mb: 2 }}
              autoFocus
            />
            <TextField
              id="register-username"
              name="username"
              label="Username"
              fullWidth
              value={form.username}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              id="register-email"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              id="register-password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={form.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
              helperText="Minimum 6 characters"
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
            <TextField
              id="register-role"
              name="role"
              label="Role"
              select
              fullWidth
              value={form.role}
              onChange={handleChange}
              sx={{ mb: 3 }}
            >
              <MenuItem value="STAFF">Staff</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
            <Button
              id="register-submit"
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }} color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#26c6da', fontWeight: 600 }}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
