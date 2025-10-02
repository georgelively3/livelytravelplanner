import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Grid
} from '@mui/material';

import { useNavigate } from 'react-router-dom';
import Loading from '../components/Common/Loading';
import axios from 'axios';

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: null,
    endDate: null,
    travelerProfileId: '',
    numberOfTravelers: 1,
    budget: ''
  });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get('/api/profiles');
      setProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to load traveler profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation
    if (!formData.title || !formData.destination || !formData.startDate || 
        !formData.endDate || !formData.travelerProfileId) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (formData.startDate >= formData.endDate) {
      setError('End date must be after start date');
      setSubmitting(false);
      return;
    }

    // Additional validation for travelerProfileId
    if (!formData.travelerProfileId || formData.travelerProfileId === '') {
      setError('Please select a traveler profile');
      setSubmitting(false);
      return;
    }

    // Prepare trip data outside try block for error logging
    const tripData = {
      title: formData.title,
      destination: formData.destination,
      startDate: formData.startDate.toISOString().split('T')[0],
      endDate: formData.endDate.toISOString().split('T')[0],
      travelerProfileId: parseInt(formData.travelerProfileId, 10),
      numberOfTravelers: parseInt(formData.numberOfTravelers, 10)
    };

    // Only include budget if it has a value
    if (formData.budget && formData.budget !== '' && formData.budget !== '0') {
      tripData.budget = parseFloat(formData.budget);
    }

    // Final validation check
    if (isNaN(tripData.travelerProfileId)) {
      setError('Please select a valid traveler profile');
      setSubmitting(false);
      return;
    }

    try {
      console.log('Sending trip data:', tripData);
      console.log('Current token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('Axios headers:', axios.defaults.headers.common);

      const response = await axios.post('/api/trips', tripData);
      navigate(`/trip/${response.data.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      console.error('Request data sent:', tripData);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map(err => `${err.path}: ${err.msg}`)
          .join(', ');
        setError(`Validation errors: ${validationErrors}`);
      } else {
        setError(error.response?.data?.message || `Failed to create trip (Status: ${error.response?.status})`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading traveler profiles..." />;
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom align="center">
          Create New Trip
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Trip Title"
                  value={formData.title}
                  onChange={(e) => handleChange('title')(e.target.value)}
                  placeholder="e.g., Summer Vacation in Paris"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Destination"
                  value={formData.destination}
                  onChange={(e) => handleChange('destination')(e.target.value)}
                  placeholder="e.g., Paris, France"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('startDate')(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="End Date"
                  value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange('endDate')(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl required fullWidth>
                  <InputLabel>Traveler Profile</InputLabel>
                  <Select
                    value={formData.travelerProfileId}
                    onChange={(e) => handleChange('travelerProfileId')(e.target.value)}
                    label="Traveler Profile"
                  >
                    {profiles.map((profile) => (
                      <MenuItem key={profile.id} value={profile.id}>
                        <Box>
                          <Typography variant="subtitle1">
                            {profile.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {profile.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Number of Travelers"
                  value={formData.numberOfTravelers}
                  onChange={(e) => handleChange('numberOfTravelers')(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Budget (Optional)"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget')(e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="Total budget in USD"
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2 }}
              size="large"
              disabled={submitting}
            >
              {submitting ? 'Creating Trip...' : 'Create Trip & Generate Itinerary'}
            </Button>
          </Box>
      </Paper>
    </Container>
  );
};

export default CreateTrip;