import express from 'express';
import authRoutes from './auth_routes';
import userRoutes from './user_routes';
import postRoutes from './post_routes';
import commentRoutes from './comment_routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/post', postRoutes);
router.use('/comment', commentRoutes);

export default router;

