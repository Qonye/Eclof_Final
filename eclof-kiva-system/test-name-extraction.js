// Test script to verify name extraction is working correctly
// Using built-in fetch in Node.js 18+

const testData = {
    name: "Sarah Wambui", // This should appear in the profile
    branch: "Nairobi",
    clientId: "KIV002",
    loanAmount: 75000,
    groupName: "Nairobi Business Women",
    background: "I am a mother of two children and have been running a clothing business for 3 years. I started by selling clothes from my home.",
    business: "I run a clothing boutique in Nairobi where I sell women's fashion and accessories. I source my products from local manufacturers and importers.",
    loanPurpose: "I want to use this loan to expand my clothing business by purchasing more inventory and renting a larger shop space in a busy market area.",
    challenges: "My main challenges are limited capital to buy more stock, need for a better location, and competition from larger clothing stores.",
    community: "I am an active member of our local business women's group and help mentor young women who want to start their own businesses.",
    futurePlans: "With this loan, I plan to triple my monthly sales and eventually open a second boutique. I also want to hire two employees to help manage the business.",
    clientName: "Sarah Wambui",
    signatureDate: new Date().toISOString(),
    address: "Nairobi, Kenya",
    previousLoans: "I have successfully repaid a 25,000 KES loan from another microfinance institution",
    additionalComments: "I am committed to growing my business and supporting other women entrepreneurs in my community."
};

async function testNameExtraction() {
    try {
        console.log('Testing name extraction in profile generation...');
        console.log('Test borrower name:', testData.name);
        
        // First, create a test submission
        const submissionResponse = await fetch('http://localhost:3000/api/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const submissionResult = await submissionResponse.json();
        console.log('Submission created successfully');
        
        if (submissionResult.success) {
            const submissionId = submissionResult.data.id;
            
            // Now test profile generation
            const profileResponse = await fetch(`http://localhost:3000/api/submissions/${submissionId}/generate-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const profileResult = await profileResponse.json();
            
            if (profileResult.success) {
                console.log('\n✅ Profile generated successfully!');
                console.log('Profile Title:', profileResult.data.profile.title);
                console.log('Profile Text:', profileResult.data.profile.profile);
                
                // Check if the name appears correctly
                const profileText = profileResult.data.profile.profile;
                if (profileText.includes('**Sarah Wambui**') || profileText.includes('Sarah Wambui')) {
                    console.log('\n✅ NAME EXTRACTION SUCCESS: Sarah Wambui found in profile');
                } else {
                    console.log('\n❌ NAME EXTRACTION FAILED: Sarah Wambui not found in profile');
                    if (profileText.includes('Unnamed') || profileText.includes('**they**')) {
                        console.log('❌ Profile contains generic terms instead of the actual name');
                    }
                }
            } else {
                console.log('\n❌ Profile generation failed:', profileResult.error);
            }
        } else {
            console.log('\n❌ Submission creation failed:', submissionResult.error);
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testNameExtraction();
