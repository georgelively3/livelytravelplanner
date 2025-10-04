const axios = require('axios');

class AIItineraryService {
  constructor() {
    // For now, we'll use a mock AI service
    // Later this can be replaced with OpenAI, Claude, or other AI APIs
    this.useRealAI = false; // Set to true when you have an AI API key
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Generate an AI-powered itinerary based on user profile, destination, and timeframe
   * @param {Object} params - Parameters for itinerary generation
   * @param {string} params.destination - Travel destination
   * @param {Date} params.startDate - Trip start date
   * @param {Date} params.endDate - Trip end date
   * @param {Object} params.persona - User's travel persona/profile
   * @param {number} params.budget - Budget for the trip
   * @param {number} params.travelers - Number of travelers
   * @returns {Object} Generated itinerary
   */
  async generateItinerary({ destination, startDate, endDate, persona, budget = 1000, travelers = 1 }) {
    try {
      if (this.useRealAI && this.apiKey) {
        return await this.generateWithRealAI({ destination, startDate, endDate, persona, budget, travelers });
      } else {
        return await this.generateWithMockAI({ destination, startDate, endDate, persona, budget, travelers });
      }
    } catch (error) {
      console.error('Error generating AI itinerary:', error);
      throw new Error('Failed to generate itinerary');
    }
  }

  /**
   * Generate itinerary using real AI API (OpenAI, Claude, etc.)
   */
  async generateWithRealAI({ destination, startDate, endDate, persona, budget, travelers }) {
    const prompt = this.buildAIPrompt({ destination, startDate, endDate, persona, budget, travelers });
    
    // Example with OpenAI API - uncomment and configure when ready
    /*
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert travel planner. Generate detailed, personalized itineraries in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return this.parseAIResponse(response.data.choices[0].message.content);
    */
    
    // For now, fallback to mock
    return await this.generateWithMockAI({ destination, startDate, endDate, persona, budget, travelers });
  }

  /**
   * Generate itinerary using intelligent mock data that considers the persona
   */
  async generateWithMockAI({ destination, startDate, endDate, persona, budget, travelers }) {
    const days = this.calculateDays(startDate, endDate);
    const dailyBudget = budget / days;
    
    const itinerary = {
      destination,
      startDate,
      endDate,
      days: days,
      totalBudget: budget,
      travelers: travelers,
      generatedAt: new Date().toISOString(),
      aiGenerated: true,
      persona: persona ? persona.name : 'General Traveler',
      dailyItinerary: []
    };

    // Generate day-by-day itinerary based on persona
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayItinerary = await this.generateDayItinerary({
        dayNumber: i + 1,
        date: currentDate,
        destination,
        persona,
        dailyBudget,
        travelers,
        isFirstDay: i === 0,
        isLastDay: i === days - 1
      });
      
      itinerary.dailyItinerary.push(dayItinerary);
    }

    return itinerary;
  }

  /**
   * Generate activities for a specific day based on persona and context
   */
  async generateDayItinerary({ dayNumber, date, destination, persona, dailyBudget, travelers, isFirstDay, isLastDay }) {
    const activities = [];
    const personaType = this.determinePersonaType(persona);
    
    // Morning activity
    activities.push(this.generateActivity({
      timeSlot: 'morning',
      time: '09:00',
      duration: 150, // 2.5 hours
      dayNumber,
      destination,
      personaType,
      dailyBudget,
      travelers,
      isFirstDay,
      isLastDay
    }));

    // Afternoon activity
    activities.push(this.generateActivity({
      timeSlot: 'afternoon',
      time: '14:00',
      duration: 180, // 3 hours
      dayNumber,
      destination,
      personaType,
      dailyBudget,
      travelers,
      isFirstDay,
      isLastDay
    }));

    // Evening activity
    activities.push(this.generateActivity({
      timeSlot: 'evening',
      time: '19:00',
      duration: 120, // 2 hours
      dayNumber,
      destination,
      personaType,
      dailyBudget,
      travelers,
      isFirstDay,
      isLastDay
    }));

    const dayTotal = activities.reduce((sum, activity) => sum + activity.estimatedCost, 0);

    return {
      dayNumber,
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      activities,
      totalCost: dayTotal,
      theme: this.getDayTheme(dayNumber, personaType, isFirstDay, isLastDay)
    };
  }

