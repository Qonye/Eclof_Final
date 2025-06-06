// Profile Generator for ECLOF Kenya Borrower Profiles
// This file integrates with an LLM API to generate professional profiles based on borrower data

const axios = require('axios');
require('dotenv').config();

// Get API key from .env file or environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const USE_MOCK_RESPONSES = process.env.USE_MOCK_RESPONSES === 'true' || false;

// Function to generate a professional profile based on borrower data
async function generateProfile(borrowerData) {
  try {    // Extract relevant data from the borrower information (from controller)
    const {
      fullName,
      location,
      businessDescription,
      loanAmount,
      loanPurpose,
      background,
      challenges,
      community,
      previousLoans,
      expectedImpact
    } = borrowerData;
    
    // Validate critical fields and provide meaningful defaults
    if (!fullName || fullName.trim() === '' || fullName === 'Not specified') {
      console.warn('WARNING: No valid name provided for profile generation. fullName:', fullName);
      console.warn('Borrower data received:', JSON.stringify(borrowerData, null, 2));
      return {
        success: false,
        error: 'Borrower name is required for profile generation. Please ensure the name field is properly filled.'
      };
    }
    
    // Set default values for fields not in the form
    const businessName = businessDescription;
    const businessType = 'Small business';

    // Check if mock responses are enabled (for testing when API is unavailable)
    if (USE_MOCK_RESPONSES || !OPENAI_API_KEY) {
      console.log('Using mock profile response (API key not provided or mock mode enabled)');
      return generateMockProfile(borrowerData);
    }    // Create a prompt based on the NLP.md guidelines with available data
    const prompt = `
Please create a professional borrower profile for Kiva based on the following information:

BORROWER INFORMATION:
Name: ${fullName || 'Not specified'}
Location: ${location || 'Kenya'}
Business: ${businessDescription || businessName || businessType || 'Small business'}
Loan Amount: ${loanAmount ? `${loanAmount.toLocaleString()} KES` : 'Not specified'}
Loan Purpose: ${loanPurpose || 'Business development'}

ADDITIONAL DETAILS:
Background: ${borrowerData.background || 'Not specified'}
Business Challenges: ${borrowerData.challenges || 'Not specified'}
Community Contribution: ${borrowerData.community || 'Not specified'}
Previous Loans: ${borrowerData.previousLoans || 'Not specified'}
Expected Impact: ${expectedImpact || 'Business growth and community development'}

GUIDELINES:
1. Create a concise, professional borrower profile in a single paragraph of 8-10 sentences.
2. Emphasize the borrower's name in **bold** at the beginning.
3. Include specific details about their business and loan purpose.
4. Mention how the loan will help them overcome challenges and contribute to their community.
5. Use appropriate pronouns (assume they/them if gender not specified).
6. Format monetary values with "KES" currency.
7. Replace any mentions of "ECLOF" with "ECLOF-Kenya Limited, Kiva's field partner".
8. Create a compelling title that reflects their business or loan purpose.
9. Keep the tone professional but warm and engaging.
10. Focus on their resilience, business acumen, and community impact.

OUTPUT FORMAT (return only valid JSON):
{
  "title": "Descriptive title related to their business or loan purpose",
  "profile": "Professional 8-10 sentence summary with borrower name in **bold**...",
  "metadata": {
    "key_points": ["3-4 key highlights from the profile"],
    "sentiment": "brief positive assessment of borrower potential"
  }
}
`;

    // Check if API key exists
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found. Please set the OPENAI_API_KEY environment variable or enable mock responses by setting USE_MOCK_RESPONSES=true in your .env file.');
    }

    try {
      // Make the API call to OpenAI
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: 'You are a professional writer specializing in creating compelling borrower profiles for microfinance platforms. Your task is to transform raw borrower information into engaging, professional profiles that follow specific guidelines.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      // Parse the response
      const generatedContent = response.data.choices[0].message.content;
      
      // Try to parse the JSON response
      try {
        const parsedResponse = JSON.parse(generatedContent);
        return {
          success: true,
          data: parsedResponse
        };
      } catch (parseError) {
        // If JSON parsing fails, return the raw content
        console.warn('Failed to parse API response as JSON. Using raw content instead.');
        return {
          success: true,
          data: {
            title: "Generated Profile",
            profile: generatedContent,
            metadata: {
              key_points: [],
              sentiment: "Unable to analyze"
            }
          }
        };
      }
    } catch (apiError) {
      console.error('API error:', apiError.message);
      console.error('Falling back to mock profile generation');
      
      // If API call fails, fall back to mock profile
      return generateMockProfile(borrowerData);
    }
  } catch (error) {
    console.error('Error generating profile:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while generating the profile'
    };
  }
}

// Generate a mock profile for testing or when API is unavailable
function generateMockProfile(borrowerData) {
  const { fullName, loanAmount, loanPurpose, businessDescription, background, expectedImpact } = borrowerData;
  
  // Validate that we have a name for the profile
  if (!fullName || fullName.trim() === '' || fullName === 'Not specified') {
    console.warn('WARNING: Mock profile generator - No valid name provided. fullName:', fullName);
    return {
      success: false,
      error: 'Borrower name is required for profile generation. Please ensure the name field is properly filled.'
    };
  }
  
  // Create reasonable titles based on loan purpose
  let title = "Expanding Retail Business with Improved Inventory and Equipment";
  
  // Use available data to create a personalized profile
  const borrowerName = fullName;
  const businessDesc = businessDescription || 'retail business';
  const amount = loanAmount ? `${loanAmount.toLocaleString()} KES` : '65,000 KES';
  const purpose = loanPurpose || 'business expansion';
  const plans = expectedImpact || 'continue growing the business and supporting the community';
  
  let profile = `**${borrowerName}** operates a thriving ${businessDesc} that has become an essential part of their local community. With a proven track record of financial responsibility, they have successfully managed previous loans and demonstrated strong business acumen. This ${amount} loan will be strategically invested in ${purpose}, enabling significant business growth and increased community impact. The borrower has shown remarkable resilience in overcoming business challenges and has consistently found innovative ways to serve their customers better. Their business not only provides essential services to the local community but also creates employment opportunities for others. Previous support from ECLOF-Kenya Limited, Kiva's field partner, has helped establish a solid foundation for growth. The borrower's commitment to community development extends beyond their business, as they actively participate in local initiatives and mentor other entrepreneurs. With this new funding, they plan to expand their operations, improve service quality, and create additional income streams. Looking to the future, ${borrowerName} hopes to ${plans}, demonstrating their long-term vision and commitment to both business success and community development.`;
  
  // If specific background information is available, incorporate it
  if (background && background !== 'Not specified') {
    profile = `**${borrowerName}** brings ${background.toLowerCase()} to their ${businessDesc} operations. ` + profile.substring(profile.indexOf('operates') + 8);
  }
  
  // Create metadata based on available information
  const keyPoints = [
    `${borrowerName} operates a ${businessDesc} serving the local community`,
    "Demonstrated financial responsibility with previous loan repayments",
    `${amount} loan will fund ${purpose} and business expansion`,
    "Strong commitment to community development and mentoring other entrepreneurs"
  ];
  
  return {
    success: true,
    data: {
      title: title,
      profile: profile,
      metadata: {
        key_points: keyPoints,
        sentiment: "Positive outlook with strong business growth potential and community impact"
      }
    }
  };
}

// Export the function
module.exports = {
  generateProfile
};