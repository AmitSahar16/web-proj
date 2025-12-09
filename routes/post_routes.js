const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
} = require('../controllers/post');

const router = express.Router();

router.get('/', getPosts);

router.get('/:id', getPostById);

router.post('/', createPost);

router.put('/:id', updatePost);

module.exports = router;

