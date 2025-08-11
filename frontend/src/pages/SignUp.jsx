import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import b from "../assets/img/catup.jpg";
import b1 from "../assets/img/eepycat.jpg";
import b2 from "../assets/img/starecat.jpg";

const SignUp = () => {
  const navigate = useNavigate();

  const [uname, setUname] = useState("");
  const [umail, setUmail] = useState("");
  const [upass, setUpass] = useState("");
  const [cpass, setCpass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (uname.trim().length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }
    if (cpass !== upass) {
      alert("Passwords do not match");
      setCpass("");
      setUpass("");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/auth/createuser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: uname, email: umail, password: upass }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (data?.authToken) {
        localStorage.setItem("token", data.authToken);
        localStorage.setItem("userId", data.user?._id);
        navigate("/");
      } else {
        alert("Signup failed: " + (data?.error || "Unknown error"));
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
          <h6
            style={{
              fontSize: "80px",
              fontWeight: 700,
              textAlign: "center",
              padding: "40px 0",
              color: "#fff",
            }}
          >
            Sign Up
          </h6>
          <div className="userForm">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex justify-content-center">
                    <div className="bigI">
                      <img src={b} className="i i1 " alt="" />
                      <img src={b1} className="i i2" alt="" />
                      <img src={b2} className="i i3 " alt="" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h4>Username</h4>
                  <input
                    className="w-100"
                    type="text"
                    value={uname}
                    onChange={(e) => setUname(e.target.value)}
                    required
                  />
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
                    className="w-100"
                    type="password"
                    value={upass}
                    onChange={(e) => setUpass(e.target.value)}
                    required
                  />
                  <h4>Confirm password</h4>
                  <input
                    className="w-100"
                    type="password"
                    value={cpass}
                    onChange={(e) => setCpass(e.target.value)}
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

export default SignUp;
