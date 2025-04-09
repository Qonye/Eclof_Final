// Test script to generate a profile from actual submission data
const fs = require('fs');
const { generateProfile } = require('./profile-generator.js');

async function testWithSubmissionData() {
  console.log('Testing profile generation with actual submission data...');
  
  try {
    // Read the submission data from the file
    const submissionData = JSON.parse(fs.readFileSync('./submissions/submission-ECLOF-1744092183277-81.json'));
    
    // Extract the borrower data from the submission
    const borrowerData = submissionData.data;
    
    console.log(`Processing submission for: ${borrowerData.name}`);
    
    // Generate the profile using the actual submission data
    const result = await generateProfile(borrowerData);
    console.log('Profile generation result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\nSuccess! The profile generator works with your submission data.');
      
      // Check if we got a mock response or real API response
      if (result.data.profile.includes('is a 42-year-old mother of three who runs a growing retail shop')) {
        console.log('\nWARNING: You appear to be getting a mock response rather than a real API response.');
        console.log('Check that USE_MOCK_RESPONSES is set to false in your .env file.');
        console.log('Also ensure that your OPENAI_API_KEY is properly set in your .env file.');
      } else {
        console.log('\nA unique profile was generated using the API.');
      }
    } else {
      console.log('\nError generating profile:', result.error);
    }
  } catch (error) {
    console.error('Exception during profile generation:', error);
  }
}

// Run the test
testWithSubmissionData();
