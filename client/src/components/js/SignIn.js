import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "../css/SignIn.css";
import { UserContext } from "./context"; // Import the context
import axios from "axios";

function SignIn() {
  const { register, handleSubmit } = useForm(); // Correct useForm destructuring
  const { setUser } = useContext(UserContext); // Use the correct context value
  const navigate = useNavigate(); // For programmatic navigation
  const [invalid_password, setInvalid_password] = useState(0); // Correct useState destructuring

  async function handleLogin(userCredentials) {
    try {
      const response = await axios.post(
        "https://dotthoughts-backend.onrender.com/user-api/login",
        userCredentials
      );

      if (response.data.status === "failed") {
        setInvalid_password((prev) => prev + 1); // Increment invalid attempts
        alert(response.data.message); // Display error from server
      } else {
        
        try{
          const res = await axios.get(`https://dotthoughts-backend.onrender.com/user-api/user/${userCredentials.username}`);
          setUser(res.data.user);
          // Save token and user info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
          // console.log(res.data.user)
        }
        catch(err){
          console.log(err)
        }
        // setUser(response.data.user); // Update context state
        // console.log(response);
        
        // Navigate to the homepage or dashboard
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error", error);
      alert("Something went wrong. Please try again!");
    }
  }

  return (
    <div className="signin-container">
      <form onSubmit={handleSubmit(handleLogin)} className="signin-form">
        <h2>Welcome Back</h2>
        <p className="signin-subtitle">Sign in to continue</p>
        <div className="form-group">
          <label className="signin-label" htmlFor="username">
            Username
          </label>
          <input
            className="signin-input"
            type="text"
            id="username"
            {...register("username", { required: true })} // Validation rule
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label className="signin-label" htmlFor="password">
            Password
          </label>
          <input
            className="signin-input"
            type="password"
            id="password"
            {...register("password", { required: true })} // Validation rule
            placeholder="Enter your password"
          />
        </div>
        {invalid_password >= 2 && (
          <p className="signin-footer">
            Forgot your password?{" "}
            <span>
              <Link to="/reset-password">Reset Password</Link>
            </span>
          </p>
        )}
        <button className="signin-btn" type="submit">
          Sign In
        </button>
        <p className="signin-footer">
          Don't have an account?{" "}
          <span>
            <Link to="/signup">Sign Up</Link>
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
