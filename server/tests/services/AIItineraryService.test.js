const AIItineraryService = require('../../services/AIItineraryService');

describe('AIItineraryService', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIItineraryService();
  });

  describe('generateItinerary', () => {
    test('should generate a basic itinerary with default persona', async () => {
      const params = {
        destination: 'Paris, France',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-03'),
        budget: 1500,
        travelers: 2
      };

      const result = await aiService.generateItinerary(params);

      expect(result).toBeDefined();
      expect(result.destination).toBe('Paris, France');
      expect(result.days).toBe(3);
      expect(result.totalBudget).toBe(1500);
      expect(result.travelers).toBe(2);
      expect(result.dailyItinerary).toHaveLength(3);
      expect(result.aiGenerated).toBe(true);

      // Check first day structure
      const firstDay = result.dailyItinerary[0];
      expect(firstDay.dayNumber).toBe(1);
      expect(firstDay.activities).toHaveLength(3); // morning, afternoon, evening
      expect(firstDay.activities[0].timeSlot).toBe('morning');
      expect(firstDay.activities[1].timeSlot).toBe('afternoon');
      expect(firstDay.activities[2].timeSlot).toBe('evening');
    });

    test('should generate adventure-focused itinerary for adventure persona', async () => {
      const adventurePersona = {
        name: 'Adventure Seeker',
        personalPreferences: { activities: ['hiking', 'biking'] }
      };

      const params = {
        destination: 'Colorado',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-17'),
        persona: adventurePersona,
        budget: 1200,
        travelers: 1
      };

      const result = await aiService.generateItinerary(params);

      expect(result.persona).toBe('Adventure Seeker');
      
      // Check that activities are adventure-focused
      const activities = result.dailyItinerary.flatMap(day => day.activities);
      const adventureActivities = activities.filter(activity => 
        activity.category === 'adventure' || 
        activity.title.toLowerCase().includes('hiking') ||
        activity.title.toLowerCase().includes('bike')
      );
      
      expect(adventureActivities.length).toBeGreaterThan(0);
    });

    test('should generate family-friendly itinerary for family persona', async () => {
      const familyPersona = {
        name: 'Family Traveler',
        personalPreferences: { familyFriendly: true }
      };

      const params = {
        destination: 'Orlando, Florida',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-08-02'),
        persona: familyPersona,
        budget: 800,
        travelers: 4
      };

      const result = await aiService.generateItinerary(params);

      // Check for family-friendly activities
      const activities = result.dailyItinerary.flatMap(day => day.activities);
      const familyActivities = activities.filter(activity => 
        activity.category === 'family' ||
        (activity.accessibility && activity.accessibility.family_friendly)
      );
      
      expect(familyActivities.length).toBeGreaterThan(0);
    });

    test('should respect budget constraints', async () => {
      const params = {
        destination: 'New York City',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-02'),
        budget: 200, // Low budget
        travelers: 1
      };

      const result = await aiService.generateItinerary(params);

      const totalCost = result.dailyItinerary.reduce((sum, day) => sum + day.totalCost, 0);
      expect(totalCost).toBeLessThanOrEqual(params.budget * 1.1); // Allow 10% buffer
    });
  });

  describe('determinePersonaType', () => {
    test('should identify adventure persona', () => {
      const persona = { name: 'Adventure Seeker' };
      expect(aiService.determinePersonaType(persona)).toBe('adventure');
    });

    test('should identify foodie persona', () => {
      const persona = { name: 'Foodie Explorer' };
      expect(aiService.determinePersonaType(persona)).toBe('foodie');
    });

    test('should identify family persona', () => {
      const persona = { name: 'Family Fun' };
      expect(aiService.determinePersonaType(persona)).toBe('family');
    });

    test('should identify mobility persona', () => {
      const persona = { name: 'Mobility Conscious Traveler' };
      expect(aiService.determinePersonaType(persona)).toBe('mobility');
    });

    test('should default to cultural for unknown persona', () => {
      const persona = { name: 'Unknown Type' };
      expect(aiService.determinePersonaType(persona)).toBe('cultural');
    });

    test('should default to cultural for null persona', () => {
      expect(aiService.determinePersonaType(null)).toBe('cultural');
    });
  });

  describe('calculateDays', () => {
    test('should calculate single day correctly', () => {
      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-06-01');
      expect(aiService.calculateDays(startDate, endDate)).toBe(1);
    });

    test('should calculate multiple days correctly', () => {
      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-06-05');
      expect(aiService.calculateDays(startDate, endDate)).toBe(5);
    });
  });

  describe('calculateEndTime', () => {
    test('should calculate end time correctly within same day', () => {
      expect(aiService.calculateEndTime('09:00', 150)).toBe('11:30');
      expect(aiService.calculateEndTime('14:30', 120)).toBe('16:30');
    });

    test('should handle time calculation across midnight', () => {
      expect(aiService.calculateEndTime('23:00', 120)).toBe('01:00');
    });
  });

  describe('getActivityTemplates', () => {
    test('should return adventure templates for adventure persona', () => {
      const templates = aiService.getActivityTemplates('adventure');
      expect(templates.morning).toBeDefined();
      expect(templates.afternoon).toBeDefined();
      expect(templates.evening).toBeDefined();
      
      // Check that templates contain adventure activities
      const morningActivity = templates.morning[0];
      expect(morningActivity.category).toBe('adventure');
    });

    test('should return cultural templates as default', () => {
      const templates = aiService.getActivityTemplates('unknown');
      expect(templates.morning).toBeDefined();
      
      const morningActivity = templates.morning[0];
      expect(morningActivity.category).toBe('cultural');
    });
  });
});