import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const Layout = ({ authToken, userRole, userName, handleLogout, children }) => {
  const location = useLocation();
  const showSidebar =
    authToken && userRole === 'admin' && location.pathname !== '/login';
  const showTopNavbar = authToken && location.pathname !== '/login';

  return (
    <div>
      {showTopNavbar && (
        <>
          <TopNavbar userName={userName} onLogout={handleLogout} />
        </>
      )}
      {showSidebar && (
        <>
          {/* <TopNavbar userName={userName} onLogout={handleLogout} /> */}
          <Sidebar />
        </>
      )}

      <div className={showSidebar ? 'content-with-sidebar' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
