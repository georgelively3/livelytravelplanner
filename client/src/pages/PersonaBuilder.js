import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Box,
  Grid,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PersonaBuilder = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [baseProfiles, setBaseProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  const [personaData, setPersonaData] = useState({
    baseProfileId: '',
    personalPreferences: {
      interests: [],
      cuisineTypes: [],
      activityLevels: [],
      culturalInterests: [],
      shoppingPreferences: [],
      nightlife: false,
      outdoorActivities: false,
      relaxationImportance: 5
    },
    constraints: {
      timeConstraints: [],
      physicalLimitations: [],
      dietaryRestrictions: [],
      languageBarriers: false,
      budgetFlexibility: 5
    },
    budgetDetails: {
      totalBudget: '',
      dailyBudget: '',
      categoryAllocations: {
        accommodation: 30,
        food: 25,
        activities: 25,
        transportation: 15,
        shopping: 5
      },
      splurgeAreas: []
    },
    accessibility: {
      mobilityNeeds: [],
      sensoryNeeds: [],
      cognitiveNeeds: [],
      communicationNeeds: []
    },
    groupDynamics: {
      companions: [],
      decisionMaker: 'shared',
      pacePreference: 'moderate',
      compromiseAreas: []
    }
  });

  const steps = [
    'Base Profile Selection',
    'Personal Interests',
    'Constraints & Requirements', 
    'Budget Planning',
    'Accessibility Needs',
    'Group Dynamics'
  ];

  useEffect(() => {
    fetchBaseProfiles();
  }, []);

  const fetchBaseProfiles = async () => {
    try {
      const response = await axios.get('/api/profiles');
      setBaseProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to load traveler profiles');
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePersonaUpdate = (section, field, value) => {
    setPersonaData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayUpdate = (section, field, value, action = 'toggle') => {
    setPersonaData(prev => {
      const currentArray = prev[section][field] || [];
      let newArray;
      
      if (action === 'toggle') {
        newArray = currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value];
      } else if (action === 'add' && !currentArray.includes(value)) {
        newArray = [...currentArray, value];
      }
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/personas', personaData);
      console.log('Persona created successfully:', response.data);
      navigate('/dashboard', { 
        state: { message: 'Travel persona created successfully!' }
      });
    } catch (error) {
      console.error('Error creating persona:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(error.response.data.message || 'Failed to create travel persona');
      } else {
        setError('Failed to create travel persona');
      }
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Your Base Travel Style
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Base Profile</InputLabel>
              <Select
                value={personaData.baseProfileId}
                onChange={(e) => setPersonaData(prev => ({ ...prev, baseProfileId: e.target.value }))}
                label="Base Profile"
              >
                {baseProfiles.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    <Box>
                      <Typography variant="subtitle1">{profile.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What Do You Love to Experience?
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Interests & Activities</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {['Museums & Galleries', 'Historical Sites', 'Architecture', 'Local Markets', 'Street Art', 'Live Music', 'Theater & Shows', 'Sports Events', 'Festivals', 'Photography'].map((interest) => (
                    <Grid item key={interest}>
                      <Chip
                        label={interest}
                        clickable
                        color={personaData.personalPreferences.interests.includes(interest) ? 'primary' : 'default'}
                        onClick={() => handleArrayUpdate('personalPreferences', 'interests', interest)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Cuisine Preferences</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {['Local Street Food', 'Fine Dining', 'Vegetarian/Vegan', 'Seafood', 'Traditional Cuisine', 'Fusion Food', 'Food Markets', 'Cooking Classes', 'Wine Tasting', 'Coffee Culture'].map((cuisine) => (
                    <Grid item key={cuisine}>
                      <Chip
                        label={cuisine}
                        clickable
                        color={personaData.personalPreferences.cuisineTypes.includes(cuisine) ? 'primary' : 'default'}
                        onClick={() => handleArrayUpdate('personalPreferences', 'cuisineTypes', cuisine)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Box mt={2}>
              <Typography gutterBottom>How important is relaxation vs. activities?</Typography>
              <Slider
                value={personaData.personalPreferences.relaxationImportance}
                onChange={(e, value) => handlePersonaUpdate('personalPreferences', 'relaxationImportance', value)}
                min={1}
                max={10}
                step={1}
                marks={[
                  { value: 1, label: 'Always Active' },
                  { value: 5, label: 'Balanced' },
                  { value: 10, label: 'Very Relaxed' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Constraints & Requirements
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Time Constraints</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {['Early morning starts OK', 'Late evening activities OK', 'Need afternoon rest', 'Prefer shorter activities', 'Can handle long travel days'].map((constraint) => (
                    <FormControlLabel
                      key={constraint}
                      control={
                        <Checkbox
                          checked={personaData.constraints.timeConstraints.includes(constraint)}
                          onChange={() => handleArrayUpdate('constraints', 'timeConstraints', constraint)}
                        />
                      }
                      label={constraint}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Physical Considerations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {['Limited walking distance', 'No stairs/steps', 'Need frequent breaks', 'Avoid crowded spaces', 'Temperature sensitive'].map((limitation) => (
                    <FormControlLabel
                      key={limitation}
                      control={
                        <Checkbox
                          checked={personaData.constraints.physicalLimitations.includes(limitation)}
                          onChange={() => handleArrayUpdate('constraints', 'physicalLimitations', limitation)}
                        />
                      }
                      label={limitation}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Box mt={2}>
              <Typography gutterBottom>Budget Flexibility</Typography>
              <Slider
                value={personaData.constraints.budgetFlexibility}
                onChange={(e, value) => handlePersonaUpdate('constraints', 'budgetFlexibility', value)}
                min={1}
                max={10}
                step={1}
                marks={[
                  { value: 1, label: 'Very Strict' },
                  { value: 5, label: 'Moderate' },
                  { value: 10, label: 'Very Flexible' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Budget Planning
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Trip Budget"
                  value={personaData.budgetDetails.totalBudget}
                  onChange={(e) => handlePersonaUpdate('budgetDetails', 'totalBudget', e.target.value)}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Daily Budget"
                  value={personaData.budgetDetails.dailyBudget}
                  onChange={(e) => handlePersonaUpdate('budgetDetails', 'dailyBudget', e.target.value)}
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Budget Allocation (%)
            </Typography>
            
            {Object.entries(personaData.budgetDetails.categoryAllocations).map(([category, percentage]) => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  {category.charAt(0).toUpperCase() + category.slice(1)}: {percentage}%
                </Typography>
                <Slider
                  value={percentage}
                  onChange={(e, value) => setPersonaData(prev => ({
                    ...prev,
                    budgetDetails: {
                      ...prev.budgetDetails,
                      categoryAllocations: {
                        ...prev.budgetDetails.categoryAllocations,
                        [category]: value
                      }
                    }
                  }))}
                  min={0}
                  max={60}
                  step={5}
                  valueLabelDisplay="auto"
                />
              </Box>
            ))}

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Where are you willing to splurge?
            </Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {['Accommodation', 'Fine Dining', 'Unique Experiences', 'Transportation', 'Shopping', 'Entertainment'].map((splurge) => (
                <Grid item key={splurge}>
                  <Chip
                    label={splurge}
                    clickable
                    color={personaData.budgetDetails.splurgeAreas.includes(splurge) ? 'primary' : 'default'}
                    onClick={() => handleArrayUpdate('budgetDetails', 'splurgeAreas', splurge)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Accessibility Needs
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Mobility Accommodations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {['Wheelchair accessible', 'Elevator access required', 'Ground floor preferred', 'Wide doorways needed', 'Accessible parking required'].map((need) => (
                    <FormControlLabel
                      key={need}
                      control={
                        <Checkbox
                          checked={personaData.accessibility.mobilityNeeds.includes(need)}
                          onChange={() => handleArrayUpdate('accessibility', 'mobilityNeeds', need)}
                        />
                      }
                      label={need}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Sensory Accommodations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {['Visual impairment considerations', 'Hearing assistance needed', 'Audio descriptions helpful', 'Sign language services', 'Quiet environment preferred'].map((need) => (
                    <FormControlLabel
                      key={need}
                      control={
                        <Checkbox
                          checked={personaData.accessibility.sensoryNeeds.includes(need)}
                          onChange={() => handleArrayUpdate('accessibility', 'sensoryNeeds', need)}
                        />
                      }
                      label={need}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Group Dynamics
            </Typography>
            
            <TextField
              fullWidth
              label="Travel Companions"
              placeholder="e.g., Spouse, 2 children (ages 8, 12), elderly parent"
              value={personaData.groupDynamics.companions.join(', ')}
              onChange={(e) => setPersonaData(prev => ({
                ...prev,
                groupDynamics: {
                  ...prev.groupDynamics,
                  companions: e.target.value.split(', ').filter(c => c.trim())
                }
              }))}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Primary Decision Maker</InputLabel>
              <Select
                value={personaData.groupDynamics.decisionMaker}
                onChange={(e) => handlePersonaUpdate('groupDynamics', 'decisionMaker', e.target.value)}
                label="Primary Decision Maker"
              >
                <MenuItem value="me">Myself</MenuItem>
                <MenuItem value="shared">Shared decisions</MenuItem>
                <MenuItem value="partner">Partner/Spouse</MenuItem>
                <MenuItem value="group">Group consensus</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Preferred Travel Pace</InputLabel>
              <Select
                value={personaData.groupDynamics.pacePreference}
                onChange={(e) => handlePersonaUpdate('groupDynamics', 'pacePreference', e.target.value)}
                label="Preferred Travel Pace"
              >
                <MenuItem value="slow">Slow & relaxed</MenuItem>
                <MenuItem value="moderate">Moderate pace</MenuItem>
                <MenuItem value="fast">Fast-paced & efficient</MenuItem>
                <MenuItem value="flexible">Flexible based on mood</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Areas where you're willing to compromise:
            </Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {['Accommodation level', 'Dining choices', 'Activity types', 'Schedule flexibility', 'Budget allocation', 'Transportation method'].map((area) => (
                <Grid item key={area}>
                  <Chip
                    label={area}
                    clickable
                    color={personaData.groupDynamics.compromiseAreas.includes(area) ? 'primary' : 'default'}
                    onClick={() => handleArrayUpdate('groupDynamics', 'compromiseAreas', area)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Build Your Travel Persona
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Help us understand your travel style to create the perfect itinerary
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Create Persona' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default PersonaBuilder;