import { DatabaseClient } from '../core/interfaces/database.interface';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private readonly tableName = 'users';

  constructor(private readonly dbClient: DatabaseClient) {}

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const user: Partial<User> = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    return this.dbClient.create<User>(this.tableName, user);
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const updateData = {
      ...userData,
      updatedAt: new Date(),
    };

    return this.dbClient.update<User>(this.tableName, id, updateData);
  }

  async deleteUser(id: string): Promise<void> {
    await this.dbClient.delete(this.tableName, id);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.dbClient.get<User>(this.tableName, id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.dbClient.query<User>(`SELECT * FROM ${this.tableName}`);
  }
} 