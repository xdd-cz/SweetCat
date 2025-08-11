import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import b from '../assets/img/catup.jpg';
import b1 from '../assets/img/eepycat.jpg';
import b2 from '../assets/img/starecat.jpg';

const Login = () => {
  const navigate = useNavigate();

  const [umail, setUmail] = useState("");
  const [upass, setUpass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!umail.trim()) {
      alert("Email is required");
      return;
    }
    if (!upass) {
      alert("Password is required");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: umail, password: upass }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (data?.authToken) {
        localStorage.setItem("token", data.authToken);
        localStorage.setItem("userId", data.user?._id);
        navigate("/");
      } else {
        alert("Login failed: " + (data?.error || "Unknown error"));
      }
    } catch (error) {
      console.log("Error:", error.message);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="UserForm">
      <div className="container">
        <div className="box">
          <h6 className="title">Login</h6>
          <div className="userForm">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex justify-content-center">
                    <div className="bigI" style={{top:"-120px", position:"relative"}}>
                      <img src={b} className="i i1 " alt="" />
                      <img src={b1} className="i i2" alt="" />
                      <img src={b2} className="i i3 " alt="" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h4>Email</h4>
                  <input
                    className="w-100"
                    type="email"
                    value={umail}
                    onChange={(e) => setUmail(e.target.value)}
                    required
                  />
                  <h4>Password</h4>
                  <input
                    className="w-100 mb-1"
                    type="password"
                    value={upass}
                    onChange={(e) => setUpass(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center mb-2">
                <button type="submit" className="p">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
