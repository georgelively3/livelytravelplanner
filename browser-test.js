// Test AI Trip Plan in Browser Console
// 1. Open http://localhost:8080 in browser
// 2. Press F12 → Console tab
// 3. Paste this code and press Enter

console.log("🚀 Testing AI Trip Plan Endpoint...");

const testTripPlan = async (destination, interests) => {
    const requestData = {
        travelerProfile: {
            id: 1,
            name: "Test Traveler",
            interests: interests,
            budget: "moderate"
        },
        tripParameters: {
            destination: destination,
            startDate: "2025-10-15",
            endDate: "2025-10-17",
            duration: 3,
            budget: 1500.00,
            interests: interests
        }
    };

    try {
        const response = await fetch('/api/ai/trip-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        console.log(`✅ ${destination} Trip Generated!`);
        console.log(`📅 Duration: ${result.duration} days`);
        console.log(`💰 Budget: $${result.totalBudget}`);
        console.log(`🏛️ Day 1 Main Activity: ${result.dailyItineraries[0].activities[2].name}`);
        console.log('📋 Full Response:', result);
        return result;
    } catch (error) {
        console.error(`❌ Error testing ${destination}:`, error);
    }
};

// Test different destinations
testTripPlan("Lisbon", ["outdoor", "hiking", "local cuisine"]);
testTripPlan("Paris", ["museums", "art", "history"]);
testTripPlan("Tokyo", ["technology", "culture", "food"]);