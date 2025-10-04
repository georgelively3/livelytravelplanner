const { query, run } = require('../config/database');

class ItineraryDay {
  static async create(dayData) {
    const { tripId, date, dayNumber } = dayData;
    const sql = `
      INSERT INTO itinerary_days (trip_id, date, day_number, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    const result = await run(sql, [tripId, date, dayNumber]);
    return await this.findById(result.lastID);
  }

  static async findByTripId(tripId) {
    const sql = `
      SELECT * FROM itinerary_days 
      WHERE trip_id = ? 
      ORDER BY day_number
    `;
    const result = await query(sql, [tripId]);
    return result.rows;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM itinerary_days WHERE id = ?';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const sql = 'DELETE FROM itinerary_days WHERE id = ?';
    const result = await run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = ItineraryDay;