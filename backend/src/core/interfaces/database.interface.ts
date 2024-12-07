export interface DatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(query: string, params?: any[]): Promise<T[]>;
  create<T>(table: string, item: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, item: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
  get<T>(table: string, id: string): Promise<T | null>;
}

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  region?: string;
  endpoint?: string;
} 