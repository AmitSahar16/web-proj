const express = require('express');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../controllers/comment');

const router = express.Router();

router.get('/', getComments);

router.post('/', createComment);

router.put('/:id', updateComment);

router.delete('/:id', deleteComment);

module.exports = router;

