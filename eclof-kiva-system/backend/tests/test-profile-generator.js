// Simple test script for profile generator
const { generateProfile } = require('./profile-generator.js');

async function testProfileGenerator() {
  console.log('Testing profile generation with GPT-3.5 Turbo...');
  
  const testData = { 
    name: 'Test Borrower', 
    loanAmount: '50000', 
    background: 'Small business owner for 5 years', 
    business: 'Retail shop selling household goods', 
    loanPurpose: 'Expanding inventory and purchasing refrigeration equipment', 
    challenges: 'Limited storage space and increasing competition', 
    community: 'Provides employment to two local youth', 
    previousLoans: 'Repaid 30000 KES loan 6 months ago', 
    futurePlans: 'Open a second location in neighboring town' 
  };
  
  try {
    const result = await generateProfile(testData);
    console.log('Profile generation result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\nSuccess! GPT-3.5 Turbo is working correctly with your API key.');
      
      // Check if we got a mock response or real API response
      if (result.data.profile.includes('is a 42-year-old mother of three who runs a growing retail shop')) {
        console.log('\nWARNING: You appear to be getting a mock response rather than a real API response.');
        console.log('Check that USE_MOCK_RESPONSES is set to false in your .env file.');
      }
    } else {
      console.log('\nError generating profile:', result.error);
    }
  } catch (error) {
    console.error('Exception during profile generation:', error);
  }
}

// Run the test
testProfileGenerator();
