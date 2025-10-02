const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Simple server is working' });
});

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
});

// Prevent unexpected exit
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});