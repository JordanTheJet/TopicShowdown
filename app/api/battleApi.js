// app/api/battleApi.js
/**
 * API client for the battle game backend
 * Provides functions to interact with the FastAPI server
 */

// Base URL for all API requests - automatically handles proxying through Next.js
const API_BASE_URL = '/api';

/**
 * Initiates battle generation with the provided topic
 * 
 * @param {string} topic - The topic for battle generation (e.g., "rappers in 2025")
 * @returns {Promise<Object>} - A promise that resolves to the response with battle_id
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
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate battle');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateBattle:', error);
    throw error;
  }
};

/**
 * Checks the status of a battle generation task
 * 
 * @param {string} battleId - The ID of the battle generation task
 * @returns {Promise<Object>} - A promise that resolves to the status response
 */
export const checkBattleStatus = async (battleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/battle-status/${battleId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to check battle status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in checkBattleStatus:', error);
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
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate move narrative');
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
 * Gets image URL for a character
 * 
 * @param {number} characterNumber - Character number (1 or 2)
 * @returns {string} - The URL for the character image
 */
export const getCharacterImageUrl = (characterNumber) => {
  return `${API_BASE_URL}/images/character${characterNumber}`;
};

/**
 * Gets the URL for the battle background image
 * 
 * @returns {string} - The URL for the background image
 */
export const getBackgroundImageUrl = () => {
  return `${API_BASE_URL}/images/background`;
};

/**
 * Gets a placeholder image URL with specified dimensions
 * 
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image
 * @returns {string} - The URL for the placeholder image
 */
export const getPlaceholderImageUrl = (width, height) => {
  return `${API_BASE_URL}/placeholder/${width}/${height}`;
};