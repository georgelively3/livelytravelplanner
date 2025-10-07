const express = require('express');
const cors = require('cors');

console.log('✅ Basic imports successful');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

console.log('✅ Basic middleware added');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('✅ Health route added');

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`🔍 Test: http://localhost:${PORT}/api/health`);
});