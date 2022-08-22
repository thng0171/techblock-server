const Category = require("../models/Category");

const createCategory = async (req, res) => {
  const category = await Category.findOne({ name: req.body.name });
  if (category) {
    //If category already exists
    res.status(400).json({ success: false, message: "Thể loại đã tồn tại" }); //Return error
  } else {
    //If category does not exist
    try {
      //Try to create a new category
      const newCategory = new Category(req.body);
      const category = await newCategory.save();
      res.status(200).json({
        category,
        message: "Thể loại đã được tạo thành công",
        success: true,
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
};

const getAllCategory = async (req, res) => {
  try {
    // get all category sort a-z
    const category = await Category.find().sort({ name: "asc" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
};

// category count
const getCategoryCount = async (req, res) => {
  try {
    const count = await Category.countDocuments();
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res
        .status(404)
        .json({ success: false, message: "Thể loại không tồn tại" });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
};
const updateCategory = async (req, res) => {
  try {
    const updatedArticle = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({
      updatedArticle,
      message: "Thể loại đã được cập nhật",
      success: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Thể loại đã được xóa", success: true });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryCount,
  getCategory,
  updateCategory,
  deleteCategory,
};
