// Test script to verify name validation
const testDataWithoutName = {
    name: "", // Empty name to test validation
    branch: "Nairobi",
    clientId: "KIV003",
    loanAmount: 30000,
    groupName: "Test Group",
    background: "Background information",
    business: "Small business",
    loanPurpose: "Business expansion",
    challenges: "Various challenges",
    community: "Community involvement",
    futurePlans: "Future plans",
    clientName: "Test Client",
    signatureDate: new Date().toISOString(),
    address: "Nairobi, Kenya",
    previousLoans: "None",
    additionalComments: "Test submission"
};

async function testNameValidation() {
    try {
        console.log('Testing name validation...');
        console.log('Test data name field:', `"${testDataWithoutName.name}"`);
        
        // First, create a test submission with empty name
        const submissionResponse = await fetch('http://localhost:3000/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testDataWithoutName)
        });
        
        const submissionResult = await submissionResponse.json();
        
        if (submissionResult.success) {
            console.log('Submission created with empty name');
            const submissionId = submissionResult.data.id;
            
            // Now test profile generation - should fail with validation error
            const profileResponse = await fetch(`http://localhost:3000/api/submissions/${submissionId}/generate-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const profileResult = await profileResponse.json();
            
            if (profileResult.success) {
                console.log('\n❌ VALIDATION FAILED: Profile was generated despite empty name');
                console.log('Profile:', profileResult.data.profile.profile);
            } else {
                console.log('\n✅ VALIDATION SUCCESS: Profile generation rejected empty name');
                console.log('Error message:', profileResult.error);
            }
        } else {
            console.log('\n❌ Submission creation failed:', submissionResult.error);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testNameValidation();
