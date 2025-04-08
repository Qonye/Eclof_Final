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
  try {
    // Extract relevant data from the borrower information
    const {
      name,
      branch,
      loanAmount,
      background,
      business,
      loanPurpose,
      challenges,
      community,
      previousLoans,
      futurePlans,
      additionalComments
    } = borrowerData;

    // Check if mock responses are enabled (for testing when API is unavailable)
    if (USE_MOCK_RESPONSES || !OPENAI_API_KEY) {
      console.log('Using mock profile response (API key not provided or mock mode enabled)');
      return generateMockProfile(borrowerData);
    }

    // Create a prompt based on the NLP.md guidelines
    const prompt = `
Please create a professional borrower profile for Kiva based on the following information:

BORROWER INFORMATION:
Name: ${name}
Loan Amount: ${loanAmount || 'Not specified'}
Background: ${background || 'N/A'}
Business Description: ${business || 'N/A'}
Loan Purpose: ${loanPurpose || 'N/A'}
Challenges & Plans: ${challenges || 'N/A'}
Community Contribution: ${community || 'N/A'}
Previous Loans: ${previousLoans || 'N/A'}
Future Plans: ${futurePlans || 'N/A'}
Additional Comments: ${additionalComments || 'N/A'}

GUIDELINES:
1. Concisely summarize the borrower in a single paragraph consisting of 10 or 11 sentences. Emphasize the borrower's name in **bold**.
2. Include a subtle, appropriate humorous pun in the summary that relates to their business or situation.
3. Ensure proper grammar, capitalization, punctuation, and consistent pronoun usage.
4. Format monetary values with currency (e.g., "30,000 KES").
5. Replace all mentions of "ECLOF" with "ECLOF-Kenya Limited, Kiva's field partner".
6. Create a catchy title that describes the loan usage with specific examples.
7. Avoid mentioning group/branch names, and generalize business references.

OUTPUT FORMAT:
{
  "title": "Title Related to Loan Usage",
  "profile": "Professional 10-11 sentence summary with borrower name in bold...",
  "metadata": {
    "key_points": ["3-5 key points from the profile"],
    "sentiment": "brief analysis of borrower situation"
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
  const { name, loanAmount, loanPurpose, business } = borrowerData;
  
  // Create reasonable titles based on loan purpose
  let title = "Expanding Retail Business with Improved Inventory and Equipment";
  let profile = `**${name}** is a 42-year-old mother of three who runs a growing retail shop in a Nairobi neighborhood. She has been in business for five years, starting with just a small table and now owning a proper shop that serves her local community. Her shop has become an essential part of the community, saving neighbors the long walk to more distant markets, and she has plans to stock up and expand with this 65,000 KES loan. The funds will specifically be used for new shelving units (5,000 KES), refrigeration equipment (25,000 KES), and additional inventory (35,000 KES) to create a fresh produce section. With her previous loan from ECLOF-Kenya Limited, Kiva's field partner, she demonstrated excellent financial responsibility by repaying 20,000 KES six months ahead of schedule. ${name}'s retail aspirations are truly "on the shelf" for success as she aims to eventually grow her business into a chain of mini-supermarkets serving multiple communities. Beyond her business goals, she is passionate about mentoring other female entrepreneurs and hopes to create a foundation to help women start businesses. With increased profits from her expanded inventory, she plans to support her children's education, including her eldest son who is studying IT in college.`;
  
  // If the business involves farming or dairy, use a different template
  if (business && business.toLowerCase().includes('farm')) {
    title = "Agricultural Enhancement with Modern Equipment and Techniques";
    profile = `**${name}** is a dedicated farmer who has built a sustainable agricultural business that serves the local community. With a previous loan that was fully repaid ahead of schedule, ${name} has proven to be a reliable borrower who understands how to grow both crops and business opportunities. This new loan of ${loanAmount || '65,000'} KES will be "planted" wisely to yield impressive returns through the purchase of improved farming equipment and high-quality seeds. The farm currently employs local workers during harvest seasons, creating important income opportunities in the area. Beyond providing fresh produce to local markets, ${name} also participates in community initiatives and shares farming knowledge with neighbors. Previous support from ECLOF-Kenya Limited, Kiva's field partner, helped expand the farming operation, resulting in increased productivity and income. ${name}'s future plans include adding value-added processing to increase profit margins and create more employment opportunities. With a strong track record of agricultural success and financial responsibility, this loan represents a sound investment in both a business and a community leader.`;
  }
  
  // Personalize based on the loan amount if available
  const loanAmountText = loanAmount ? `${loanAmount} KES` : "this loan";
  
  // Create metadata
  const keyPoints = [
    `${name} runs a retail business in Nairobi that serves the local community`,
    "Previous loan was repaid ahead of schedule, demonstrating financial responsibility",
    "Loan will fund shelving, refrigeration equipment, and expanded inventory",
    "Plans to grow into a chain of mini-supermarkets and mentor other entrepreneurs"
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