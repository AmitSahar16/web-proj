import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from '../routes/user_routes';
import User from '../models/user';
import { connectDB, closeDB, clearDB } from './setup';
import { generateAccessToken } from '../services/authService';

const app = express();
app.use(bodyParser.json());
app.use('/users', userRoutes);

describe('User API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
    userId = user._id.toString();
    authToken = generateAccessToken({
      userId: user._id.toString(),
      username: user.username,
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('username', 'newuser');
      expect(response.body).toHaveProperty('email', 'newuser@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /users', () => {
    it('should get all users', async () => {
      await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123',
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      response.body.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user', async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'updateduser',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'updateduser');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          username: 'updateduser',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted');

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should require authentication', async () => {
      const response = await request(app).delete(`/users/${userId}`);
      expect(response.status).toBe(401);
    });
  });
});

