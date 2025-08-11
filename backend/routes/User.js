const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Post = require("../model/Post");
const fetchUser = require("../middleware/FeatchUser"); 
const multer = require("multer");
const path = require("path");

// Setup multer for profile pic upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/pfps");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// GET user profile
router.get("/:id", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name")
      .populate("following", "name");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update user profile (name, email, bio, pfp)
router.put(
  "/:id",
  fetchUser,
  upload.single("pfp"),
  async (req, res) => {
    try {
      if (req.user.id !== req.params.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { name, email, bio } = req.body;
      const updateData = { name, email, bio };
      if (req.file) {
        updateData.pfp = req.file.filename; // or full path if needed
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      ).select("-password");
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// POST follow/unfollow user
router.post("/:id/follow", fetchUser, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).json({ error: "User not found" });

    const currentUser = await User.findById(req.user.id);

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(currentUser._id);
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      following: !isFollowing,
      followersCount: userToFollow.followers.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET all posts by a user
router.get("/:id/posts", fetchUser, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
