const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('Starting server...');

try {
  // Initialize database connection
  console.log('Importing database...');
  require('./config/database');
  console.log('Database imported successfully');

  const app = express();
  const PORT = process.env.PORT || 5000;

  // Security middleware
  console.log('Setting up middleware...');
  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Test route
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
  });

  // Routes
  console.log('Setting up routes...');
  try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('Auth routes loaded');
  } catch (err) {
    console.error('Error loading auth routes:', err);
  }

  try {
    app.use('/api/trips', require('./routes/trips'));
    console.log('Trips routes loaded');
  } catch (err) {
    console.error('Error loading trips routes:', err);
  }

  try {
    app.use('/api/profiles', require('./routes/profiles'));
    console.log('Profiles routes loaded');
  } catch (err) {
    console.error('Error loading profiles routes:', err);
  }

  try {
    app.use('/api/activities', require('./routes/activities'));
    console.log('Activities routes loaded');
  } catch (err) {
    console.error('Error loading activities routes:', err);
  }

  try {
    app.use('/api/reservations', require('./routes/reservations'));
    console.log('Reservations routes loaded');
  } catch (err) {
    console.error('Error loading reservations routes:', err);
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Server is ready to accept connections');
  });

} catch (error) {
  console.error('Error starting server:', error);
  process.exit(1);
}