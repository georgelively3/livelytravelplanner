import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ExploreIcon from '@mui/icons-material/Explore';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HikingIcon from '@mui/icons-material/Hiking';
import MuseumIcon from '@mui/icons-material/Museum';
import AccessibleIcon from '@mui/icons-material/Accessible';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const travelerProfiles = [
    {
      icon: <AccessibleIcon fontSize="large" />,
      title: "Mobility-Conscious Traveler",
      description: "Wheelchair accessible routes with minimal walking and convenient transportation options."
    },
    {
      icon: <FamilyRestroomIcon fontSize="large" />,
      title: "Family with Young Children", 
      description: "Kid-friendly activities, playgrounds, and family restaurants with shorter activity blocks."
    },
    {
      icon: <RestaurantIcon fontSize="large" />,
      title: "Foodie / Culinary Explorer",
      description: "Local cuisine focus with food tours, markets, cooking classes, and restaurant reservations."
    },
    {
      icon: <HikingIcon fontSize="large" />,
      title: "Adventure / Active Traveler",
      description: "High-energy activities like hiking, biking, and outdoor adventures for active explorers."
    },
    {
      icon: <MuseumIcon fontSize="large" />,
      title: "Cultural Enthusiast / History Buff",
      description: "Museums, galleries, historic landmarks, and guided tours for cultural immersion."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Plan Your Perfect Journey
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            Create personalized travel itineraries tailored to your unique travel style
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/create-trip"
                startIcon={<ExploreIcon />}
              >
                Create New Trip
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  to="/register"
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/login"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Travel Profiles for Every Explorer
        </Typography>
        
        <Grid container spacing={4}>
          {travelerProfiles.map((profile, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>
                    {profile.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {profile.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile.description}
                  </Typography>
                </CardContent>
                {isAuthenticated && (
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button 
                      size="small" 
                      color="primary" 
                      component={Link} 
                      to="/create-trip"
                    >
                      Plan Trip
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* How It Works Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  1
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Choose Your Profile
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Select a traveler profile that matches your preferences and needs
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  2
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Enter Trip Details
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Provide your destination, travel dates, and group size
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  3
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Get Your Itinerary
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Receive a personalized day-by-day itinerary with activities and reservations
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Home;