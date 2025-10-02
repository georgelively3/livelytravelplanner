const { query, run } = require('../config/database');

class User {
  static async create({ email, password, firstName, lastName }) {
    const sql = `
      INSERT INTO users (email, password, first_name, last_name, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    const result = await run(sql, [email, password, firstName, lastName]);
    
    // Get the created user
    const user = await this.findById(result.lastID);
    return user;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = 'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = User;