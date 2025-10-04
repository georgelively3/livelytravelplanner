# AI-Powered Itinerary Generation

This travel planner now includes AI-powered itinerary generation that creates personalized travel plans based on user personas, destinations, timeframes, and budgets.

## Features

### 🤖 AI Itinerary Generation
- **Smart Persona Recognition**: Automatically adapts itineraries based on travel personas (Adventure, Cultural, Foodie, Family, Mobility-Conscious)
- **Budget-Aware Planning**: Respects budget constraints and optimizes daily spending
- **Destination Intelligence**: Generates location-specific activities and recommendations
- **Time-Sensitive Scheduling**: Creates realistic daily schedules with appropriate timing
- **Accessibility Considerations**: Includes accessibility features based on user needs

### 🎯 Supported Persona Types
1. **Adventure Seeker**: Hiking, biking, water sports, outdoor activities
2. **Cultural Explorer**: Museums, historical sites, art galleries, cultural performances
3. **Foodie Traveler**: Food markets, cooking classes, restaurant tours, wine tastings
4. **Family Traveler**: Kid-friendly activities, museums, parks, family restaurants
5. **Mobility-Conscious**: Accessible venues, comfortable transportation, suitable activities

## API Endpoints

### Preview Itinerary
```http
POST /api/ai/preview
```
Generate a preview itinerary without saving to database.

**Request Body:**
```json
{
  "destination": "Paris, France",
  "startDate": "2024-06-01",
  "endDate": "2024-06-03",
  "personaId": 123, // Optional
  "budget": 1500,
  "travelers": 2
}
```

### Create AI-Powered Trip
```http
POST /api/ai/generate-trip
```
Generate and save a complete AI-powered trip with itinerary.

**Request Body:**
```json
{
  "title": "AI-Generated Paris Adventure",
  "destination": "Paris, France",
  "startDate": "2024-06-01",
  "endDate": "2024-06-03",
  "personaId": 123, // Optional
  "budget": 1500,
  "travelers": 2
}
```

### Get Destination Suggestions
```http
GET /api/ai/suggestions/{destination}?personaId=123&budget=1000&days=3
```
Get AI-powered activity suggestions for a specific destination.

### Regenerate Itinerary
```http
POST /api/ai/regenerate/{tripId}
```
Regenerate an existing trip's itinerary with new preferences.

## Frontend Components

### AI Create Trip Page
- **Location**: `/ai-create-trip`
- **Features**: 
  - Interactive form with persona selection
  - Budget and traveler count customization
  - Real-time itinerary preview
  - One-click trip creation

### Enhanced Dashboard
- **AI Trip Button**: Quick access to AI-powered trip creation
- **Speed Dial**: Choose between manual or AI trip creation
- **Trip Cards**: Visual indicators for AI-generated trips

## Example Generated Itinerary

```json
{
  "destination": "Tokyo, Japan",
  "days": 3,
  "totalBudget": 1500,
  "travelers": 2,
  "persona": "Cultural Explorer",
  "dailyItinerary": [
    {
      "dayNumber": 1,
      "date": "2024-12-01",
      "theme": "Arrival & Orientation",
      "activities": [
        {
          "title": "Welcome to Tokyo, Japan",
          "timeSlot": "morning",
          "startTime": "09:00",
          "endTime": "11:30",
          "category": "orientation",
          "estimatedCost": 20
        },
        {
          "title": "Historical Museum Tour",
          "timeSlot": "afternoon",
          "startTime": "14:00",
          "endTime": "17:00",
          "category": "cultural",
          "estimatedCost": 25
        },
        {
          "title": "Traditional Dinner Experience",
          "timeSlot": "evening",
          "startTime": "19:00",
          "endTime": "21:00",
          "category": "dining",
          "estimatedCost": 60,
          "reservationRequired": true
        }
      ],
      "totalCost": 105
    }
  ]
}
```

## Configuration

### Environment Variables
```env
# Optional: Enable real AI API integration
OPENAI_API_KEY=your_openai_api_key_here
USE_REAL_AI=true
```

### Current Implementation
- **Mock AI Service**: Intelligent rule-based generation for reliable, fast results
- **Persona-Driven**: Activities are selected based on user travel style
- **Budget-Conscious**: Costs are calculated realistically per destination
- **Extensible**: Can be easily upgraded to use real AI APIs (OpenAI, Claude, etc.)

## Usage Examples

### Basic AI Trip Creation
1. Navigate to `/ai-create-trip`
2. Fill in destination, dates, and budget
3. Optionally select a persona
4. Click "Preview AI Itinerary" to see results
5. Click "Create AI-Powered Trip" to save

### Preview Before Creating
```javascript
// Frontend API call
const response = await axios.post('/api/ai/preview', {
  destination: 'Barcelona, Spain',
  startDate: '2024-07-15',
  endDate: '2024-07-18',
  budget: 2000,
  travelers: 2
});
```

### Using Personas
Personas dramatically improve itinerary quality:
- **Adventure**: Outdoor activities, hiking, sports
- **Cultural**: Museums, galleries, historical sites  
- **Foodie**: Restaurants, markets, cooking classes
- **Family**: Kid-friendly venues, educational activities
- **Mobility**: Accessible venues, comfortable options

## Future Enhancements

### Planned Features
- [ ] Real AI API integration (OpenAI GPT-4, Claude)
- [ ] Weather-aware activity suggestions
- [ ] Real-time pricing integration
- [ ] Social media integration for activity discovery
- [ ] Collaborative trip planning
- [ ] Multi-language support
- [ ] Offline itinerary access

### AI Model Upgrades
- [ ] Machine learning from user feedback
- [ ] Seasonal activity recommendations
- [ ] Local event integration
- [ ] Transportation optimization
- [ ] Hotel and restaurant booking integration

## Testing

Run AI-specific tests:
```bash
# AI Service tests
npm test tests/services/AIItineraryService.test.js

# AI Routes tests  
npm test tests/routes/ai.test.js

# All tests
npm test
```

## Contributing

When adding new persona types or activities:
1. Update `AIItineraryService.js` with new templates
2. Add corresponding tests
3. Update persona selection in frontend
4. Document new features here

---

The AI-powered itinerary generation makes travel planning effortless by combining user preferences with intelligent destination knowledge to create personalized, budget-conscious travel plans.