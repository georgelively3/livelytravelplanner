import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Alert, 
  Box,
  CircularProgress 
} from '@mui/material';
import axios from 'axios';

const ConnectionTest = () => {
  const [status, setStatus] = useState('testing');
  const [results, setResults] = useState([]);

  const addResult = (test, success, message) => {
    setResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setStatus('testing');
    setResults([]);

    // Test 1: Basic API connection
    try {
      const response = await axios.get('/api/profiles');
      addResult('API Connection', true, `Connected - got ${response.data.profiles?.length || 0} profiles`);
    } catch (error) {
      addResult('API Connection', false, `Failed: ${error.message}`);
    }

    // Test 2: Registration
    try {
      const userData = {
        firstName: 'Test',
        lastName: 'Frontend',
        email: `test-${Date.now()}@example.com`,
        password: 'testpass123'
      };
      
      const response = await axios.post('/api/auth/register', userData);
      addResult('Registration', true, `User created with ID: ${response.data.user.id}`);
      
      // Test 3: Login with the same user
      try {
        const loginResponse = await axios.post('/api/auth/login', {
          email: userData.email,
          password: userData.password
        });
        addResult('Login', true, `Login successful, token received`);
      } catch (loginError) {
        addResult('Login', false, `Failed: ${loginError.response?.data?.message || loginError.message}`);
      }
      
    } catch (regError) {
      addResult('Registration', false, `Failed: ${regError.response?.data?.message || regError.message}`);
    }

    setStatus('complete');
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔧 Connection Test
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Testing frontend → backend connectivity and authentication
          </Typography>
        </Box>

        {status === 'testing' && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography>Running tests...</Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          {results.map((result, index) => (
            <Alert 
              key={index}
              severity={result.success ? 'success' : 'error'}
              sx={{ mb: 1 }}
            >
              <strong>{result.test}:</strong> {result.message}
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                {result.timestamp}
              </Typography>
            </Alert>
          ))}
        </Box>

        <Button 
          variant="contained" 
          onClick={runTests}
          disabled={status === 'testing'}
        >
          Run Tests Again
        </Button>

        {status === 'complete' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If all tests pass ✅, then the backend authentication is working correctly.
              Any failures ❌ indicate specific issues to investigate.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ConnectionTest;