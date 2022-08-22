const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// generate token function
const generateToken = (userId, userRole) => {
  return jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const registerUser = async (req, res) => {
  const { username, fullname, email, password } = req.body;
  if (!username || !fullname || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill in all fields" });
  }
  try {
    // Check if user already exists
    const user = await User.findOne({ username });
    const emailUser = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        param: "username",
        success: false,
        message: "Tên đăng nhập đã được sử dụng",
      });
    }
    if (emailUser) {
      return res.status(400).json({
        param: "email",
        success: false,
        message: "Email đã được sử dụng",
      });
    }
    // Hash password
    const HashPassword = await argon2.hash(password);
    // Create new user
    const newUser = new User({
      username,
      password: HashPassword,
      fullname,
      email,
      role: "user",
    });
    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Đăng ký thành công",
    });
  } catch (error) {
    console.log(error);
  }
};
const registerAdmin = async (req, res) => {
  const { username, fullname, email, password } = req.body;
  if (!username || !fullname || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill in all fields" });
  }
  try {
    const user = await User.findOne({ username });
    const emailUser = await User.findOne({ email });
    // Check if user already exists
    if (user) {
      return res.status(400).json({
        param: "username",
        success: false,
        message: "Tên đăng nhập admin đã tồn tại",
      });
    }
    // Check if email already exists
    if (emailUser) {
      return res.status(400).json({
        param: "email",
        success: false,
        message: "Email đã tồn tại",
      });
    }
    // Hash password
    const HashPassword = await argon2.hash(password);
    // create admin user
    const newUser = new User({
      username,
      fullname,
      email,
      password: HashPassword,
      role: "admin",
    });
    await newUser.save();

    return res.status(200).json({
      success: true,
      message: "Admin user created",
      // token: generateToken(newUser._id),
    });
  } catch (error) {
    console.log(error);
  }
};
const login = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({
        param: "username",
        success: false,
        message: "Tên đăng nhập không tồn tại",
      });
    }
    // Check if password is correct
    const isMatch = await argon2.verify(user.password, req.body.password);
    if (!isMatch) {
      return res.status(400).json({
        param: "password",
        success: false,
        message: "Mật khẩu không đúng",
      });
    }
    //
    // return userData and Token
    const { password, ...userData } = user._doc;
    res.status(200).json({
      token: generateToken(user._id),
      userData: userData,
    });
  } catch (error) {
    console.log(error);
  }
};
//login admin
const loginAdmin = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({
        param: "username",
        success: false,
        message: "Tên đăng nhập không tồn tại",
      });
    }
    // Check if password is correct
    const isMatch = await argon2.verify(user.password, req.body.password);
    if (!isMatch) {
      return res.status(400).json({
        param: "password",
        success: false,
        message: "Mật khẩu không đúng",
      });
    }
    // check admin role
    if (user.role !== "admin") {
      return res.status(400).json({
        param: "role",
        success: false,
        message: "Bạn không có quyền đăng nhập",
      });
    }
    // return userData and Token
    const { password, ...userData } = user._doc;
    res.status(200).json({
      token: generateToken(user._id),
      userData: userData,
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = { registerUser, registerAdmin, login, loginAdmin };
