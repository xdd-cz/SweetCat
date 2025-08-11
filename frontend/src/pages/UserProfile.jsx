import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSub, setEditSub] = useState("");
  const [likeLoading, setLikeLoading] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // Profile edit modal states
  const [showModal, setShowModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
  });

  const { id } = useParams();
  const loggedInUserId = localStorage.getItem("userId"); // Save this at login

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 60%)`;
  };

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
      setUser(data);
      setProfileForm({
        name: data.name || "",
        email: data.email || "",
        bio: data.bio || "",
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_URL}/api/post/userpost/${userId}`,
        {
          method: "GET",
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchUserInfo(id);
    fetchUserPosts(id);
  }, [id]);

  const getInitial = () =>
    user.name ? user.name.trim()[0].toUpperCase() : "?";
  const getColor = () => stringToColor(user.name || "User");

  // Profile update handler
  const handleProfileUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      formData.append("bio", profileForm.bio);
      if (profileForm.image instanceof File) {
        formData.append("image", profileForm.image);
      }

      const res = await fetch(
        `${import.meta.env.VITE_URL}/api/auth/updateuser/${id}`,
        {
          method: "POST",
          headers: {
            "auth-token": localStorage.getItem("token"),
            // Don't set Content-Type! Let browser set to multipart/form-data with boundary
          },
          body: formData,
        }
      );

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setShowModal(false);
        fetchUserInfo(id);
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Profile Header */}
      <div className="d-flex align-items-center mb-4">
        <div className="me-3">
          {user.image ? (
            <img
              src={`${import.meta.env.VITE_URL}${user.image}`} // user.image should be the path like '/uploads/profile/filename.jpg'
              alt={user.name}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="rounded-circle d-flex justify-content-center align-items-center"
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: getColor(),
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {getInitial()}
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-0">{user.name || "Not found"}</h4>
          <small className="text-muted">{user.bio}</small>
        </div>
        {loggedInUserId === id && (
          <button
            className="btn btn-sm btn-outline-primary ms-3"
            onClick={() => setShowModal(true)}
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>

      {/* User Posts */}
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((x) => (
          <div key={x._id} className="card p-3 mb-3">
            <img
              src={
                x.image?.[0]
                  ? `${import.meta.env.VITE_URL}/uploads/${x.image[0]}`
                  : `https://placehold.co/600x400?text=${x.title}`
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
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  marginRight: "8px",
                }}
              >
                {isLiked ? (
                  <FaHeart size={20} color="#dc3545" />
                ) : (
                  <FaRegHeart size={20} color="#dc3545" />
                )}
              </button>
              <p className="mb-0 me-3">{x.like || 0}</p>
              <button className="btn btn-outline-secondary me-2">
                <FaComment size={20} />
              </button>
              <p className="mb-0">{x.comments || 0}</p>
            </div>
            {loggedInUserId === id && (
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
            )}
          </div>
        ))
      )}

      {/* Edit Profile Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                />
                <input
                  type="email"
                  className="form-control mb-2"
                  placeholder="Email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Enter your bio "
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                />
                <label className="form-label">Upload Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, image: e.target.files[0] })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleProfileUpdate}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
