// Test script to verify the backend accepts our form data structure
const fs = require('fs');
const path = require('path');

// Test form data that matches the frontend form structure
const testSubmissionData = {
  // Basic Information (from frontend form)
  name: "Jane Doe",
  branch: "Nairobi Branch",
  clientId: "CLIENT-12345",
  loanAmount: 50000,
  groupName: "Women's Empowerment Group",
  
  // Background and Story (from frontend form)
  background: "I am a 35-year-old mother of three children. I am married and my husband works as a mechanic. I support my elderly parents and help with my children's education.",
  business: "I run a small grocery store in my neighborhood. I enjoy helping my community access affordable food and basic necessities.",
  loanPurpose: "I will use this loan to expand my grocery inventory and add fresh vegetables and fruits to attract more customers.",
  challenges: "My main challenge is limited capital to stock enough inventory. The loan will help me increase profits and provide better for my family.",
  community: "My business provides employment to two local women and I source products from local suppliers, supporting the community economy.",
  previousLoans: "I have taken one previous ECLOF loan of 30,000 KES which I repaid on time over 12 months.",
  futurePlans: "I hope to expand to a larger store and eventually open a second location. I want my children to complete university education.",
  additionalComments: "Thank you to the Kiva lenders for believing in entrepreneurs like me.",
  
  // Waiver and Signature Information
  clientName: "Jane Doe",
  signatureDate: "2025-06-05",
  address: "123 Market Street, Nairobi, Kenya",
  repSignatureDate: "2025-06-05"
};

console.log('Test submission data structure:');
console.log(JSON.stringify(testSubmissionData, null, 2));

// Test API call
async function testSubmission() {
  try {
    const response = await fetch('http://localhost:3000/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSubmissionData)
    });
    
    const result = await response.json();
    console.log('\nAPI Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS: Backend accepts the form data structure!');
    } else {
      console.log('\n❌ ERROR: Backend rejected the form data');
      console.log('Error message:', result.message);
    }
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error.message);
  }
}

// Run the test if this is called directly
if (require.main === module) {
  testSubmission();
}

module.exports = { testSubmissionData, testSubmission };
