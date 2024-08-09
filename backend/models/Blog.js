const mongoose = require("mongoose");


const BlogSchema = mongoose.Schema(
  {
    name: {type: String, required: true},
    title: { type: String, required: true },
    img: [{ type: String, required: true }],
    desc: {type: String, required: true},
    subdesc: {type: String, required: true},
    blockquote: {type: String, required: true},
    tags: [{type: String, required: true}]
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog;
