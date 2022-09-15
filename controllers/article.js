const Article = require("../models/Article");
const slugify = require("slugify");
const Comment = require("../models/Comment");
const edjsHTML = require("editorjs-html");
const fs = require("fs");

const createArticle = async (req, res) => {
  const { title, author, content, coverImage, category } = req.body;
  if (!title  || !content || !category || !coverImage) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ nội dung" });
  }
  const findArticle = await Article.findOne({ title });
  if (findArticle) {
    //Check if title already exists
    return res
      .status(400)
      .json({ success: false, message: "Tiêu đề đã tồn tại" });
  }
  try {
    //generate slug
    const slug = slugify(title, { lower: true, locale: "vi", strict: true });
    //create article

    const newArticle = new Article({
      title,
      content,
      author,
      coverImage,
      category,
      slug,
    });

    await newArticle.save();
    res.status(201).json({ success: true, message: "Đã tạo bài viết" });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
      message: "Có lỗi xảy ra, vui lòng thử lại",
    });
  }
};

const getArticles = async (req, res) => {
  try {
    const date = req.query.date || "desc";
    const articles = await Article.find(req.query).sort({ createdAt: date });
    // add prefix server uploads url to image url
    // articles.forEach((article) => {
    //   article.coverImage = `${process.env.APP_IMG_URL}/${article.coverImage}`;
    // });
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },    
      { new: true }
    );
    //return
    // const parseToHtml = edjsParser.parse(content);
    // parse  article content to html using editorjs-html
    if (article) {
      const edjsParser = edjsHTML();
      const parsedContent = edjsParser.parse(article.content);
      article.content = parsedContent;
      article.comments = await Comment.find({ article: article._id })
        .populate("user", ["username", "fullname", "profilePicture"])
        .sort({ createdAt: "desc" });
      res.status(200).json(article);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });
    }
    // article.coverImage = `${process.env.APP_IMG_URL}/${article.coverImage}`;
    res.status(200).json(article);
  } catch (err) {
    res.status(500).json(err);
  }
};
//seach article by title
const searchArticles = async (req, res) => {
  try {
    // if has multiple keywords seperate them by space and use $or operator to search for all keywords in title
    let keywords = req.query.keyword.split(" ").map((keyword) => {
      return (keyword = new RegExp(req.query.keyword, "i"));
    });
    const articles = await Article.find({
      $or: keywords.map((keyword) => ({ title: { $regex: keyword } })),
    });
    // if no article found return message
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }
    // add prefix server upload img  to image url
    // articles.forEach((article) => {
    //   article.coverImage = `${process.env.APP_IMG_URL}/${article.coverImage}`;
    // });
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getTopArticles = async (req, res) => {
  try {
    // find article with most views in last 48 hours
    // console.log(req.query)
    const day = req.query.day || 1;
    const articles = await Article.find({
      createdAt: {
        $gte: new Date(Date.now() - day * 24 * 60 * 60 * 1000),
      },
    })
      .sort({ views: -1 })
      .limit(req.query.limit);
    // add prefix server uploaded  to image url
    // articles.forEach((article) => {
    //   article.coverImage = `${process.env.APP_IMG_URL}/${article.coverImage}`;
    // });
    //comments
    // articles.forEach((article) => {
    //   // console.log(article._id.toString());
    //   article.comments = Comment.find({ article: article._id });
    // });

    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json(err);
  }
};
const updateArticle = async (req, res) => {
  try {
    const { title, author, content, coverImage, category, oldCoverImage } = req.body;
    // console.log(author)
    // console.log(req.user._id)
    // if(author.tostring() !== req.user._id.toString()){
    //   return res.status(404).json({success: false, message: "Không có quyên chỉnh sửa"})
    // }
    if (!title || !author || !content || !category || !coverImage) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields" });
    }
    // console.log(oldCoverImage);
    // if user change cover image, delete old cover image from server
    if (oldCoverImage) {
      fs.unlink(`./uploads/${oldCoverImage}`, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }
      });
    }
    //  generate new slug
    const slug = slugify(title, { lower: true, locale: "vi", strict: true });

    let updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        content,
        coverImage,
        category,
        slug,
      },
      { new: true }
    );
    !updatedArticle &&
      res.status(404).json({
        success: false,
        message: "Article not found",
      });

    res.status(200).json({
      success: true,
      message: "Bài viết đã được cập nhật",
      article: updatedArticle,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteArticle = async (req, res) => {
  // delete article by id and delete all comments, files related to article
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài viết" });
    }
    await Comment.deleteMany({ article: req.params.id });
    fs.unlink(`./uploads/${article.coverImage}`, (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json(err);
      }
    }),
      await article.remove();
    res.status(200).json({
      success: true,
      message: "Bài viết đã được xóa",
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// try {
//   await Article.findByIdAndDelete(req.params.id);
//   res.status(200).json({ message: "Bài viết đã được xóa" });
// } catch (err) {
//   res.status(500).json(err);
// }
// };
// articles count function
const getArticlesCount = async (req, res) => {
  try {
    const count = await Article.countDocuments();
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json(err);
  }
};
module.exports = {
  createArticle,
  getArticleBySlug,
  getArticleById,
  getArticles,
  getArticlesCount,
  getTopArticles,
  searchArticles,
  updateArticle,
  deleteArticle,
};
