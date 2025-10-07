// Debug server startup
console.log('🚀 Starting debug server...');

try {
  console.log('📦 Loading environment variables...');
  require('dotenv').config();
  console.log('✅ Environment loaded');

  console.log('🗄️  Initializing database...');
  require('./config/database');
  console.log('✅ Database initialized');

  console.log('📋 Loading Express app...');
  const app = require('./index.js');
  console.log('✅ Express app loaded');

  const PORT = process.env.PORT || 5000;
  console.log(`🌐 Starting server on port ${PORT}...`);

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('❌ Startup error:', error);
  process.exit(1);
}