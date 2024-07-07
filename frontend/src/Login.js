import React, { useState } from 'react';
import axios from './axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
function Login({ setAuthToken, setUserRole, setUserName }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { username, password });
      setAuthToken(response.data.token);
      localStorage.setItem('token', response.data.token);

      // Fetch user details to get the role
      const userResponse = await axios.get('/user', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      const userRole = userResponse.data.role;
      setUserRole(userRole);
      localStorage.setItem('role', userRole);

      const userName = userResponse.data.username;
      console.log(userName);
      setUserName(userName);
      localStorage.setItem('username', userName);

      if (userRole === 'admin') {
        navigate('/home');
      } else {
        navigate('/attendance');
      }
    } catch (err) {
      // navigate('/attendance');
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h3> Attendance Portal</h3>
        <div className="form-group">
          <label>User Name</label>
          <input
            type="text"
            className="form-controll"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          LOGIN
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
