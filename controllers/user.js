const User = require("../models/User");
const argon2 = require("argon2");
const fs = require("fs");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    // return user data without password
    const usersData = users.map((user) => {
      const { password, ...userData } = user._doc;
      return userData;
    });
    res.status(200).json(usersData);
  } catch (err) {
    res.status(500).json(err);
  }
};
//count users
const getUsersCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json(count);
  } catch (err) {
    res.status(500).json(err);
  }
};
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateUser = async (req, res) => {
  try {
    //check if username is already taken
    const { username, email, fullname, profilePicture, oldProfilePic } =
      req.body;
    // if username is changed, check if new username is already taken
    // console.log(username);
    if (username) {
      const findUser = await User.findOne({ username: username });
      if (findUser && findUser._id !== req.user._id) {
        return res.status(400).json({
          param: "username",
          success: false,
          message: "Tên đăng nhập đã được sử dụng",
        });
      }
    }
    // console.log(email);
    //check if email is already taken
    if (email) {
      const findEmail = await User.findOne({ email: email });
      if (findEmail) {
        return res.status(400).json({
          param: "email",
          success: false,
          message: "Email đã được sử dụng",
        });
      }
    }
    //check user if change profile picture then delete old profile picture
    // console.log(profilePicture);
    // console.log(oldProfilePic);
    if (profilePicture && oldProfilePic) {
      fs.unlink(`./uploads/${oldProfilePic}`, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, fullname, profilePicture },
      {
        new: true,
      }
    );
    const { password, ...userData } = updatedUser._doc;
    res.status(200).json({
      success: true,
      message: "Đã cập nhật thông tin",
      user: userData,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// change password
const changePassword = async (req, res) => {
  try {
    //check if old password is correct
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu cũ không đúng",
      });
    }
    //hash new password
    const HashPassword = await argon2.hash(newPassword);
    //update password
    user.password = HashPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Đã cập nhật mật khẩu",
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Đã xoá người dùng" });
  } catch (err) {
    res.status(500).json(err);
  }
};

//save article to user's articles
const saveArticle = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // console.log(user);
    user.savedArticles.push(req.body.article);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Saved article",
      data: user.savedArticles,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
//delete article from user's articles
const removeArticle = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // console.log(user);
    const index = user.savedArticles.indexOf(req.params.id);
    // console.log(index);
    user.savedArticles.splice(index, 1);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Deleted article",
      data: user.savedArticles,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  getUsersCount,
  updateUser,
  deleteUser,
  saveArticle,
  removeArticle,
  changePassword,
};
