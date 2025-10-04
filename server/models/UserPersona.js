const { query, run } = require('../config/database');

class UserPersona {
  static async create(personaData) {
    const { 
      userId, 
      baseProfileId, 
      personalPreferences, 
      constraints, 
      budgetDetails, 
      accessibility, 
      groupDynamics 
    } = personaData;
    
    const sql = `
      INSERT INTO user_personas (
        user_id, 
        base_profile_id, 
        personal_preferences, 
        constraints, 
        budget_details, 
        accessibility_needs, 
        group_dynamics,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    const result = await run(sql, [
      userId,
      baseProfileId,
      JSON.stringify(personalPreferences),
      JSON.stringify(constraints),
      JSON.stringify(budgetDetails),
      JSON.stringify(accessibility),
      JSON.stringify(groupDynamics)
    ]);
    
    return await this.findById(result.lastID);
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT up.*, tp.name as base_profile_name, tp.description as base_description
      FROM user_personas up
      LEFT JOIN traveler_profiles tp ON up.base_profile_id = tp.id
      WHERE up.user_id = ?
      ORDER BY up.updated_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  static async findById(id) {
    const sql = `
      SELECT up.*, tp.name as base_profile_name, tp.description as base_description
      FROM user_personas up
      LEFT JOIN traveler_profiles tp ON up.base_profile_id = tp.id
      WHERE up.id = ?
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (typeof updateData[key] === 'object') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(updateData[key]));
      } else {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    fields.push('updated_at = datetime("now")');
    values.push(id);

    const sql = `UPDATE user_personas SET ${fields.join(', ')} WHERE id = ?`;
    await run(sql, values);
    return await this.findById(id);
  }
}

module.exports = UserPersona;