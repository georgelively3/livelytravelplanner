const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Use different database for tests
const dbName = process.env.NODE_ENV === 'test' ? 'test.db' : 'travel_planner.db';
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', dbName);

// Create database directory if it doesn't exist
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create and configure database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Initialize database with required tables
const initialize = async () => {
  const setupScript = require('../scripts/setupDatabase');
  await setupScript();
};

// Promisify database operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve({ rows });
      }
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ 
          lastID: this.lastID, 
          changes: this.changes,
          rows: [{ id: this.lastID }] // For compatibility with existing code
        });
      }
    });
  });
};

module.exports = {
  query,
  run,
  db,
  initialize
};