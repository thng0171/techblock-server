const router = require("express").Router();
const {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
  getCommentByArticle,
  getCommentsCount,
} = require("../controllers/comment");
const { verifyToken, verifyUser } = require("../middleware/auth");

//Create a new comment
router.post("/", verifyToken, createComment);

//get all comments
router.get("/", verifyToken, getAllComments);

//get comments count
router.get("/count", verifyToken, verifyUser, getCommentsCount);

//get comment by article id
router.get("/:id", getCommentByArticle);

//update comment
router.put("/:id", verifyToken, updateComment);

//delete comment
router.delete("/:id", verifyToken, deleteComment);

module.exports = router;
