// App.js
import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './Login';
import Attendance from './Attendance';
import Courses from './Courses';
import Sessions from './Sessions';
import Home from './Home';
import Users from './Users';
import ViewAllotments from './viewAllotment';
import Layout from './Layout';
import './App.css';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [userName, setUserName] = useState(localStorage.getItem('usernames'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('usernames');
    setAuthToken(null);
    setUserRole(null);
    setUserName(null);
  };

  return (
    <Router>
      <Layout
        authToken={authToken}
        userRole={userRole}
        userName={userName}
        handleLogout={handleLogout}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                setAuthToken={setAuthToken}
                setUserRole={setUserRole}
                setUserName={setUserName}
              />
            }
          />
          <Route
            path="/home"
            element={
              authToken && userRole === 'admin' ? (
                <Home userName={userName} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/courses"
            element={
              authToken && userRole === 'admin' ? (
                <Courses authToken={authToken} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/sessions"
            element={
              authToken && userRole === 'admin' ? (
                <Sessions authToken={authToken} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/courseAllotment"
            element={
              authToken && userRole === 'admin' ? (
                <ViewAllotments authToken={authToken} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/user"
            element={
              authToken && userRole === 'admin' ? (
                <Users authToken={authToken} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/attendance"
            element={
              authToken ? (
                <Attendance
                  authToken={authToken}
                  userRole={userRole}
                  userName={userName}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
