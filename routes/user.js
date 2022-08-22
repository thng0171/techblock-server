const {
  getAllUsers,
  getUser,
  updateUser,
  getUsersCount,
  saveArticle,
  removeArticle,
  deleteUser,
  changePassword,
} = require("../controllers/user");
const { verifyToken, verifyUser } = require("../middleware/auth");

const router = require("express").Router();

//Get all users
router.get("/", verifyToken, verifyUser, getAllUsers);

//count users
router.get("/count", verifyToken, verifyUser, getUsersCount);

//Get User by id
router.get("/:id", verifyToken, verifyUser, getUser);

//save article to user's articles
router.post("/bookmark", verifyToken, saveArticle);
//remove article from user's articles
router.put("/bookmark/:id", verifyToken, removeArticle);
//Update
router.put("/:id", verifyToken, verifyUser, updateUser);
//change password
router.put("/change-password/:id", verifyToken, verifyUser, changePassword);
//Delete
router.delete("/:id", verifyToken, verifyUser, deleteUser);

module.exports = router;
