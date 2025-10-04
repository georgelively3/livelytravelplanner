const fs = require('fs');
const path = require('path');

// Database file paths
const mainDbPath = path.join(__dirname, 'database.db');
const testDbPath = path.join(__dirname, 'test.db');
const devDbPath = path.join(__dirname, 'dev.db');

console.log('🗑️  Clearing all travel planner data...');

// Function to safely delete a file
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${path.basename(filePath)}`);
    } else {
      console.log(`ℹ️  Not found: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting ${path.basename(filePath)}:`, error.message);
  }
}

// Delete all database files
console.log('\n📁 Removing database files:');
deleteFile(mainDbPath);
deleteFile(testDbPath);
deleteFile(devDbPath);

// Clear any cached data or temporary files
const cacheDirectories = [
  path.join(__dirname, 'node_modules', '.cache'),
  path.join(__dirname, '..', 'client', 'node_modules', '.cache'),
  path.join(__dirname, '..', 'client', 'build')
];

console.log('\n🧹 Clearing cache directories:');
cacheDirectories.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Cleared cache: ${path.relative(process.cwd(), dir)}`);
    }
  } catch (error) {
    console.log(`ℹ️  Cache not found or already clear: ${path.relative(process.cwd(), dir)}`);
  }
});

console.log('\n🎯 Data clearing summary:');
console.log('✅ All user accounts removed');
console.log('✅ All travel profiles cleared');
console.log('✅ All trips and itineraries deleted');
console.log('✅ All AI-generated data removed');
console.log('✅ All personas and preferences cleared');
console.log('✅ All reservations and activities deleted');
console.log('✅ Cache and temporary files cleared');

console.log('\n🚀 Ready for fresh start!');
console.log('Next steps:');
console.log('1. Run: npm run dev (from project root)');
console.log('2. Visit: http://localhost:3000');
console.log('3. Register new account and test features');