  /**
   * Generate a specific activity based on context and persona
   */
  generateActivity({ timeSlot, time, duration, dayNumber, destination, personaType, dailyBudget, travelers, isFirstDay, isLastDay }) {
    const activityTemplates = this.getActivityTemplates(personaType);
    const timeSlotActivities = activityTemplates[timeSlot] || activityTemplates.general;
    
    let selectedTemplate;
    
    // Special handling for first/last day
    if (isFirstDay && timeSlot === 'morning') {
      selectedTemplate = this.getArrivalActivity(destination, personaType);
    } else if (isLastDay && timeSlot === 'evening') {
      selectedTemplate = this.getDepartureActivity(destination, personaType);
    } else {
      selectedTemplate = timeSlotActivities[Math.floor(Math.random() * timeSlotActivities.length)];
    }

    const endTime = this.calculateEndTime(time, duration);
    const cost = this.calculateActivityCost(selectedTemplate.baseCost, travelers, dailyBudget);

    return {
      title: selectedTemplate.title.replace('{destination}', destination),
      description: selectedTemplate.description.replace('{destination}', destination),
      timeSlot,
      startTime: time,
      endTime,
      duration,
      location: selectedTemplate.location.replace('{destination}', destination),
      category: selectedTemplate.category,
      estimatedCost: cost,
      reservationRequired: selectedTemplate.reservationRequired || false,
      difficulty: selectedTemplate.difficulty || 'easy',
      accessibility: selectedTemplate.accessibility || {},
      tips: selectedTemplate.tips ? selectedTemplate.tips.replace('{destination}', destination) : null,
      aiGenerated: true
    };
  }

