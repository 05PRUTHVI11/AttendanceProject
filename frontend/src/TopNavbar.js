import React from 'react';
import './TopNavbar.css';

const TopNavbar = ({ userName, onLogout }) => {
  return (
    <div className="top-navbar">
      <div className="site-title">{userName} Dashboard</div>
      <div className="user-info">
        <span>Welcome, {userName}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default TopNavbar;
