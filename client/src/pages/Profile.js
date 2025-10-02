import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" gutterBottom>
            Profile
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              First Name
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.firstName || 'Not provided'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Last Name
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.lastName || 'Not provided'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Email Address
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email || 'Not provided'}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Profile management features coming soon!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;