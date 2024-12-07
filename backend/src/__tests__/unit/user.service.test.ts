import { UserService, User } from '@services/user.service';
import { DatabaseClient } from '@core/interfaces/database.interface';

describe('UserService', () => {
  // Mock database client
  const mockDbClient: jest.Mocked<DatabaseClient> = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    query: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
  };

  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockDbClient);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should create a user successfully', async () => {
      const mockUser: User = {
        id: '123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDbClient.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(userData);

      expect(mockDbClient.create).toHaveBeenCalledWith('users', expect.objectContaining({
        email: userData.email,
        name: userData.name,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    const userId = '123';
    const updateData = {
      name: 'Updated Name',
    };

    it('should update a user successfully', async () => {
      const mockUpdatedUser: User = {
        id: userId,
        email: 'test@example.com',
        name: updateData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDbClient.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(mockDbClient.update).toHaveBeenCalledWith('users', userId, expect.objectContaining({
        name: updateData.name,
        updatedAt: expect.any(Date),
      }));
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    const userId = '123';

    it('should delete a user successfully', async () => {
      await userService.deleteUser(userId);

      expect(mockDbClient.delete).toHaveBeenCalledWith('users', userId);
    });
  });

  describe('getUserById', () => {
    const userId = '123';

    it('should get a user by id successfully', async () => {
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDbClient.get.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId);

      expect(mockDbClient.get).toHaveBeenCalledWith('users', userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockDbClient.get.mockResolvedValue(null);

      const result = await userService.getUserById(userId);

      expect(mockDbClient.get).toHaveBeenCalledWith('users', userId);
      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers: User[] = [
        {
          id: '123',
          email: 'test1@example.com',
          name: 'Test User 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '456',
          email: 'test2@example.com',
          name: 'Test User 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDbClient.query.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(mockDbClient.query).toHaveBeenCalledWith('SELECT * FROM users');
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      mockDbClient.query.mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(mockDbClient.query).toHaveBeenCalledWith('SELECT * FROM users');
      expect(result).toEqual([]);
    });
  });
}); 