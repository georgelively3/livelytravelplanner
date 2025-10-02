const ItineraryDay = require('../models/ItineraryDay');
const Activity = require('../models/Activity');
const TravelerProfile = require('../models/TravelerProfile');

class ItineraryGenerator {
  static async generateItinerary(trip) {
    try {
      const profile = await TravelerProfile.findById(trip.traveler_profile_id);
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      
      // Calculate number of days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const dayCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      // Generate activities based on profile type
      const activities = this.getActivitiesByProfile(profile, trip.destination);

      // Create itinerary days and activities
      for (let i = 0; i < dayCount; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // Create itinerary day
        const day = await ItineraryDay.create({
          tripId: trip.id,
          date: currentDate.toISOString().split('T')[0],
          dayNumber: i + 1
        });

        // Generate activities for this day based on profile
        const dayActivities = this.generateDayActivities(activities, profile, i + 1, trip.destination);
        
        for (const activityData of dayActivities) {
          await Activity.create({
            dayId: day.id,
            ...activityData
          });
        }
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  }

  static getActivitiesByProfile(profile, destination) {
    const baseActivities = {
      mobilityConscious: [
        { title: 'Accessible Museum Tour', category: 'culture', accessibility: { wheelchair: true, elevator: true } },
        { title: 'Scenic Drive', category: 'sightseeing', accessibility: { wheelchair: true } },
        { title: 'Accessible Restaurant', category: 'dining', accessibility: { wheelchair: true } },
        { title: 'Hotel Rest Period', category: 'rest', accessibility: { wheelchair: true } }
      ],
      family: [
        { title: 'Children\'s Museum', category: 'family', accessibility: { family_friendly: true } },
        { title: 'City Zoo', category: 'family', accessibility: { family_friendly: true } },
        { title: 'Playground Visit', category: 'family', accessibility: { family_friendly: true } },
        { title: 'Kid-Friendly Restaurant', category: 'dining', accessibility: { family_friendly: true } },
        { title: 'Afternoon Nap Time', category: 'rest', accessibility: { family_friendly: true } }
      ],
      foodie: [
        { title: 'Local Food Market', category: 'culinary', accessibility: {} },
        { title: 'Cooking Class', category: 'culinary', accessibility: {} },
        { title: 'Fine Dining Experience', category: 'dining', accessibility: {} },
        { title: 'Food Walking Tour', category: 'culinary', accessibility: {} },
        { title: 'Local Specialty Restaurant', category: 'dining', accessibility: {} }
      ],
      adventure: [
        { title: 'Hiking Trail', category: 'adventure', accessibility: { fitness_required: true } },
        { title: 'Bike Tour', category: 'adventure', accessibility: { fitness_required: true } },
        { title: 'Water Sports', category: 'adventure', accessibility: { fitness_required: true } },
        { title: 'Rock Climbing', category: 'adventure', accessibility: { fitness_required: true } },
        { title: 'Adventure Gear Shop', category: 'shopping', accessibility: {} }
      ],
      cultural: [
        { title: 'Art Museum', category: 'culture', accessibility: {} },
        { title: 'Historical Landmark', category: 'culture', accessibility: {} },
        { title: 'Guided City Tour', category: 'culture', accessibility: {} },
        { title: 'Traditional Restaurant', category: 'dining', accessibility: {} },
        { title: 'Local Gallery', category: 'culture', accessibility: {} }
      ]
    };

    // Determine profile type based on name
    let profileType = 'cultural'; // default
    if (profile.name.toLowerCase().includes('mobility')) profileType = 'mobilityConscious';
    else if (profile.name.toLowerCase().includes('family')) profileType = 'family';
    else if (profile.name.toLowerCase().includes('foodie')) profileType = 'foodie';
    else if (profile.name.toLowerCase().includes('adventure')) profileType = 'adventure';

    return baseActivities[profileType] || baseActivities.cultural;
  }

  static generateDayActivities(activities, profile, dayNumber, destination) {
    const dayActivities = [];
    const timeSlots = ['morning', 'afternoon', 'evening'];
    
    timeSlots.forEach((timeSlot, index) => {
      let activity;
      
      if (profile.name.toLowerCase().includes('family') && timeSlot === 'afternoon' && Math.random() > 0.5) {
        // Family profiles might have nap time in afternoon
        activity = {
          title: 'Rest Time / Nap',
          description: 'Quiet time for children to rest',
          timeSlot: timeSlot,
          startTime: '14:00:00',
          endTime: '15:30:00',
          location: 'Hotel',
          category: 'rest',
          cost: 0,
          reservationRequired: false,
          accessibility: { family_friendly: true },
          notes: 'Important rest period for young children'
        };
      } else {
        // Select random activity from profile activities
        const selectedActivity = activities[Math.floor(Math.random() * activities.length)];
        const times = this.getTimeSlotTimes(timeSlot);
        
        activity = {
          title: `${selectedActivity.title} in ${destination}`,
          description: `Experience ${selectedActivity.title.toLowerCase()} during your visit to ${destination}`,
          timeSlot: timeSlot,
          startTime: times.start,
          endTime: times.end,
          location: `${destination} - ${selectedActivity.category} venue`,
          category: selectedActivity.category,
          cost: this.generateCost(selectedActivity.category),
          reservationRequired: ['dining', 'culinary'].includes(selectedActivity.category),
          accessibility: selectedActivity.accessibility,
          notes: `Day ${dayNumber} ${timeSlot} activity`
        };
      }
      
      dayActivities.push(activity);
    });

    return dayActivities;
  }

  static getTimeSlotTimes(timeSlot) {
    const times = {
      morning: { start: '09:00:00', end: '11:30:00' },
      afternoon: { start: '13:00:00', end: '16:00:00' },
      evening: { start: '18:00:00', end: '20:30:00' }
    };
    return times[timeSlot];
  }

  static generateCost(category) {
    const baseCosts = {
      culture: [15, 25],
      dining: [30, 80],
      culinary: [50, 120],
      adventure: [40, 100],
      family: [20, 50],
      rest: [0, 0],
      sightseeing: [10, 30],
      shopping: [0, 200]
    };

    const range = baseCosts[category] || [20, 60];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }
}

module.exports = ItineraryGenerator;