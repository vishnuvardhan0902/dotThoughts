import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Home.css';
import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { UserContext } from "./context";
import HomePage from './HomePage';
function HomeBody() {
  const { user } = useContext(UserContext);
  if (user) {
    return <HomePage />;
  }
  return (
    <div className="container home-body-container">
      <div className="row justify-content-center align-items-center text-center">
        <div className="col-12 col-md-10 col-lg-8 newbie">
          <header className="header-section">
            <h1 className="header-title">Share Your Thoughts, Creativity, and Stories</h1>
            <p className="header-subtitle">
              Write blogs, share videos, connect with the community.
            </p>
            <Link to="/signin" className="cta-button">Drop your Thoughts</Link>
          </header>
        </div>
      </div>
    </div>
  );
}

export default HomeBody;
