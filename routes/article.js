const router = require("express").Router();
const { verifyToken, verifyUser } = require("../middleware/auth");
const multer = require("multer");
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  searchArticles,
  updateArticle,
  deleteArticle,
  getTopArticles,
  getArticleById,
  getArticlesCount,
} = require("../controllers/article");

//upload cover image
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

// init upload
const upload = multer({
  storage: storage,
}).single("images");

router.post("/upload-images", verifyToken, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({
        result: "failed",
        message: `Cannot upload files. Error is ${err}`,
      });
    } else {
      if (req.file === undefined) {
        res.status(400).json({
          result: "failed",
          message: "You are not submit images",
        });
      } else {
        console.log(req.file);
        res.status(200).json({
          result: "ok",
          message: "Upload image successfully",
          path: req.file.originalname,
        });
      }
    }
  });
});

// Create a new article
router.post("/", verifyToken, verifyUser, createArticle);
// Get  articles count
router.get("/count", verifyToken, verifyUser, getArticlesCount);
// Get all article
router.get("/", getArticles);

//get top article
router.get("/top", getTopArticles);

// Search with query string
router.get("/search", searchArticles);

// Get article detail by slug
router.get("/:slug", getArticleBySlug);

// get article detail by id
router.get("/id/:id", getArticleById);

//Update article
router.put("/:id", verifyToken, verifyUser, updateArticle);

//Delete article by id
router.delete("/:id", verifyToken, verifyUser, deleteArticle);

module.exports = router;
