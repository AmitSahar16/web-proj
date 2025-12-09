const express = require('express');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../controllers/comment');

const router = express.Router();

router.post('/', createComment);
router.get('/', getComments);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;

