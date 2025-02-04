import React, { useState } from 'react';
import '../css/SignUp.css';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignUp() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [likedThoughtsId] = useState([]);

  async function handleSignUp(userCredentials) {
    try {
      // Add likedThoughtsId to the user credentials
      const userData = { ...userCredentials, likedThoughtsId };
      console.log(userData);
      
      const response = await axios.post(
        'http://localhost:4000/user-api/signup',
        userData
      );

      if (response.data.status === 'success') {
        alert('Account created successfully!');
        navigate('/signin');
      } else {
        alert(response.data.message || 'Something went wrong, please try again!');
      }
    } catch (err) {
      console.error('Error during sign-up:', err);
      alert('An error occurred while creating your account. Please try again.');
    }
  }

  return (
    <div className="signUp-container">
      <form onSubmit={handleSubmit(handleSignUp)} className="signUp-form">
        <h2>Create an account</h2>

        <div className="form-group">
          <label htmlFor="name" className="signUp-label">Name</label>
          <input
            type="text"
            className="signUp-input"
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter your name"
            aria-label="Enter your name"
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="gender" className="signUp-label">Gender</label>
          <select
            className="signUp-input"
            id="gender"
            {...register('gender', { required: 'Gender is required' })}
            aria-label="Select your gender"
            defaultValue=""
          >
            <option value="" disabled>Select your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="error-text">{errors.gender.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="dob" className="signUp-label">Date of Birth</label>
          <input
            type="date"
            className="signUp-input"
            id="dob"
            {...register('dob', { required: 'Date of Birth is required' })}
            aria-label="Enter your date of birth"
          />
          {errors.dob && <p className="error-text">{errors.dob.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="signUp-label">Email</label>
          <input
            type="email"
            className="signUp-input"
            id="email"
            {...register('email', { required: 'Email is required' })}
            placeholder="Enter your email"
            aria-label="Enter your email"
          />
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="username" className="signUp-label">Username</label>
          <input
            type="text"
            className="signUp-input"
            id="username"
            {...register('username', { required: 'Username is required' })}
            placeholder="Enter your username"
            aria-label="Enter your username"
          />
          {errors.username && <p className="error-text">{errors.username.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="signUp-label">Password</label>
          <input
            type="password"
            className="signUp-input"
            id="password"
            {...register('password', { required: 'Password is required' })}
            placeholder="Enter your password"
            aria-label="Enter your password"
          />
          {errors.password && <p className="error-text">{errors.password.message}</p>}
        </div>

        <button className="signUp-btn" type="submit">Sign Up</button>

        <p className="signin-footer">
          Already have an account?{' '}
          <span>
            <Link to="/signin">Sign in</Link>
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
