const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🚀 Starting step-by-step server...');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

console.log('✅ Basic middleware loaded');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('✅ Health route added');

// Try loading routes one by one
try {
  console.log('📋 Loading auth route...');
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth route loaded');
} catch (error) {
  console.error('❌ Auth route error:', error.message);
}

try {
  console.log('📋 Loading profiles route...');
  app.use('/api/profiles', require('./routes/profiles'));
  console.log('✅ Profiles route loaded');
} catch (error) {
  console.error('❌ Profiles route error:', error.message);
}

try {
  console.log('📋 Loading trips route...');
  app.use('/api/trips', require('./routes/trips'));
  console.log('✅ Trips route loaded');
} catch (error) {
  console.error('❌ Trips route error:', error.message);
}

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔍 Test: http://localhost:${PORT}/api/health`);
});