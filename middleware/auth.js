const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
  // Get auth header value
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  // Check if token is not null
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //get userId from token
    const user = await User.findById(decoded.id).select("_id role");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;
    //set userId to req.user
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token is not valid" });
  }
};

// user authentication middleware. If is not admin, check if req param is the same as the user id in the token
const verifyUser = async (req, res, next) => {
  if (req.user?.role !== "admin") {
    if (req.user?._id?.toString() !== req.params?.id?.toString()) {
      return res.status(402).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }
  }
  next();
};

module.exports = { verifyToken, verifyUser };
