import React, { useEffect, useState } from "react";
import FeedContext from "./FeedContext";

const FeedState = (props) => {

  const [posts, setPosts] = useState([]);
  const [userLikedPosts, setUserLikedPosts] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const id = localStorage.getItem("userId");
      setCurrentUserId(id);
    }
  }, []);

  // Toggle Like/Unlike a post
  const pushLike = async (postId) => {
    // Check if already liked
    const isLiked = userLikedPosts.has(postId);

    // Optimistic UI update
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              like: isLiked ? post.like - 1 : (post.like || 0) + 1,
            }
          : post
      )
    );

    setUserLikedPosts((prev) => {
      const updated = new Set(prev);
      if (isLiked) updated.delete(postId);
      else updated.add(postId);
      return updated;
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/post/like/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to toggle like:", data.error || data);

        // revert optimistic update
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  like: isLiked ? post.like + 1 : post.like - 1,
                }
              : post
          )
        );

        setUserLikedPosts((prev) => {
          const updated = new Set(prev);
          if (isLiked) updated.add(postId);
          else updated.delete(postId);
          return updated;
        });
      } else {
        // Optional: update post data from backend to sync exactly
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? data.post : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);

      // revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                like: isLiked ? post.like + 1 : post.like - 1,
              }
            : post
        )
      );

      setUserLikedPosts((prev) => {
        const updated = new Set(prev);
        if (isLiked) updated.add(postId);
        else updated.delete(postId);
        return updated;
      });
    }
  };

  // Helper to extract user ID from your auth system (assuming localStorage)
  const getCurrentUserId = () => {
    return localStorage.getItem("userId"); // Adjust if different
  };

  // Fetch all posts (optionally with search)
  const allPost = async (searchQuery = "") => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/post/allpost?searchQuery=${searchQuery}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      setPosts(data);

      // Build liked posts set for current user
      const currentUserId = getCurrentUserId();
      const likedIds = new Set();
      data.forEach((post) => {
        if (post.likedBy && post.likedBy.includes(currentUserId)) {
          likedIds.add(post._id);
        }
      });
      setUserLikedPosts(likedIds);

      console.log("All posts fetched:", data);
    } catch (error) {
      console.log("Error fetching posts:", error);
    }
  };

  // Fetch user's own posts
  const userPost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/post/userpost`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      const data = await response.json();
      setPosts(data);

      const currentUserId = getCurrentUserId();
      const likedIds = new Set();
      data.forEach((post) => {
        if (post.likedBy && post.likedBy.includes(currentUserId)) {
          likedIds.add(post._id);
        }
      });
      setUserLikedPosts(likedIds);

      console.log("User posts fetched:", data);
    } catch (error) {
      console.log("Error fetching user posts:", error);
    }
  };

  // Add post (unchanged)
  const addPost = async (title, sub, image = null) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("sub", sub);
      if (image) formData.append("image", image);

      const response = await fetch(`${import.meta.env.VITE_URL}/api/post/addpost`, {
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
        body: formData,
      });

      const data = await response.json();
      setPosts((prev) => [data.savePost, ...prev]);
      console.log("Post added:", data);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  // Update post (unchanged)
  const updatePost = async (postId, title, sub) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/post/updatepost/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ title, sub }),
      });

      const data = await response.json();
      setPosts((prevPosts) => prevPosts.map((p) => (p._id === postId ? data.post : p)));

      console.log("Post updated:", data);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // Delete post (unchanged)
  const deletePost = async (postId) => {
    try {
      await fetch(`${import.meta.env.VITE_URL}/api/post/deletepost/${postId}`, {
        method: "DELETE",
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
      console.log("Post deleted:", postId);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };



  return (
    <FeedContext.Provider
      value={{
        posts,
        setPosts,
        currentUserId,
        pushLike,
        addPost,
        updatePost,
        deletePost,
        allPost,
        userPost,
        userLikedPosts, // expose liked posts if you want
      }}
    >
      {props.children}
    </FeedContext.Provider>
  );
};

export default FeedState;
