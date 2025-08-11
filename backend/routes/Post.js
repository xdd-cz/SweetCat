const { validationResult } = require("express-validator");
const Post = require("../model/Post");
const User = require("../model/User"); 
const express = require('express')
const fetchUser = require("../middleware/FeatchUser");
const { default: mongoose } = require("mongoose");
const router = express.Router();

// user post
router.get("/userpost/:id", fetchUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find posts by this user
    const posts = await Post.find({ user: req.params.id });

    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


// all posts 
router.get("/allpost", async (req, res) => {
    try {
        const searchQuery = req.query.searchQuery
            ? { title: { $regex: req.query.searchQuery, $options: "i" } }
            : {};
        const posts = await Post.find(searchQuery);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "internal server error" });
    }
});



//add post
router.post(
    "/addpost",
    fetchUser,
    async (req, res) => {
        try {
            const { title, sub } = req.body;
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let image = req.files.map((el) => {
                return el.filename;
            });

            // Get the user info from DB to get the username
            const user = await User.findById(req.user.id).select("username name");

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Create post with user id and name
            const post = new Post({
                title,
                sub,
                image,
                user: req.user.id,
                name: user.username || user.name || "Unknown",
            });

            const savePost = await post.save();
            res.status(201).json({ savePost });

        } catch (error) {
            console.log(error.message);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);


//like post

router.put("/like/:id", fetchUser, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        // Increment likes without checking ownership
        post.like = (post.like || 0) + 1;
        await post.save();

        res.status(200).json({ post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//update post

router.put("/updatepost/:id", fetchUser, async (req, res) => {
    const { title, sub, likeIncrement } = req.body;

    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "post not found" });

        // Check user authorization
        if (!post.user || post.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "unauthorized access" });
        }

        // Prepare update object
        const newPost = {};
        if (title) newPost.title = title;
        if (sub) newPost.sub = sub;

        // If likeIncrement is true, increment the like count
        if (likeIncrement) {
            newPost.like = (post.like || 0) + 1;
        }

        // Update the post
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: newPost },
            { new: true }
        );

        res.status(200).json({ post: updatedPost });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

//delete post
router.delete(
    "/deletepost/:id",
    fetchUser,
    async ( req, res ) => {
        try {
            let post = await Post.findById(req.params.id);
            if (!post) return res.status(404).json({error: "post not found"});
            if (!post.user || post.user.toString() !== req.user.id) {
                return res.status(401).json({ error: "unauthorized access" });
            }
            await Post.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "post deleted"});
        } catch (error) {
            console.log(error.message);
        }
})

module.exports = router;