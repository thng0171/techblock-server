const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
    },
    content: {
      type: Object,
      required: [true, "Content is required"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      //  Change to ObjectId
    },
    views: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
