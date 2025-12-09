const express = require('express');

const postRoutes = require('./post_routes');
const commentRoutes = require('./comment_routes');

const router = express.Router();

router.use('/post', postRoutes);
router.use('/comment', commentRoutes);

module.exports = router;

