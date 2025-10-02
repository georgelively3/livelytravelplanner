import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Fab
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import Loading from '../components/Common/Loading';
import axios from 'axios';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('/api/trips');
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your trips..." />;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" component="h1">
          My Trips
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/create-trip"
          size="large"
        >
          Create New Trip
        </Button>
      </Box>

      {trips.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
          textAlign="center"
        >
          <FlightTakeoffIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No trips planned yet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Start planning your next adventure by creating your first trip
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            component={Link}
            to="/create-trip"
          >
            Create Your First Trip
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {trips.map((trip) => (
            <Grid item xs={12} md={6} lg={4} key={trip.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {trip.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <FlightTakeoffIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2" color="text.secondary">
                      {trip.destination}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarTodayIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(trip.start_date), 'MMM dd')} - {format(new Date(trip.end_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2" color="text.secondary">
                      {trip.number_of_travelers} traveler{trip.number_of_travelers !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={trip.profile_name} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/trip/${trip.id}`}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="create trip"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        component={Link}
        to="/create-trip"
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default Dashboard;