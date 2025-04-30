import { loadEnvironmentVariables } from '../utils/env';

export const initializeAzureConfig = async () => {
  try {
    // Load environment variables from Azure Key Vault
    await loadEnvironmentVariables();
    
    // Validate required environment variables
    const requiredEnvVars = [
      'VITE_APP_TITLE',
      'VITE_API_URL',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    console.log('Azure configuration initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Azure configuration:', error);
    throw error;
  }
}; 