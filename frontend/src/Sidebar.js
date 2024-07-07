import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <NavLink to="/home" activeclassname="active-link">
        Home
      </NavLink>
      <NavLink to="/courses" activeclassname="active-link">
        Courses
      </NavLink>
      <NavLink to="/sessions" activeclassname="active-link">
        Sessions
      </NavLink>
      <NavLink to="/attendance" activeclassname="active-link">
        Attendance
      </NavLink>
      <NavLink to="/courseAllotment" activeclassname="active-link">
        CourseAllotment
      </NavLink>
      <NavLink to="/user" activeclassname="active-link">
        User Management
      </NavLink>
    </div>
  );
};

export default Sidebar;
