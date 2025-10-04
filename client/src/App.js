import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import AICreateTrip from './pages/AICreateTrip';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';
import PersonaBuilder from './pages/PersonaBuilder';
import ConnectionTest from './pages/ConnectionTest';
import Loading from './components/Common/Loading';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="App">
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: 'calc(100vh - 200px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/create-trip" 
            element={isAuthenticated ? <CreateTrip /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/ai-create-trip" 
            element={isAuthenticated ? <AICreateTrip /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/trip/:id" 
            element={isAuthenticated ? <TripDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/persona-builder" 
            element={isAuthenticated ? <PersonaBuilder /> : <Navigate to="/login" />} 
          />
          <Route path="/test" element={<ConnectionTest />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
}

export default App;