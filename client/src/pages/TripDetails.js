import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Loading from '../components/Common/Loading';
import axios from 'axios';

const TripDetails = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await axios.get(`/api/trips/${id}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlotColor = (timeSlot) => {
    switch (timeSlot) {
      case 'morning': return 'info';
      case 'afternoon': return 'warning';
      case 'evening': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return <Loading message="Loading trip details..." />;
  }

  if (!trip) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5">Trip not found</Typography>
        <Button component={Link} to="/dashboard" sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {trip.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {trip.destination}
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
              <Chip 
                icon={<CalendarTodayIcon />}
                label={`${format(new Date(trip.start_date), 'MMM dd')} - ${format(new Date(trip.end_date), 'MMM dd, yyyy')}`}
                color="primary"
              />
              <Chip 
                label={trip.profile_name}
                color="secondary" 
              />
              <Chip 
                label={`${trip.number_of_travelers} traveler${trip.number_of_travelers !== 1 ? 's' : ''}`}
              />
              {trip.budget && (
                <Chip 
                  icon={<AttachMoneyIcon />}
                  label={`Budget: $${trip.budget}`}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={4} textAlign="right">
            <Button 
              variant="contained" 
              component={Link} 
              to="/dashboard"
              sx={{ mr: 1 }}
            >
              Back to Dashboard
            </Button>
            <Button variant="outlined">
              Edit Trip
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h4" gutterBottom>
        Itinerary
      </Typography>

      {trip.itinerary && trip.itinerary.length > 0 ? (
        trip.itinerary.map((day, index) => (
          <Accordion key={day.id} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Day {day.day_number} - {format(new Date(day.date), 'EEEE, MMMM dd')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {day.activities && day.activities.length > 0 ? (
                <Grid container spacing={2}>
                  {day.activities.map((activity) => (
                    <Grid item xs={12} md={4} key={activity.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Typography variant="h6" component="h3">
                              {activity.title}
                            </Typography>
                            <Chip 
                              label={activity.time_slot} 
                              size="small" 
                              color={getTimeSlotColor(activity.time_slot)}
                            />
                          </Box>
                          
                          {activity.description && (
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              {activity.description}
                            </Typography>
                          )}
                          
                          <List dense>
                            {activity.start_time && (
                              <ListItem disablePadding>
                                <AccessTimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                                <ListItemText 
                                  primary={`${activity.start_time.slice(0,5)} - ${activity.end_time.slice(0,5)}`}
                                />
                              </ListItem>
                            )}
                            
                            {activity.location && (
                              <ListItem disablePadding>
                                <LocationOnIcon sx={{ mr: 1, fontSize: 'small' }} />
                                <ListItemText primary={activity.location} />
                              </ListItem>
                            )}
                            
                            {activity.cost > 0 && (
                              <ListItem disablePadding>
                                <AttachMoneyIcon sx={{ mr: 1, fontSize: 'small' }} />
                                <ListItemText primary={`$${activity.cost}`} />
                              </ListItem>
                            )}
                          </List>
                          
                          {activity.reservation_required && (
                            <Box mt={1}>
                              <Chip 
                                label="Reservation Required" 
                                size="small" 
                                color="warning"
                                variant="outlined"
                              />
                            </Box>
                          )}
                          
                          {activity.notes && (
                            <>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                {activity.notes}
                              </Typography>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No activities planned for this day
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No itinerary generated yet
          </Typography>
          <Typography color="text.secondary">
            The itinerary will be automatically generated based on your traveler profile.
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default TripDetails;