import { DatabaseClient, DatabaseConfig } from '../core/interfaces/database.interface';
import { PostgresqlClient } from './local/postgresql.client';
import { DynamoDBClient } from './serverless/dynamodb.client';

export class DatabaseClientFactory {
  static create(environment: string, config: DatabaseConfig): DatabaseClient {
    switch (environment) {
      case 'local':
      case 'development':
        return new PostgresqlClient(config);
      case 'production':
      case 'staging':
        return new DynamoDBClient(config);
      default:
        throw new Error(`Unsupported environment: ${environment}`);
    }
  }
} 