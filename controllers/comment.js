const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Post = require('../models/post');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createComment = async (req, res) => {
  try {
    const { post } = req.body;

    if (post && !isValidObjectId(post)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    if (post) {
      const exists = await Post.exists({ _id: post });

      if (!exists) {
        return res.status(404).json({ message: 'Post not found' });
      }
    }

    const comment = await Comment.create(req.body);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { post } = req.query;

    if (post && !isValidObjectId(post)) {
      return res.status(400).json({ message: 'Invalid post id' });
    }

    const comments = post ? await Comment.find({ post }) : await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateComment = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  
  try {
    const updated = await Comment.findByIdAndUpdate(id, req.body, {
      new: true,
      overwrite: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  
  try {
    const deleted = await Comment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};

