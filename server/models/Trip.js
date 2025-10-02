const { query, run } = require('../config/database');

class Trip {
  static async create(tripData) {
    const { 
      userId, 
      title, 
      destination, 
      startDate, 
      endDate, 
      travelerProfileId, 
      numberOfTravelers, 
      budget 
    } = tripData;
    
    const sql = `
      INSERT INTO trips (
        user_id, title, destination, start_date, end_date, 
        traveler_profile_id, number_of_travelers, budget, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    const result = await run(sql, [
      userId, title, destination, startDate, endDate, 
      travelerProfileId, numberOfTravelers, budget
    ]);
    
    return await this.findById(result.lastID);
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT t.*, tp.name as profile_name, tp.description as profile_description
      FROM trips t
      LEFT JOIN traveler_profiles tp ON t.traveler_profile_id = tp.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, tp.name as profile_name, tp.preferences, tp.constraints
      FROM trips t
      LEFT JOIN traveler_profiles tp ON t.traveler_profile_id = tp.id
      WHERE t.id = ?
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `
      UPDATE trips 
      SET ${fields.join(', ')}, updated_at = datetime('now')
      WHERE id = ?
    `;

    await run(sql, values);
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM trips WHERE id = ?';
    const result = await run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = Trip;