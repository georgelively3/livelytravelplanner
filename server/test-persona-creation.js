const UserPersona = require('./models/UserPersona');

async function testPersonaCreation() {
  try {
    console.log('Testing persona creation...');
    
    const testData = {
      userId: 4, // Use the test user we just created
      baseProfileId: 1,
      personalPreferences: {
        interests: ['Museums'],
        cuisineTypes: ['Local'],
        relaxationImportance: 5
      },
      constraints: {
        budgetFlexibility: 5
      },
      budgetDetails: {
        totalBudget: '1000'
      },
      accessibility: {},
      groupDynamics: {
        decisionMaker: 'me'
      }
    };
    
    console.log('Creating persona with data:', JSON.stringify(testData, null, 2));
    const result = await UserPersona.create(testData);
    console.log('Persona created successfully:', result);
    
  } catch (error) {
    console.error('Error testing persona creation:', error);
    console.error('Stack trace:', error.stack);
  }
}

testPersonaCreation();