  /**
   * Get activity templates based on persona type
   */
  getActivityTemplates(personaType) {
    const templates = {
      adventure: {
        morning: [
          {
            title: 'Hiking Adventure in {destination}',
            description: 'Explore scenic trails and natural landscapes around {destination}',
            location: '{destination} - Mountain trails or nature parks',
            category: 'adventure',
            baseCost: 25,
            difficulty: 'moderate',
            accessibility: { fitness_required: true },
            tips: 'Bring comfortable hiking shoes and water'
          },
          {
            title: 'Bike Tour of {destination}',
            description: 'Cycle through the city and discover hidden gems',
            location: '{destination} - City bike routes',
            category: 'adventure',
            baseCost: 35,
            difficulty: 'easy',
            tips: 'Most tours provide bikes and helmets'
          }
        ],
        afternoon: [
          {
            title: 'Rock Climbing Experience',
            description: 'Challenge yourself with guided climbing sessions',
            location: '{destination} - Local climbing spots',
            category: 'adventure',
            baseCost: 75,
            difficulty: 'hard',
            accessibility: { fitness_required: true },
            reservationRequired: true
          },
          {
            title: 'Water Sports Adventure',
            description: 'Enjoy kayaking, paddleboarding, or boat tours',
            location: '{destination} - Waterfront area',
            category: 'adventure',
            baseCost: 50,
            difficulty: 'moderate'
          }
        ],
        evening: [
          {
            title: 'Sunset Photography Walk',
            description: 'Capture beautiful sunset views from the best vantage points',
            location: '{destination} - Scenic viewpoints',
            category: 'adventure',
            baseCost: 15,
            difficulty: 'easy'
          }
        ]
      },
      cultural: {
        morning: [
          {
            title: 'Historical Museum Tour',
            description: 'Discover the rich history and heritage of {destination}',
            location: '{destination} - Main History Museum',
            category: 'cultural',
            baseCost: 20,
            difficulty: 'easy',
            tips: 'Many museums offer audio guides in multiple languages'
          },
          {
            title: 'Architectural Walking Tour',
            description: 'Explore iconic buildings and architectural landmarks',
            location: '{destination} - Historic District',
            category: 'cultural',
            baseCost: 15,
            difficulty: 'easy'
          }
        ],
        afternoon: [
          {
            title: 'Art Gallery Experience',
            description: 'Visit contemporary and classical art collections',
            location: '{destination} - Art District',
            category: 'cultural',
            baseCost: 25,
            difficulty: 'easy'
          },
          {
            title: 'Cultural Performance',
            description: 'Attend traditional music, dance, or theater performances',
            location: '{destination} - Cultural Center',
            category: 'cultural',
            baseCost: 45,
            reservationRequired: true
          }
        ],
        evening: [
          {
            title: 'Traditional Dinner Experience',
            description: 'Enjoy authentic local cuisine in a cultural setting',
            location: '{destination} - Traditional Restaurant',
            category: 'dining',
            baseCost: 60,
            reservationRequired: true
          }
        ]
      },
      foodie: {
        morning: [
          {
            title: 'Local Market Food Tour',
            description: 'Sample fresh local produce and street food',
            location: '{destination} - Central Market',
            category: 'culinary',
            baseCost: 30,
            difficulty: 'easy'
          },
          {
            title: 'Coffee Culture Experience',
            description: 'Learn about local coffee traditions and tastings',
            location: '{destination} - Historic Coffee District',
            category: 'culinary',
            baseCost: 20,
            difficulty: 'easy'
          }
        ],
        afternoon: [
          {
            title: 'Cooking Class',
            description: 'Learn to prepare traditional {destination} dishes',
            location: '{destination} - Culinary School',
            category: 'culinary',
            baseCost: 85,
            reservationRequired: true,
            tips: 'Classes often include lunch and recipes to take home'
          },
          {
            title: 'Food Walking Tour',
            description: 'Taste your way through the best local eateries',
            location: '{destination} - Food District',
            category: 'culinary',
            baseCost: 55,
            difficulty: 'easy'
          }
        ],
        evening: [
          {
            title: 'Fine Dining Experience',
            description: 'Enjoy a multi-course meal at a renowned restaurant',
            location: '{destination} - Upscale Restaurant',
            category: 'dining',
            baseCost: 120,
            reservationRequired: true
          },
          {
            title: 'Wine Tasting Evening',
            description: 'Sample local wines with expert guidance',
            location: '{destination} - Wine Bar',
            category: 'culinary',
            baseCost: 45
          }
        ]
      },
      family: {
        morning: [
          {
            title: 'Children\'s Museum Visit',
            description: 'Interactive exhibits designed for young minds',
            location: '{destination} - Children\'s Museum',
            category: 'family',
            baseCost: 15,
            difficulty: 'easy',
            accessibility: { family_friendly: true, stroller_accessible: true }
          },
          {
            title: 'Zoo or Aquarium Tour',
            description: 'Meet amazing animals from around the world',
            location: '{destination} - Zoo/Aquarium',
            category: 'family',
            baseCost: 25,
            accessibility: { family_friendly: true }
          }
        ],
        afternoon: [
          {
            title: 'Family-Friendly Park Day',
            description: 'Enjoy playgrounds, picnic areas, and outdoor activities',
            location: '{destination} - Central Park',
            category: 'family',
            baseCost: 5,
            accessibility: { family_friendly: true, stroller_accessible: true }
          },
          {
            title: 'Interactive Science Center',
            description: 'Hands-on science experiments and demonstrations',
            location: '{destination} - Science Museum',
            category: 'family',
            baseCost: 20,
            accessibility: { family_friendly: true }
          }
        ],
        evening: [
          {
            title: 'Family Restaurant',
            description: 'Kid-friendly dining with special menus',
            location: '{destination} - Family Restaurant',
            category: 'dining',
            baseCost: 40,
            accessibility: { family_friendly: true, high_chairs: true }
          }
        ]
      },
      mobility: {
        morning: [
          {
            title: 'Accessible Museum Tour',
            description: 'Fully accessible museum with elevator and wheelchair access',
            location: '{destination} - Accessible Museum',
            category: 'cultural',
            baseCost: 15,
            accessibility: { wheelchair_accessible: true, elevator: true, audio_guide: true }
          },
          {
            title: 'Scenic Drive Tour',
            description: 'Comfortable vehicle tour of city highlights',
            location: '{destination} - City Tour Route',
            category: 'sightseeing',
            baseCost: 35,
            accessibility: { wheelchair_accessible: true }
          }
        ],
        afternoon: [
          {
            title: 'Accessible Garden Visit',
            description: 'Beautiful botanical gardens with paved paths',
            location: '{destination} - Botanical Gardens',
            category: 'nature',
            baseCost: 10,
            accessibility: { wheelchair_accessible: true, paved_paths: true }
          }
        ],
        evening: [
          {
            title: 'Accessible Restaurant',
            description: 'Fine dining with full accessibility features',
            location: '{destination} - Accessible Restaurant',
            category: 'dining',
            baseCost: 50,
            accessibility: { wheelchair_accessible: true, accessible_restrooms: true }
          }
        ]
      }
    };

    return templates[personaType] || templates.cultural;
  }

