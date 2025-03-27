import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/NavBar.css';
import { UserContext } from './context';

function NavBar() {
  const { user, setUser } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); 
  function handleLogout() {
    setUser(null);
    navigate("/home");
  }

  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <h1 onClick={() => { window.location.href = '/home'; }}>.THOUGHTS</h1>
      </div>

      {/* Full Menu for Larger Screens */}
      <ul className="nav-links">
        {user == null ? (
          <>
            <li><Link to="/signin" className="nav-link">Signin</Link></li>
            <li><Link to="/signup" className="nav-link">Signup</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/create-thought" className="nav-link">Drop Thought</Link></li>
            <li><Link to="/user-profile" className="nav-link">Profile</Link></li>
            <li><Link to="/home" className="nav-link" onClick={handleLogout}>Logout</Link></li>
            {/* <li><span className="nav-link" onClick={handleLogout}>Logout</span></li> */}
          </>
        )}
      </ul>

      {/* Three Dots Menu for Small Screens */}
      <div className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        &#x2026; {/* Three dots icon */}
      </div>
      {menuOpen && (
        <ul className="nav-dropdown">
          {user == null ? (
            <>
              <li><Link to="/signin" className="nav-link">Signin</Link></li>
              <li><Link to="/signup" className="nav-link">Signup</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/create-thought" className="nav-link">Drop Thought</Link></li>
              <li><Link to="/user-profile" className="nav-link">Profile</Link></li>
              <li><span className="nav-link" onClick={handleLogout}>Logout</span></li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}

export default NavBar;
