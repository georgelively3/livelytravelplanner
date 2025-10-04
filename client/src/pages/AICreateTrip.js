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
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AutoAwesome,
  Preview,
  Save,
  Refresh
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import Loading from '../components/Common/Loading';
import axios from 'axios';

const AICreateTrip = () => {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: null,
    endDate: null,
    personaId: '',
    numberOfTravelers: 1,
    budget: 1000
  });
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewItinerary, setPreviewItinerary] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await axios.get('/api/personas');
      setPersonas(response.data.personas || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
      setError('Failed to load personas');
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

  const validateForm = () => {
    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.startDate >= formData.endDate) {
      setError('End date must be after start date');
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    return true;
  };

  const generatePreview = async () => {
    setError('');
    if (!validateForm()) return;

    setGenerating(true);
    try {
      const previewData = {
        destination: formData.destination,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        budget: parseFloat(formData.budget),
        travelers: parseInt(formData.numberOfTravelers, 10)
      };

      if (formData.personaId) {
        previewData.personaId = parseInt(formData.personaId, 10);
      }

      const response = await axios.post('/api/ai/preview', previewData);
      setPreviewItinerary(response.data.itinerary);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError(error.response?.data?.message || 'Failed to generate itinerary preview');
    } finally {
      setGenerating(false);
    }
  };

  const createAITrip = async () => {
    setError('');
    if (!validateForm()) return;

    setSaving(true);
    try {
      const tripData = {
        title: formData.title,
        destination: formData.destination,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate.toISOString().split('T')[0],
        budget: parseFloat(formData.budget),
        travelers: parseInt(formData.numberOfTravelers, 10)
      };

      if (formData.personaId) {
        tripData.personaId = parseInt(formData.personaId, 10);
      }

      const response = await axios.post('/api/ai/generate-trip', tripData);
      navigate(`/trip/${response.data.trip.id}`);
    } catch (error) {
      console.error('Error creating AI trip:', error);
      setError(error.response?.data?.message || 'Failed to create AI-powered trip');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return <Loading message="Loading personas..." />;
  }

  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AutoAwesome sx={{ mr: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h4" gutterBottom>
            AI-Powered Trip Creation
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Let our AI create a personalized itinerary based on your travel style and preferences.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Form Section */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Trip Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Trip Title"
                    value={formData.title}
                    onChange={(e) => handleChange('title')(e.target.value)}
                    placeholder="e.g., AI-Generated Paris Adventure"
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
                
                <Grid item xs={6}>
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
                
                <Grid item xs={6}>
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
                  <FormControl fullWidth>
                    <InputLabel>Travel Persona (Optional)</InputLabel>
                    <Select
                      value={formData.personaId}
                      onChange={(e) => handleChange('personaId')(e.target.value)}
                      label="Travel Persona (Optional)"
                    >
                      <MenuItem value="">
                        <em>No specific persona</em>
                      </MenuItem>
                      {personas.map((persona) => (
                        <MenuItem key={persona.id} value={persona.id}>
                          {persona.name || `Persona ${persona.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6}>
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
                
                <Grid item xs={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Total Budget"
                    value={formData.budget}
                    onChange={(e) => handleChange('budget')(e.target.value)}
                    inputProps={{ min: 100, step: 50 }}
                    placeholder="Budget in USD"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={generating ? <CircularProgress size={20} /> : <Preview />}
                  onClick={generatePreview}
                  disabled={generating}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {generating ? 'Generating Preview...' : 'Preview AI Itinerary'}
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={createAITrip}
                  disabled={saving}
                  fullWidth
                  size="large"
                >
                  {saving ? 'Creating Trip...' : 'Create AI-Powered Trip'}
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* AI Features Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Features
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Our AI will create a personalized itinerary featuring:
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip label="Personalized Activities" sx={{ m: 0.5 }} />
                  <Chip label="Smart Scheduling" sx={{ m: 0.5 }} />
                  <Chip label="Budget Optimization" sx={{ m: 0.5 }} />
                  <Chip label="Local Recommendations" sx={{ m: 0.5 }} />
                  <Chip label="Accessibility Considerations" sx={{ m: 0.5 }} />
                </Box>
                
                {formData.destination && formData.startDate && formData.endDate && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Trip Summary
                    </Typography>
                    <Typography variant="body2">
                      <strong>Destination:</strong> {formData.destination}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1} days
                    </Typography>
                    <Typography variant="body2">
                      <strong>Budget:</strong> {formatCurrency(formData.budget)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Daily Budget:</strong> {formatCurrency(formData.budget / (Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1))}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          AI Itinerary Preview
        </DialogTitle>
        <DialogContent>
          {previewItinerary && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewItinerary.destination} - {previewItinerary.days} Days
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Budget: {formatCurrency(previewItinerary.totalBudget)}
              </Typography>
              
              {previewItinerary.dailyItinerary.map((day, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Day {day.dayNumber} - {day.theme}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {day.date} ({day.dayOfWeek}) - Daily Budget: {formatCurrency(day.totalCost)}
                    </Typography>
                    
                    {day.activities.map((activity, actIndex) => (
                      <Box key={actIndex} sx={{ ml: 2, mb: 1 }}>
                        <Typography variant="subtitle2">
                          {activity.startTime} - {activity.endTime}: {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description} - {formatCurrency(activity.estimatedCost)}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={createAITrip} disabled={saving}>
            {saving ? 'Creating...' : 'Create This Trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AICreateTrip;