// model/Post.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user" },
  name: { type: String, required: true },
  title: { type: String, required: true },
  sub: { type: String, required: false },
  image: { type: [String], required: false },
  like: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: "user" }], // NEW
  comments: { type: Number, required: false },
  comment: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
});

const Post = mongoose.model("post", postSchema);
module.exports = Post;
