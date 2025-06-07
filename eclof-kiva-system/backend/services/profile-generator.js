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

STRICT FORMATTING GUIDELINES (FOLLOW EXACTLY):
1. Write EXACTLY 10 or 11 sentences in a single paragraph - NO MORE, NO LESS
2. DO NOT number the paragraph itself
3. Emphasize the borrower's name in **bold** format
4. Include a humorous pun somewhere in the summary to make it interesting and engaging
5. Create a compelling title based on loan usage with specific examples of fund use

CONTENT REQUIREMENTS:
• Fix any typos and ensure proper grammar
• Capitalize proper nouns consistently  
• Use correct punctuation and spacing
• Ensure singular/plural consistency
• Use correct gender pronouns: "she/her" for females, "he/him" for males (use name as guide)
• Split any run-on sentences for clarity
• Format ALL monetary amounts with "KES" currency (e.g., "30,000 KES")
• Vary language to avoid repetitive phrasing
• Use professional terminology (e.g., "Quality meat" not just "meat")
• Add necessary articles for clarity
• Simplify any awkward phrasing
• Clarify vague expressions and specify loan purpose clearly
• Remove any group/branch names to protect privacy
• Generalize business references (avoid specific business names)
• Detail loan usage clearly - specify exactly how funds will be used
• Replace "ECLOF" with "ECLOF-Kenya Limited, Kiva's field partner"

TONE AND STYLE:
• Professional but warm and engaging
• Focus on resilience, business acumen, and community impact
• Make it interesting to read with the humorous pun
• Highlight their entrepreneurial spirit and determination

OUTPUT FORMAT (return only valid JSON):
{
  "title": "Title based on loan usage including specific examples of fund use",
  "profile": "Single paragraph with exactly 10-11 sentences, borrower name in **bold**, includes humorous pun...",
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
  
  // Create title based on loan purpose with specific fund usage examples
  let title = `Expanding ${businessDescription || 'Retail Business'} with Inventory Restocking and Equipment Upgrades`;
  
  // Use available data to create a personalized profile
  const borrowerName = fullName;
  const businessDesc = businessDescription || 'retail business';
  const amount = loanAmount ? `${loanAmount.toLocaleString()} KES` : '65,000 KES';
  const purpose = loanPurpose || 'business expansion and inventory restocking';
  const plans = expectedImpact || 'continue growing the business and supporting the community';
  
  // Create exactly 10-11 sentences with humorous pun, following NLP guidelines
  let profile = `**${borrowerName}** operates a thriving ${businessDesc} that has become the cornerstone of their local community's commerce. With a proven track record of financial responsibility, they have successfully managed previous loans from ECLOF-Kenya Limited, Kiva's field partner, demonstrating remarkable business acumen. This ${amount} loan will be strategically invested in ${purpose}, enabling significant expansion and improved customer service quality. The borrower has shown exceptional resilience in overcoming market challenges and consistently found innovative ways to serve their customers better. Their business not only provides essential goods and services to the local community but also creates employment opportunities for local residents. You could say they're really "banking" on this opportunity to take their business to the next level! Previous support has helped establish a solid foundation, and now they're ready to scale operations with enhanced inventory and modern equipment. The borrower's commitment to community development extends beyond profits, as they actively participate in local initiatives and mentor aspiring entrepreneurs. With this new funding, they plan to diversify their product range, improve storage facilities, and implement better customer service systems. Looking ahead, ${borrowerName} aims to ${plans}, demonstrating their long-term vision for sustainable growth. Their entrepreneurial spirit and dedication to excellence make them an ideal candidate for continued support and investment.`;
  
  // If specific background information is available, incorporate it while maintaining sentence count
  if (background && background !== 'Not specified') {
    profile = profile.replace('operates a thriving', `brings ${background.toLowerCase()} experience to operating a thriving`);
  }
  
  // Create metadata based on available information
  const keyPoints = [
    `${borrowerName} operates a successful ${businessDesc} serving the local community`,
    "Proven financial responsibility with previous loan repayments to ECLOF-Kenya Limited",
    `${amount} loan will fund ${purpose} and business modernization`,
    "Strong community leadership and commitment to mentoring other entrepreneurs"
  ];
  
  return {
    success: true,
    data: {
      title: title,
      profile: profile,
      metadata: {
        key_points: keyPoints,
        sentiment: "Excellent potential with strong business foundation and clear growth strategy"
      }
    }
  };
}

// Export the function
module.exports = {
  generateProfile
};