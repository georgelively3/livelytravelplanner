-- Add user_personas table for enhanced persona system
CREATE TABLE IF NOT EXISTS user_personas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  base_profile_id INTEGER NOT NULL,
  
  -- Rich personal preferences
  personal_preferences TEXT NOT NULL, -- JSON: interests, preferred activities, cuisines, etc.
  
  -- Constraints and requirements  
  constraints TEXT, -- JSON: time constraints, physical limitations, dietary restrictions
  
  -- Budget breakdown
  budget_details TEXT, -- JSON: total budget, daily budget, category allocations
  
  -- Accessibility needs
  accessibility_needs TEXT, -- JSON: mobility, visual, hearing, cognitive accommodations
  
  -- Group dynamics
  group_dynamics TEXT, -- JSON: travel companions, ages, relationships, decision making
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (base_profile_id) REFERENCES traveler_profiles (id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_personas_user_id ON user_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_personas_base_profile ON user_personas(base_profile_id);