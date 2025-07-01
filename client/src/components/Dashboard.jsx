import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData') || '{}');
    if (!authData.token) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${authData.token}` }
        });
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile');
        if (err.response?.status === 401) {
          localStorage.removeItem('authData');
          navigate('/', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogoutClick = () => {
    setOpenDialog(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('authData');
    setOpenDialog(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/', { replace: true });
  };

  const handleLogoutCancel = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%'
          }}
        >
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <Typography component="h1" variant="h4" gutterBottom>
                Welcome, {profile?.username}!
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Typography>
                  <strong>Email:</strong> {profile?.email}
                </Typography>
                <Typography>
                  <strong>Member since:</strong>{' '}
                  {new Date(profile?.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleLogoutClick}
                sx={{ mt: 4 }}
              >
                Logout
              </Button>

              <Dialog
                open={openDialog}
                onClose={handleLogoutCancel}
                aria-labelledby="logout-dialog-title"
                aria-describedby="logout-dialog-description"
              >
                <DialogTitle id="logout-dialog-title">
                  Confirm Logout
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="logout-dialog-description">
                    Are you sure you want to logout? You will need to login again to access your account.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleLogoutCancel} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleLogoutConfirm} color="primary" variant="contained" autoFocus>
                    Logout
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;