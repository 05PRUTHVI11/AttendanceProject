import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Courses.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faTrash, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

const Users = ({ authToken }) => {
  const [users, setUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([
    { username: '', password: '', role: '' },
  ]);
  const [editUser, setEditUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    username: '',
    password: '',
    role: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/users', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [authToken]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post('http://localhost:8080/register', newUsers, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setNewUsers([{ username: '', password: '', role: '' }]);
      fetchUsers();
    } catch (error) {
      console.error('Error adding users:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/user`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { id },
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = async (id) => {
    try {
      const parsedUserData = {
        id: editUserData.id,
        username: editUserData.username,
        role: editUserData.role,
      };

      if (editUserData.password) {
        parsedUserData.password = editUserData.password;
      }

      await axios.put('http://localhost:8080/user', parsedUserData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setEditUser(null);
      setEditUserData({ id: '', username: '', role: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  const handleNewUsersChange = (index, field, value) => {
    const updatedUsers = [...newUsers];
    updatedUsers[index][field] = value;
    setNewUsers(updatedUsers);
  };

  const handleAddNewUsersRow = () => {
    setNewUsers([...newUsers, { username: '', password: '', role: '' }]);
  };

  return (
    <div className="containerCourse">
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editUser === user.id ? (
                    <input
                      type="text"
                      value={editUserData.username}
                      onChange={(e) =>
                        setEditUserData({
                          ...editUserData,
                          username: e.target.value,
                        })
                      }
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editUser === user.id ? (
                    <input
                      type="password"
                      value={editUserData.password}
                      onChange={(e) =>
                        setEditUserData({
                          ...editUserData,
                          password: e.target.value,
                        })
                      }
                    />
                  ) : (
                    '••••••••'
                  )}
                </td>
                <td>
                  {editUser === user.id ? (
                    <input
                      type="text"
                      value={editUserData.role}
                      onChange={(e) =>
                        setEditUserData({
                          ...editUserData,
                          role: e.target.value,
                        })
                      }
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editUser === user.id ? (
                    <>
                      <button
                        className="custom-button save-button"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <FontAwesomeIcon
                          className="iconPadding"
                          icon={faCheck}
                        />
                        Save
                      </button>
                      <button
                        className="custom-button cancel-button"
                        onClick={() => setEditUser(null)}
                      >
                        <FontAwesomeIcon
                          className="iconPadding"
                          icon={faXmark}
                        />{' '}
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="custom-button edit-button"
                        onClick={() => {
                          setEditUser(user.id);
                          setEditUserData(user);
                        }}
                      >
                        <FontAwesomeIcon
                          className="iconPadding"
                          icon={faPenToSquare}
                        />
                        Edit
                      </button>
                      <button
                        className="custom-button delete-button"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <FontAwesomeIcon
                          className="iconPadding"
                          icon={faTrash}
                        />
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <h3>Add New Users</h3>
        {newUsers.map((user, index) => (
          <div key={index} className="new-course-inputs">
            <input
              type="text"
              placeholder="Username"
              value={user.username}
              onChange={(e) =>
                handleNewUsersChange(index, 'username', e.target.value)
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) =>
                handleNewUsersChange(index, 'password', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Role"
              value={user.role}
              onChange={(e) =>
                handleNewUsersChange(index, 'role', e.target.value)
              }
            />
          </div>
        ))}
        <div className="addbutton">
          <button
            className="custom-button add-row-button"
            onClick={handleAddNewUsersRow}
          >
            Add Another User
          </button>
          <button
            className="custom-button submit-button"
            onClick={handleAddUser}
          >
            Submit Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;
