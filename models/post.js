const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    message: {
       type: String, 
       required: true, 
    },
    sender: {
       type: String, 
       required: true,
    },
  },
);

module.exports = model('Post', postSchema, 'posts');

