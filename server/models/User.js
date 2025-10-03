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
    return result.rows[0] || null;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    if (updateData.firstName) {
      fields.push('first_name = ?');
      values.push(updateData.firstName);
    }
    if (updateData.lastName) {
      fields.push('last_name = ?');
      values.push(updateData.lastName);
    }
    if (updateData.email) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    
    if (fields.length === 0) {
      return null;
    }
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    try {
      await run(sql, values);
      return await this.findById(id);
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    try {
      const result = await run(sql, [id]);
      return result.changes > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = User;