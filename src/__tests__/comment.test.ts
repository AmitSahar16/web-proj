import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import commentRoutes from '../routes/comment_routes';
import User from '../models/user';
import Post from '../models/post';
import Comment from '../models/comment';
import { connectDB, closeDB, clearDB } from './setup';
import { generateAccessToken } from '../services/authService';

const app = express();
app.use(bodyParser.json());
app.use('/comment', commentRoutes);

describe('Comment API', () => {
  let authToken: string;
  let userId: string;
  let otherUserToken: string;
  let otherUserId: string;
  let postId: string;

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

    const post = await Post.create({ message: 'Test post', user: userId });
    postId = post._id.toString();
  });

  describe('POST /comment', () => {
    it('should create a new comment', async () => {
      const response = await request(app)
        .post('/comment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          post: postId,
          text: 'Test comment',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('text', 'Test comment');
      expect(response.body).toHaveProperty('post');
      expect(response.body).toHaveProperty('user');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/comment')
        .send({
          post: postId,
          text: 'Test comment',
        });

      expect(response.status).toBe(401);
    });

    it('should not create comment for non-existent post', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post('/comment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          post: fakePostId,
          text: 'Test comment',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /comment', () => {
    beforeEach(async () => {
      await Comment.create({ post: postId, text: 'Comment 1', user: userId });
      await Comment.create({ post: postId, text: 'Comment 2', user: otherUserId });
    });

    it('should get all comments', async () => {
      const response = await request(app)
        .get('/comment')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should filter comments by post', async () => {
      const otherPost = await Post.create({
        message: 'Other post',
        user: userId,
      });
      await Comment.create({
        post: otherPost._id,
        text: 'Comment on other post',
        user: userId,
      });

      const response = await request(app)
        .get('/comment')
        .query({ post: postId })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /comment/:id', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await Comment.create({
        post: postId,
        text: 'Test comment',
        user: userId,
      });
      commentId = comment._id.toString();
    });

    it('should get comment by id', async () => {
      const response = await request(app)
        .get(`/comment/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', commentId);
      expect(response.body).toHaveProperty('text', 'Test comment');
    });

    it('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/comment/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /comment/:id', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await Comment.create({
        post: postId,
        text: 'Original comment',
        user: userId,
      });
      commentId = comment._id.toString();
    });

    it('should update own comment', async () => {
      const response = await request(app)
        .put(`/comment/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Updated comment',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('text', 'Updated comment');
    });

    it('should not update other user comment', async () => {
      const otherComment = await Comment.create({
        post: postId,
        text: 'Other user comment',
        user: otherUserId,
      });

      const response = await request(app)
        .put(`/comment/${otherComment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Trying to update',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /comment/:id', () => {
    let commentId: string;

    beforeEach(async () => {
      const comment = await Comment.create({
        post: postId,
        text: 'Comment to delete',
        user: userId,
      });
      commentId = comment._id.toString();
    });

    it('should delete own comment', async () => {
      const response = await request(app)
        .delete(`/comment/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Comment deleted');

      const deletedComment = await Comment.findById(commentId);
      expect(deletedComment).toBeNull();
    });

    it('should not delete other user comment', async () => {
      const otherComment = await Comment.create({
        post: postId,
        text: 'Other user comment',
        user: otherUserId,
      });

      const response = await request(app)
        .delete(`/comment/${otherComment._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});

