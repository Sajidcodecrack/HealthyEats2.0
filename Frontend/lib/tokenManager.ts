import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY: string = 'userAuthToken'; // The key to use for storing the token

/**
 * Saves the authentication token to secure storage.
 * @param {string} token - The authentication token to save.
 * @returns {Promise<void>}
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('Token saved successfully.');
  } catch (error) {
    console.error('Error saving the auth token', error);
  }
}

/**
 * Retrieves the authentication token from secure storage.
 * @returns {Promise<string | null>} The authentication token, or null if it doesn't exist.
 */
export async function getToken(): Promise<string | null> {
  try {
    // Corrected from SecureStore.setItemAsync to SecureStore.getItemAsync
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting the auth token', error);
    return null;
  }
}

/**
 * Deletes the authentication token from secure storage.
 * @returns {Promise<void>}
 */
export async function deleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log('Token deleted successfully.');
  } catch (error) {
    console.error('Error deleting the auth token', error);
  }
}