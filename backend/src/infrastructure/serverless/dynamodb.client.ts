import { DynamoDB } from 'aws-sdk';
import { DatabaseClient, DatabaseConfig } from '../../core/interfaces/database.interface';

export class DynamoDBClient implements DatabaseClient {
  private client: DynamoDB.DocumentClient;

  constructor(config: DatabaseConfig) {
    this.client = new DynamoDB.DocumentClient({
      region: config.region,
      endpoint: config.endpoint,
    });
  }

  async connect(): Promise<void> {
    // DynamoDB client doesn't require explicit connection
  }

  async disconnect(): Promise<void> {
    // DynamoDB client doesn't require explicit disconnection
  }

  async query<T>(query: string, params?: any[]): Promise<T[]> {
    // For DynamoDB, we'll need to translate SQL-like queries to DynamoDB operations
    // This is a simplified example
    const [operation, table] = query.split(' ');
    
    if (operation.toLowerCase() === 'select') {
      const result = await this.client.scan({
        TableName: table,
      }).promise();
      
      return (result.Items || []) as T[];
    }
    
    throw new Error('Unsupported query operation for DynamoDB');
  }

  async create<T>(table: string, item: Partial<T>): Promise<T> {
    await this.client.put({
      TableName: table,
      Item: item,
    }).promise();
    
    return item as T;
  }

  async update<T>(table: string, id: string, item: Partial<T>): Promise<T> {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = {};
    const expressionAttributeNames: { [key: string]: string } = {};

    Object.entries(item).forEach(([key, value], index) => {
      updateExpressions.push(`#field${index} = :value${index}`);
      expressionAttributeValues[`:value${index}`] = value;
      expressionAttributeNames[`#field${index}`] = key;
    });

    const params = {
      TableName: table,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    };

    const result = await this.client.update(params).promise();
    return result.Attributes as T;
  }

  async delete(table: string, id: string): Promise<void> {
    await this.client.delete({
      TableName: table,
      Key: { id },
    }).promise();
  }

  async get<T>(table: string, id: string): Promise<T | null> {
    const result = await this.client.get({
      TableName: table,
      Key: { id },
    }).promise();

    return (result.Item as T) || null;
  }
} 