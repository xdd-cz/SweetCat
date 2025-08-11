import React, { useContext, useEffect, useState } from "react";
import FeedContext from "../context/FeedContext";
import { FaComment, FaRegHeart, FaTrash, FaEdit } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import UploadPostModal from "./UploadPostModel";
import { Link, useLocation } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);

const Feed = () => {
  const {
    posts,
    setPosts,
    pushLike,
    deletePost,
    updatePost,
    allPost,
    addPost,
    userLikedPosts,
  } = useContext(FeedContext);

  const [editMode, setEditMode] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSub, setEditSub] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState(null);
  const [usersInfo, setUsersInfo] = useState({});
  const query = useQuery();
  const searchQuery = query.get("searchQuery") || "";

  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_URL
      }/api/post/allpost?searchQuery=${encodeURIComponent(searchQuery)}`
    )
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(console.error);
  }, [searchQuery]);

  useEffect(() => {
    posts.forEach((post) => {
      if (post.user && !usersInfo[post.user]) {
        fetchUserInfo(post.user);
      }
    });
  }, [posts, usersInfo]);

  const fetchUserInfo = async (userId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_URL}/api/auth/getuser/${userId}`,
        {
          method: "GET",
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();

      setUsersInfo((prev) => ({
        ...prev,
        [userId]: data,
      }));
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    allPost();
  }, []);

  const handleLike = async (id) => {
    if (likeLoading === id) return; // prevent double click while loading
    setLikeLoading(id);
    await pushLike(id);
    setLikeLoading(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost(id);
    }
  };

  const handleEditClick = (post) => {
    setEditMode(post._id);
    setEditTitle(post.title);
    setEditSub(post.sub);
  };

  const handleSave = (id) => {
    updatePost(id, editTitle, editSub);
    setEditMode(null);
  };

  const handleUpload = (postData) => {
    addPost(postData.title, postData.sub, postData.image);
  };

  return (
    <div className="home-feed container">
      <div className="my-3 text-end">
        <button className="btn btn-success" onClick={() => setShowModal(true)}>
          + Create New Post
        </button>
      </div>

      {[...posts]
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : 0;
          const dateB = b.date ? new Date(b.date) : 0;
          return dateB - dateA; // newest first
        })
        .map((x) => {
          const isLiked = userLikedPosts.has(x._id);
          const userInfo = usersInfo[x.user];

          const userImgSrc = userInfo?.image
            ? `${import.meta.env.VITE_URL}${userInfo.image}`
            : `https://placehold.co/50x50?text=No+Img`;

          return (
            <div className="post-card border rounded p-3 mb-4" key={x._id}>
              <div className="post-header d-flex align-items-center mb-2">
                <img
                  src={userImgSrc}
                  alt={userInfo?.name || "User"}
                  className="rounded-circle me-2 pfp"
                />
                <h5 className="mb-0">
                  <Link
                    to={`/userprofile/${x.user}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {x.name}
                  </Link>
                </h5>
              </div>

              <img
                src={
                  x.image?.[0]
                    ? `${import.meta.env.VITE_URL}/uploads/${x.image[0]}`
                    : `https://placehold.co/600x100?text=${x.title}`
                }
                alt={x.title}
                className="w-100 mb-3 rounded"
              />

              <div className="post-disc">
                {editMode === x._id ? (
                  <>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      className="form-control mb-2"
                      value={editSub}
                      onChange={(e) => setEditSub(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleSave(x._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditMode(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h4>{x.title}</h4>
                    <small className="text-muted">
                      {x.date
                        ? new Date(x.date).toLocaleString()
                        : "Unknown date"}
                    </small>
                    <p className="mt-2">{x.sub}</p>
                  </>
                )}
              </div>

              <div className="reaction d-flex align-items-center mt-2">
                <button
                  onClick={() => handleLike(x._id)}
                  disabled={likeLoading === x._id}
                  aria-label={isLiked ? "Unlike post" : "Like post"}
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    marginRight: "8px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {isLiked ? (
                    <FaHeart size={20} color="#dc3545" />
                  ) : (
                    <FaRegHeart size={20} color="#dc3545" />
                  )}
                </button>

                <p className="mb-0 me-3">{x.like || 0}</p>
              </div>

              <div className="post-actions mt-3">
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEditClick(x)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(x._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          );
        })}

      <UploadPostModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default Feed;
