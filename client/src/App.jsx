import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Welcome from './components/Welcome';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData).token : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const authData = localStorage.getItem('authData');
      setIsAuthenticated(authData ? JSON.parse(authData).token : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const authData = localStorage.getItem('authData');
    setIsAuthenticated(authData ? JSON.parse(authData).token : null);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/welcome" replace /> : <Auth />} 
          />
          <Route 
            path="/welcome" 
            element={isAuthenticated ? <Welcome /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
