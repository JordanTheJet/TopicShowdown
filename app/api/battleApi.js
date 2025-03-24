// app/api/battleApi.js - Integration with Vercel API endpoints
/**
 * API client for the battle game backend
 */

// API base URL - works in both development and production with Vercel
const API_BASE_URL = '/api';

/**
 * Generates a battle based on the given topic
 * 
 * @param {string} topic - The topic for battle generation
 * @returns {Promise<Object>} - A promise that resolves to the battle data
 */
export const generateBattle = async (topic) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-battle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateBattle:', error);
    throw error;
  }
};

/**
 * Generates narrative for a battle move
 * 
 * @param {Object} moveData - Data about the move
 * @param {string} moveData.attacker - Name of the attacking character
 * @param {string} moveData.defender - Name of the defending character
 * @param {string} moveData.move - Name of the move being used
 * @param {string} moveData.moveDescription - Description of the move
 * @returns {Promise<Object>} - A promise that resolves to the narrative response
 */
export const generateMoveNarrative = async (moveData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-narrative`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moveData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateMoveNarrative:', error);
    // Return a fallback narrative instead of throwing
    return {
      narrative: `${moveData.attacker} used ${moveData.move}!`
    };
  }
};

/**
 * Gets a placeholder image URL with specified dimensions
 * 
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image
 * @returns {string} - The URL for the placeholder image
 */
export const getPlaceholderImageUrl = (width, height) => {
  return `https://placehold.co/${width}x${height}`;
};