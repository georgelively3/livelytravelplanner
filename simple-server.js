const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from the React build directory
const buildPath = path.join(__dirname, 'client', 'build');
app.use(express.static(buildPath));

// API proxy - redirect all /api requests to the backend
app.use('/api', (req, res) => {
  const backendUrl = `http://localhost:5000${req.url}`;
  res.redirect(307, backendUrl);
});

// Serve React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Travel Planner running on http://localhost:${PORT}`);
  console.log(`📡 Backend API available at http://localhost:5000`);
  console.log(`🧳 Ready to plan your AI-powered trips!`);
});

app.listen(PORT, () => {
  console.log(`🌐 Travel Planner running on http://localhost:${PORT}`);
  console.log(`📡 Backend API proxied from http://localhost:5000`);
  console.log(`🧳 Ready to plan your AI-powered trips!`);
});