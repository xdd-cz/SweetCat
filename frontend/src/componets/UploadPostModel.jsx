import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const UploadPostModal = ({ show, onClose, onUpload }) => {
    const [title, setTitle] = useState("");
    const [sub, setSub] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (file) => {
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = () => {
        if (!title || !sub || !image) {
            alert("Please fill all fields and select an image");
            return;
        }
        onUpload({ title, sub, image });
        setTitle("");
        setSub("");
        setImage(null);
        setPreview(null);
        onClose();
    };

    return (
        <div
            className={`modal fade ${show ? "show d-block" : ""}`}
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header">
                        <h5 className="modal-title">Upload New Post</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <div className="row">
                            {/* Left Column */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Subtext</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={sub}
                                        onChange={(e) => setSub(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Upload Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleFileChange(e.target.files[0])
                                        }
                                    />
                                </div>
                            </div>

                            {/* Right Column - Preview */}
                            <div className="col-md-6">
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    className="border border-secondary rounded d-flex justify-content-center align-items-center"
                                    style={{
                                        height: "250px",
                                        backgroundColor: "#f8f9fa",
                                        cursor: "pointer",
                                    }}
                                >
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{ maxHeight: "100%", maxWidth: "100%" }}
                                        />
                                    ) : (
                                        <span className="text-muted">
                                            Drag & Drop Image Here
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            Upload Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPostModal;
