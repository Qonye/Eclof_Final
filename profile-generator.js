// Profile Generator for ECLOF Kenya Borrower Profiles
// This file integrates with an LLM API to generate professional profiles based on borrower data

const axios = require('axios');
require('dotenv').config();

// Get API key from .env file or environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

    // Create a prompt based on the NLP.md guidelines
    const prompt = `
Please create a professional borrower profile for Kiva based on the following information:

BORROWER INFORMATION:
Name: ${name}
Loan Amount: ${loanAmount}
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
      throw new Error('OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.');
    }

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
  } catch (error) {
    console.error('Error generating profile:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while generating the profile'
    };
  }
}

// Export the function
module.exports = {
  generateProfile
};