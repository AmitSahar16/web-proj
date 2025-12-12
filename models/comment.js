const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
  {
    post: { 
      type: Schema.Types.ObjectId, 
      ref: 'Post', 
      required: true,
    },
    text: { 
      type: String, 
      required: true, 
    },
    author: { 
      type: String, 
      required: true,
    },
  },
);

module.exports = model('Comment', commentSchema, 'Comment');

