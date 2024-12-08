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

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost:5432/hiremeknow_test';

// Add TextEncoder and TextDecoder to global scope
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

describe('Backend Test Environment Setup', () => {
  it('should have TypeScript path aliases configured', () => {
    expect(() => require('@core/interfaces/database.interface')).not.toThrow();
    expect(() => require('@services/user.service')).not.toThrow();
    expect(() => require('@infrastructure/database.factory')).not.toThrow();
  });

  it('should have required environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.DATABASE_URL).toBe('postgresql://localhost:5432/hiremeknow_test');
  });

  it('should have TextEncoder and TextDecoder available', () => {
    expect(global.TextEncoder).toBeDefined();
    expect(global.TextDecoder).toBeDefined();
  });
});

// Global test timeout
jest.setTimeout(30000);

// Clean up function after all tests
afterAll(async () => {
  // Add cleanup logic here if needed
}); 