  /**
   * Determine persona type from persona object
   */
  determinePersonaType(persona) {
    if (!persona || !persona.name) return 'cultural';
    
    const name = persona.name.toLowerCase();
    if (name.includes('adventure')) return 'adventure';
    if (name.includes('foodie') || name.includes('culinary')) return 'foodie';
    if (name.includes('family')) return 'family';
    if (name.includes('mobility') || name.includes('accessible')) return 'mobility';
    return 'cultural';
  }

  /**
   * Get arrival activity for first day
   */
  getArrivalActivity(destination, personaType) {
    return {
      title: `Welcome to ${destination}`,
      description: `Settle in and get oriented with your new destination`,
      location: `${destination} - Hotel/City Center`,
      category: 'orientation',
      baseCost: 10,
      difficulty: 'easy',
      tips: 'Take time to rest and explore your immediate surroundings'
    };
  }

  /**
   * Get departure activity for last day
   */
  getDepartureActivity(destination, personaType) {
    return {
      title: `Farewell ${destination}`,
      description: `Last-minute shopping and final views of the city`,
      location: `${destination} - Shopping District/Airport`,
      category: 'departure',
      baseCost: 20,
      difficulty: 'easy',
      tips: 'Allow extra time for transportation to airport'
    };
  }

  /**
   * Get theme for the day
   */
  getDayTheme(dayNumber, personaType, isFirstDay, isLastDay) {
    if (isFirstDay) return 'Arrival & Orientation';
    if (isLastDay) return 'Farewell & Departure';
    
    const themes = {
      adventure: ['Outdoor Exploration', 'Active Adventures', 'Nature & Thrills'],
      cultural: ['Historical Discovery', 'Art & Architecture', 'Local Traditions'],
      foodie: ['Culinary Journey', 'Taste Exploration', 'Food & Culture'],
      family: ['Family Fun', 'Educational Adventures', 'Kid-Friendly Activities'],
      mobility: ['Comfortable Touring', 'Accessible Exploration', 'Relaxed Discovery']
    };

    const dayThemes = themes[personaType] || themes.cultural;
    return dayThemes[(dayNumber - 1) % dayThemes.length];
  }

  /**
   * Helper methods
   */
  calculateDays(startDate, endDate) {
    const timeDiff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  calculateActivityCost(baseCost, travelers, dailyBudget) {
    const cost = baseCost * travelers;
    // Add some variation while respecting budget
    const variation = 0.8 + Math.random() * 0.4; // 80% to 120% of base cost
    return Math.round(Math.min(cost * variation, dailyBudget * 0.4)); // Max 40% of daily budget per activity
  }

  buildAIPrompt({ destination, startDate, endDate, persona, budget, travelers }) {
    return `
Generate a detailed travel itinerary for:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Travelers: ${travelers}
- Budget: $${budget}
- Travel Style: ${persona ? persona.name : 'General'}
- Preferences: ${persona ? JSON.stringify(persona.personalPreferences || {}) : 'None specified'}

Please provide a day-by-day itinerary with specific activities, times, locations, and estimated costs. 
Focus on experiences that match the traveler's style and preferences.
Format the response as structured JSON with daily activities.
    `.trim();
  }

  parseAIResponse(response) {
    try {
      // If the AI returns JSON, parse it
      return JSON.parse(response);
    } catch (error) {
      // If not JSON, we'll need to parse the text response
      // This would need to be implemented based on the AI service's response format
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

module.exports = AIItineraryService;