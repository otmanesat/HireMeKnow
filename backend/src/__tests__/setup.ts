import dotenv from 'dotenv';
import { register } from 'tsconfig-paths';

// Register TypeScript path aliases
register({
  baseUrl: './src',
  paths: {
    '@core/*': ['core/*'],
    '@services/*': ['services/*'],
    '@infrastructure/*': ['infrastructure/*'],
  },
});

// Load environment variables
dotenv.config();

describe('Backend Test Environment Setup', () => {
  it('should have TypeScript path aliases configured', () => {
    expect(() => require('@core/interfaces/database.interface')).not.toThrow();
    expect(() => require('@services/user.service')).not.toThrow();
    expect(() => require('@infrastructure/database.factory')).not.toThrow();
  });

  it('should have required environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.DATABASE_URL).toBeDefined();
  });
});

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Clean up function after all tests
afterAll(async () => {
  // Add cleanup logic here if needed
}); 