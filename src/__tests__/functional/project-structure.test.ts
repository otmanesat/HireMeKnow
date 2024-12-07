import fs from 'fs';
import path from 'path';

interface PackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

interface TsConfig {
  compilerOptions: {
    jsx: string;
    strict: boolean;
    target: string;
    moduleResolution: string;
    baseUrl: string;
    paths: Record<string, string[]>;
  };
}

describe('Project Structure', () => {
  const requiredDirectories = [
    'components',
    'screens',
    'navigation',
    'services',
    'utils',
    'assets',
    'hooks',
    'store',
    'types',
    'config',
  ];

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    '.eslintrc.js',
    'jest.config.js',
    '.env.example',
    'babel.config.js',
  ];

  test('All required directories exist in src/', () => {
    requiredDirectories.forEach(dir => {
      const dirPath = path.join(process.cwd(), 'src', dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  test('All required configuration files exist', () => {
    requiredFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('package.json contains required dependencies and scripts', () => {
    const packageJson = require('../../../package.json') as PackageJson;
    
    const requiredDependencies = [
      'react',
      'react-native',
      '@react-navigation/native',
      'axios',
      'react-native-reanimated',
      'react-native-gesture-handler',
    ];

    const requiredDevDependencies = [
      'typescript',
      'jest',
      '@types/jest',
      '@types/react',
      '@types/react-native',
    ];

    const requiredScripts = [
      'start',
      'test',
      'lint',
      'type-check',
      'android',
      'ios',
    ];

    requiredDependencies.forEach(dep => {
      expect(packageJson.dependencies).toHaveProperty(dep);
    });

    requiredDevDependencies.forEach(dep => {
      expect(packageJson.devDependencies).toHaveProperty(dep);
    });

    requiredScripts.forEach(script => {
      expect(packageJson.scripts).toHaveProperty(script);
    });
  });

  test('TypeScript configuration is valid', () => {
    const tsConfig = require('../../../tsconfig.json') as TsConfig;
    
    expect(tsConfig.compilerOptions).toBeDefined();
    expect(tsConfig.compilerOptions.jsx).toBe('react-native');
    expect(tsConfig.compilerOptions.strict).toBe(true);
    expect(tsConfig.compilerOptions.target).toBe('esnext');
    expect(tsConfig.compilerOptions.moduleResolution).toBe('node');
    expect(tsConfig.compilerOptions.baseUrl).toBe('./');
    expect(tsConfig.compilerOptions.paths).toHaveProperty('@/*');
  });

  test('Core source directories contain initial setup files', () => {
    const coreDirectories = ['components', 'screens', 'navigation'];
    
    coreDirectories.forEach(dir => {
      const dirPath = path.join(process.cwd(), 'src', dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        expect(files.length).toBeGreaterThan(0);
      }
    });
  });
}); 