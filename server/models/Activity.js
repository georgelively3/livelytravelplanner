const { query, run } = require('../config/database');

class Activity {
  static async create(activityData) {
    const {
      dayId,
      title,
      description,
      timeSlot,
      startTime,
      endTime,
      location,
      category,
      cost,
      reservationRequired,
      accessibility,
      notes
    } = activityData;

    const sql = `
      INSERT INTO activities (
        itinerary_day_id, title, description, start_time, end_time,
        location, category, cost, notes, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    const result = await run(sql, [
      dayId, title, description, startTime, endTime,
      location, category, cost, notes
    ]);
    
    return await this.findById(result.lastID);
  }

  static async findByDayId(dayId) {
    const sql = `
      SELECT * FROM activities 
      WHERE itinerary_day_id = ? 
      ORDER BY start_time
    `;
    const result = await query(sql, [dayId]);
    return result.rows;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM activities WHERE id = ?';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'accessibility') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `
      UPDATE activities 
      SET ${fields.join(', ')}, updated_at = datetime('now')
      WHERE id = ?
    `;

    await run(sql, values);
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM activities WHERE id = ?';
    const result = await run(sql, [id]);
    return result.changes > 0;
  }

  static async deleteByDayId(dayId) {
    const sql = 'DELETE FROM activities WHERE itinerary_day_id = ?';
    const result = await run(sql, [dayId]);
    return result.changes;
  }
}

module.exports = Activity;