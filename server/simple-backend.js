const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🚀 Starting SIMPLE backend...');

const app = express();

// Basic middleware only
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Simple backend is working!' 
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend test successful!' });
});

// Serve working frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'working-frontend.html'));
});

const PORT = 5000;

console.log('⏳ Starting server...');

app.listen(PORT, () => {
  console.log(`✅ SIMPLE backend running on http://localhost:${PORT}`);
  console.log(`🔍 Test: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});