import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate for redirect
import Logo from "../../assets/brand/logo.svg";
import titleWhite from "../../assets/brand/btitle-dark.png";

const NavBar = () => {
  const userId = localStorage.getItem("userId");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Navigate to a search results page with query param
    // Or just navigate to "/" with search param if home shows posts list
    if (searchTerm.trim()) {
      navigate(`/?searchQuery=${encodeURIComponent(searchTerm.trim())}`);
      // Optionally close offcanvas here if needed, depending on your setup
    }
  };

  return (
    <div className="p-3 ps-3 pe-3 d-flex justify-content-between align-items-center">
      <div>
        <img src={Logo} className="logo-img" alt="logo" />
        <img src={titleWhite} className="logo-title" alt="title" />
      </div>

      <div>
        {/* Button to open offcanvas */}
        <button
          className="btn btn-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasRight"
          aria-controls="offcanvasRight"
        >
          Menu
        </button>

        <div
          className="offcanvas offcanvas-end"
          tabIndex="-1"
          id="offcanvasRight"
          aria-labelledby="offcanvasRightLabel"
          style={{ zIndex: "99999" }}
        >
          <div className="offcanvas-header">
            <h5 id="offcanvasRightLabel">Menu</h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>

          <div className="offcanvas-body d-flex flex-column gap-3">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="d-flex mb-3">
              <input
                type="search"
                className="form-control me-2"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search posts"
              />
              <button className="btn btn-outline-primary" type="submit">
                Search
              </button>
            </form>

            <Link
              to="/signup"
              className="btn btn-outline-primary"
              data-bs-dismiss="offcanvas"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="btn btn-outline-secondary"
              data-bs-dismiss="offcanvas"
            >
              Log In
            </Link>
            <Link
              to={`/userprofile/${userId}`}
              className="btn btn-outline-success"
              data-bs-dismiss="offcanvas"
            >
              Profile
            </Link>
            <Link
              to={`/`}
              className="btn btn-outline-success"
              data-bs-dismiss="offcanvas"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
