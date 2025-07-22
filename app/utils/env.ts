// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the .env file (two directories up from this file)
const envPath = path.resolve(__dirname, '../../..', '.env');

// Load environment variables from the .env file
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
}

// Export a function to check if required environment variables are present
export function checkRequiredEnvVars() {
  const requiredVars = ['MOCK_JWT_SECRET', 'PSP_CODE'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}

// Log environment loading status
console.log('Environment variables loaded successfully from:', envPath);
console.log('Environment variables available:', {
  NODE_ENV: process.env.NODE_ENV,
  MOCK_JWT_SECRET: process.env.MOCK_JWT_SECRET ? '[REDACTED]' : undefined,
  PSP_CODE: process.env.PSP_CODE,
});
