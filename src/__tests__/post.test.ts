import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import postRoutes from '../routes/post_routes';
import User from '../models/user';
import Post from '../models/post';
import { connectDB, closeDB, clearDB } from './setup';
import { generateAccessToken } from '../services/authService';

const app = express();
app.use(bodyParser.json());
app.use('/post', postRoutes);

describe('Post API', () => {
  let authToken: string;
  let userId: string;
  let otherUserToken: string;
  let otherUserId: string;

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

    const otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123',
    });
    otherUserId = otherUser._id.toString();
    otherUserToken = generateAccessToken({
      userId: otherUser._id.toString(),
      username: otherUser.username,
    });
  });

  describe('POST /post', () => {
    it('should create a new post', async () => {
      const response = await request(app)
        .post('/post')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Test post message',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Test post message');
      expect(response.body).toHaveProperty('user');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/post')
        .send({
          message: 'Test post message',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /post', () => {
    beforeEach(async () => {
      await Post.create({ message: 'Post 1', user: userId });
      await Post.create({ message: 'Post 2', user: userId });
      await Post.create({ message: 'Post 3', user: otherUserId });
    });

    it('should get all posts', async () => {
      const response = await request(app)
        .get('/post')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it('should filter posts by user', async () => {
      const response = await request(app)
        .get('/post')
        .query({ user: userId })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      response.body.forEach((post: any) => {
        expect(post.user._id || post.user).toBe(userId);
      });
    });
  });

  describe('GET /post/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await Post.create({ message: 'Test post', user: userId });
      postId = post._id.toString();
    });

    it('should get post by id', async () => {
      const response = await request(app)
        .get(`/post/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', postId);
      expect(response.body).toHaveProperty('message', 'Test post');
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/post/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /post/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await Post.create({ message: 'Original message', user: userId });
      postId = post._id.toString();
    });

    it('should update own post', async () => {
      const response = await request(app)
        .put(`/post/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Updated message',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Updated message');
    });

    it('should not update other user post', async () => {
      const otherPost = await Post.create({
        message: 'Other user post',
        user: otherUserId,
      });

      const response = await request(app)
        .put(`/post/${otherPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Trying to update',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /post/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await Post.create({ message: 'Post to delete', user: userId });
      postId = post._id.toString();
    });

    it('should delete own post', async () => {
      const response = await request(app)
        .delete(`/post/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post deleted');

      const deletedPost = await Post.findById(postId);
      expect(deletedPost).toBeNull();
    });

    it('should not delete other user post', async () => {
      const otherPost = await Post.create({
        message: 'Other user post',
        user: otherUserId,
      });

      const response = await request(app)
        .delete(`/post/${otherPost._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});

