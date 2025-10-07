console.log('Starting super simple server...');

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'OK', message: 'Simple server working!' }));
});

const PORT = 8000;

server.listen(PORT, () => {
  console.log(`✅ Simple HTTP server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});