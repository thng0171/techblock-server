const express = require("express");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const articleRoute = require("./routes/article");
const commentRoute = require("./routes/comment");
const categoryRoute = require("./routes/category");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const app = express();
const fs = require("fs");

require("dotenv").config();

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//connect to mongodb
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

//multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

//Upload file
const upload = multer({ storage: storage });
app.post("/api/upload", upload.array("files"), (req, res) => {
  res.status(200).json("File uploaded");
});

// ROUTES
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/article", articleRoute);
app.use("/api/category", categoryRoute);
app.use("/api/comment", commentRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
