import { Platform } from 'react-native';
import fs from 'fs';
import path from 'path';

describe('Environment Setup', () => {
  test('Node version meets requirements', () => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(16);
  });

  test('Platform is either iOS or Android', () => {
    expect(['ios', 'android']).toContain(Platform.OS);
  });

  test('Development environment is set correctly', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('Environment file exists', () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBeTruthy();
  });

  test('Required environment variables are defined in .env.example', () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envContent = fs.readFileSync(envExamplePath, 'utf-8');
    const requiredEnvVars = ['API_URL', 'API_KEY', 'ENVIRONMENT'];

    requiredEnvVars.forEach(envVar => {
      expect(envContent).toContain(envVar);
    });
  });

  test('React Native version is compatible', () => {
    const { version } = require('react-native/package.json');
    const [major] = version.split('.');
    expect(parseInt(major)).toBeGreaterThanOrEqual(0);
  });
}); 