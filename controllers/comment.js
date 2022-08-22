const Comment = require("../models/Comment");
const Article = require("../models/Article");
const createComment = async (req, res) => {
  const { content, article } = req.body;
  if (!content) {
    return res
      .status(400)
      .json({ success: false, message: "Content is required" });
  }
  const findArticle = await Article.findById(article);
  if (!findArticle) {
    return res
      .status(400)
      .json({ success: false, message: "Article not found" });
  }
  const newComment = new Comment({
    content,
    user: req.user?._id,
    article,
  });
  await newComment.save();
  res
    .status(200)
    .json({ success: true, message: "Comment created", comment: newComment });
};
//get all comments
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find(req.query)
      .populate("user", ["username", "fullname", "profilePicture"])
      .populate("article", ["title", "slug"])
      .sort({ createdAt: "desc" });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
};
// get comment by user
const getCommentByUser = async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.params.id });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
};
//count comments
const getCommentsCount = async (req, res) => {
  try {
    const count = await Comment.countDocuments();
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json(err);
  }
};

// get comment by article id
const getCommentByArticle = async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.id })
      .populate("user", ["username", "fullname", "profilePicture"])
      .sort({ createdAt: "desc" });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
};

// update comment
const updateComment = async (req, res) => {
  try {
    // check comment exists
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, message: "Comment updated", updatedComment });
  } catch (err) {
    res.status(500).json(err);
  }
};
// delete comment
const deleteComment = async (req, res) => {
  try {
    // check comment exists
    const comment = await Comment.findById(req.params.id);
    //check if comment belongs to user
    // console.log(comment.user.toString());
    // console.log(req.user._id.toString());
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    await comment.remove();
    res.status(200).json({ message: "Comment deleted", success: true });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
  getCommentsCount,
  getCommentByUser,
  getCommentByArticle,
};
