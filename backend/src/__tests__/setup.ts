import dotenv from 'dotenv';
import { register } from 'tsconfig-paths';

// Register TypeScript path aliases
register({
  baseUrl: './src',
  paths: {
    '@core/*': ['core/*'],
    '@infrastructure/*': ['infrastructure/*'],
    '@services/*': ['services/*'],
    '@utils/*': ['utils/*']
  }
});

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Clean up function after all tests
afterAll(async () => {
  // Add cleanup logic here if needed
}); 