const router = require("express").Router();
const {
  createCategory,
  getAllCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryCount,
} = require("../controllers/category");
const { verifyToken, verifyUser } = require("../middleware/auth");

//Create a new category
router.post("/", verifyToken, verifyUser, createCategory);
//count category
router.get("/count", verifyToken, verifyUser, getCategoryCount);

//Get all category
router.get("/", getAllCategory);
//Get Category by id
router.get("/:id", getCategory);
//Update Category
router.put("/:id", verifyToken, verifyUser, updateCategory);
//Delete Category by id
router.delete("/:id", verifyToken, verifyUser, deleteCategory);

module.exports = router;
