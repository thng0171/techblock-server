const router = require("express").Router();
const { verifyToken, verifyUser } = require("../middleware/auth");
const {
  registerUser,
  registerAdmin,
  login,
  loginAdmin,
} = require("../controllers/auth");
require("dotenv").config();

//  Register a new user
router.post("/register", registerUser);

// Register an admin user (Admin user can only be created by an admin)
router.post("/register/admin", verifyToken, verifyUser, registerAdmin);

// Login a user
router.post("/login", login);

//login admin
router.post("/login/admin", loginAdmin);

module.exports = router;
