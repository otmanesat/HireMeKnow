import { PostgresqlClient } from '@infrastructure/local/postgresql.client';
import { DynamoDBClient } from '@infrastructure/serverless/dynamodb.client';
import { DatabaseClientFactory } from '@infrastructure/database.factory';

describe('Database Clients', () => {
  describe('PostgresqlClient', () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      username: 'test_user',
      password: 'test_pass',
    };

    let client: PostgresqlClient;

    beforeEach(() => {
      client = new PostgresqlClient(config);
    });

    it('should create a PostgreSQL client with correct configuration', () => {
      expect(client).toBeInstanceOf(PostgresqlClient);
    });

    it('should implement all required database interface methods', () => {
      expect(client.connect).toBeDefined();
      expect(client.disconnect).toBeDefined();
      expect(client.query).toBeDefined();
      expect(client.create).toBeDefined();
      expect(client.update).toBeDefined();
      expect(client.delete).toBeDefined();
      expect(client.get).toBeDefined();
    });
  });

  describe('DynamoDBClient', () => {
    const config = {
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
    };

    let client: DynamoDBClient;

    beforeEach(() => {
      client = new DynamoDBClient(config);
    });

    it('should create a DynamoDB client with correct configuration', () => {
      expect(client).toBeInstanceOf(DynamoDBClient);
    });

    it('should implement all required database interface methods', () => {
      expect(client.connect).toBeDefined();
      expect(client.disconnect).toBeDefined();
      expect(client.query).toBeDefined();
      expect(client.create).toBeDefined();
      expect(client.update).toBeDefined();
      expect(client.delete).toBeDefined();
      expect(client.get).toBeDefined();
    });
  });

  describe('DatabaseClientFactory', () => {
    const config = {
      host: 'localhost',
      region: 'us-east-1',
    };

    it('should create PostgreSQL client for development environment', () => {
      const client = DatabaseClientFactory.create('development', config);
      expect(client).toBeInstanceOf(PostgresqlClient);
    });

    it('should create PostgreSQL client for local environment', () => {
      const client = DatabaseClientFactory.create('local', config);
      expect(client).toBeInstanceOf(PostgresqlClient);
    });

    it('should create DynamoDB client for production environment', () => {
      const client = DatabaseClientFactory.create('production', config);
      expect(client).toBeInstanceOf(DynamoDBClient);
    });

    it('should create DynamoDB client for staging environment', () => {
      const client = DatabaseClientFactory.create('staging', config);
      expect(client).toBeInstanceOf(DynamoDBClient);
    });

    it('should throw error for unsupported environment', () => {
      expect(() => {
        DatabaseClientFactory.create('invalid', config);
      }).toThrow('Unsupported environment: invalid');
    });
  });
}); 