import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { DatabaseClient } from '@core/interfaces/database.interface';
import { UserService } from '@services/user.service';

describe('API Integration Tests', () => {
  let app: express.Application;
  let mockDbClient: jest.Mocked<DatabaseClient>;
  let userService: UserService;
  let userExists: boolean = true;

  beforeAll(() => {
    // Create mock database client
    mockDbClient = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      query: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((table, item) => Promise.resolve({ id: '123', ...item })),
      update: jest.fn().mockImplementation((table, id, item) => Promise.resolve({ id, ...item })),
      delete: jest.fn().mockImplementation(() => {
        userExists = false;
        return Promise.resolve(undefined);
      }),
      get: jest.fn().mockImplementation((table, id) => 
        id === '123' && userExists
          ? Promise.resolve({ id, email: 'test@example.com', name: 'Test User' })
          : Promise.resolve(null)
      ),
    };

    // Create user service with mock client
    userService = new UserService(mockDbClient);

    // Create Express app
    app = express();
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // User endpoints
    app.post('/api/users', async (req, res) => {
      try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
      }
    });

    app.get('/api/users/:id', async (req, res) => {
      try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
      }
    });

    app.put('/api/users/:id', async (req, res) => {
      try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
      }
    });

    app.delete('/api/users/:id', async (req, res) => {
      try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
      }
    });

    app.get('/api/users', async (req, res) => {
      try {
        const users = await userService.getAllUsers();
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get users' });
      }
    });
  });

  beforeEach(() => {
    userExists = true;
  });

  describe('Health Check', () => {
    it('GET /api/health should return 200 OK', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('User API', () => {
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
    };

    it('POST /api/users should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        id: '123',
        email: testUser.email,
        name: testUser.name,
      });
    });

    it('GET /api/users/:id should return a user', async () => {
      const response = await request(app)
        .get('/api/users/123')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('GET /api/users/:id should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('PUT /api/users/:id should update a user', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put('/api/users/123')
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: '123',
        name: updateData.name,
      });
    });

    it('GET /api/users should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('DELETE /api/users/:id should delete a user', async () => {
      await request(app)
        .delete('/api/users/123')
        .expect(204);

      // Verify user is deleted
      await request(app)
        .get('/api/users/123')
        .expect(404);
    });
  });
}); 