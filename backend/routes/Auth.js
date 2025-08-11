const express = require("express");
const dotenv = require("dotenv");
const fetchUser = require("../middleware/FeatchUser");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const secret = process.env.JWT_SECTET;

router.post(
  "/createuser",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be atleast 3 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters"),
  ],
  async (req, res) => {
    // const {name, email, password} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = bcrypt.genSaltSync(10);
      const secPassword = bcrypt.hashSync(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPassword,
      });
      const data = {
        user: {
          id: user._id,
        },
      };

      var authToken = jwt.sign(data, secret);
      res
        .status(201)
        .json({ message: "User created successfully", user, authToken });
    } catch (error) {
      console.log(error);
    }
  }
);

//login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 3 })
      .withMessage("Password must be atleast 5 characeter"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Email already exist" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const data = {
        user: {
          id: user._id,
        },
      };

      var authToken = jwt.sign(data, secret);

      res.status(201).json({ message: "login success", user, authToken });
    } catch (error) {
      console.log(error);
      res.status(500).send("internal server error");
    }
  }
);

router.get("/getuser/", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ name: user.name });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//getuser form id

router.get("/getuser/:id", fetchUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profile"); // store in uploads/profile
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fs = require("fs");
const uploadDir = "./uploads/profile";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) return cb(null, true);
    cb(new Error("Error: Images only!"));  // <-- pass Error instance
  },
});


// In your update route, add logging:

router.post(
  "/updateuser/:id",
  fetchUser,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("req.file:", req.file);  // Check if file is uploaded
      const { name, email, bio } = req.body;
      const userId = req.params.id;

      if (req.user.id !== userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (bio) updateFields.bio = bio;
      if (req.file) updateFields.image = `/uploads/profile/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);



module.exports = router;
