import { Pool, PoolClient } from 'pg';
import { DatabaseClient, DatabaseConfig } from '../../core/interfaces/database.interface';

export class PostgresqlClient implements DatabaseClient {
  private pool: Pool;
  private client: PoolClient | null = null;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });
  }

  async connect(): Promise<void> {
    this.client = await this.pool.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.release();
    }
    await this.pool.end();
  }

  async query<T>(query: string, params?: any[]): Promise<T[]> {
    if (!this.client) {
      throw new Error('Database client not connected');
    }
    const result = await this.client.query(query, params);
    return result.rows as T[];
  }

  async create<T>(table: string, item: Partial<T>): Promise<T> {
    const columns = Object.keys(item);
    const values = Object.values(item);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.query<T>(query, values);
    return result[0];
  }

  async update<T>(table: string, id: string, item: Partial<T>): Promise<T> {
    const updates = Object.keys(item).map((key, i) => `${key} = $${i + 2}`);
    const values = [...Object.values(item), id];
    
    const query = `
      UPDATE ${table}
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query<T>(query, values);
    return result[0];
  }

  async delete(table: string, id: string): Promise<void> {
    await this.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  }

  async get<T>(table: string, id: string): Promise<T | null> {
    const result = await this.query<T>(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result[0] || null;
  }
} 