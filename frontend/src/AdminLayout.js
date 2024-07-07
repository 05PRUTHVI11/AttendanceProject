import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import './AdminLayout.css';

const AdminLayout = ({ userName, onLogout }) => {
  return (
    <div>
      <TopNavbar userName={userName} onLogout={onLogout} />
      <Sidebar />
      <div className="content-with-sidebar">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
