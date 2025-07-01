import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const authData = JSON.parse(localStorage.getItem('authData') || '{}');
  const username = authData.username;

  const sampleCards = [
    {
      title: 'Feature 1',
      description: 'This is a sample feature that showcases what you can do with our platform.',
      image: '🚀'
    },
    {
      title: 'Feature 2',
      description: 'Another amazing feature that makes our platform unique and useful.',
      image: '⭐'
    },
    {
      title: 'Feature 3',
      description: 'Discover more possibilities with our comprehensive tools and services.',
      image: '🎯'
    }
  ];

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white'
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome, {username}! 👋
          </Typography>
          <Typography variant="h5">
            We're excited to have you here. Explore our amazing features below.
          </Typography>
        </Paper>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {sampleCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    pt: '56.25%',
                    position: 'relative',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {card.image}
                  </Typography>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {card.title}
                  </Typography>
                  <Typography>{card.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleLogoutClick}
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
        </Box>
      </Box>
    </Container>
  );
};

export default Welcome;