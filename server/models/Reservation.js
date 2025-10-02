const { query, run } = require('../config/database');

class Reservation {
  static async create(reservationData) {
    const {
      activityId,
      type,
      provider,
      confirmationNumber,
      cost,
      reservationDate,
      reservationTime,
      numberOfPeople,
      specialRequests,
      status
    } = reservationData;

    const sql = `
      INSERT INTO reservations (
        activity_id, type, provider, confirmation_number, cost,
        reservation_date, reservation_time, number_of_people, 
        special_requests, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    const result = await run(sql, [
      activityId, type, provider, confirmationNumber, cost,
      reservationDate, reservationTime, numberOfPeople,
      specialRequests, status || 'pending'
    ]);
    
    return await this.findById(result.lastID);
  }

  static async findByActivityId(activityId) {
    const sql = 'SELECT * FROM reservations WHERE activity_id = ?';
    const result = await query(sql, [activityId]);
    return result.rows;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM reservations WHERE id = ?';
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
      UPDATE reservations 
      SET ${fields.join(', ')}, updated_at = datetime('now')
      WHERE id = ?
    `;

    await run(sql, values);
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM reservations WHERE id = ?';
    const result = await run(sql, [id]);
    return result.changes > 0;
  }
}

module.exports = Reservation;