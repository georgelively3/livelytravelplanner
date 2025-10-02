const { query, run } = require('../config/database');

class TravelerProfile {
  static async getAll() {
    const sql = `
      SELECT * FROM traveler_profiles 
      ORDER BY name
    `;
    const result = await query(sql);
    return result.rows;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM traveler_profiles WHERE id = ?';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async create(profileData) {
    const { name, description, preferences, constraints } = profileData;
    const sql = `
      INSERT INTO traveler_profiles (name, description, preferences, constraints, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    const result = await run(sql, [
      name, 
      description, 
      JSON.stringify(preferences), 
      JSON.stringify(constraints)
    ]);
    
    return await this.findById(result.lastID);
  }
}

module.exports = TravelerProfile;