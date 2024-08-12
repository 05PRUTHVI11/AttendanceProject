import React, { useState, useEffect } from 'react';
import axios from './axios';
import './Courses.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faTrash, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

//test
const Sessions = ({ authToken }) => {
  const [sessions, setSessions] = useState([]);
  const [newSessions, setNewSessions] = useState([{ year: '', sem: '' }]);
  const [editSession, setEditSession] = useState(null);
  const [editSessionData, setEditSessionData] = useState({
    year: '',
    sem: '',
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('/sessions', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };
    fetchSessions();
  }, [authToken]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/sessions', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAddSession = async () => {
    try {
      await axios.post('/sessions', newSessions, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setNewSessions([{ year: '', sem: '' }]);
      fetchSessions();
    } catch (error) {
      console.error('Error adding sessions:', error);
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await axios.delete(`/sessions/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleEditSession = async (id) => {
    try {
      await axios.put(`/sessions/${id}`, editSessionData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setEditSession(null);
      setEditSessionData({ year: '', sem: '' });
      fetchSessions();
    } catch (error) {
      console.error('Error editing session:', error);
    }
  };

  const handleNewSessionChange = (index, field, value) => {
    const updatedSessions = [...newSessions];
    updatedSessions[index][field] = value;
    setNewSessions(updatedSessions);
  };

  const handleAddNewSessionRow = () => {
    setNewSessions([...newSessions, { year: '', sem: '' }]);
  };

  return (
    <div className="containerCourse">
      <h2>Sessions</h2>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Sem</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>
                {editSession === session.id ? (
                  <input
                    type="text"
                    value={editSessionData.year}
                    onChange={(e) =>
                      setEditSessionData({
                        ...editSessionData,
                        year: e.target.value,
                      })
                    }
                  />
                ) : (
                  session.year
                )}
              </td>
              <td>
                {editSession === session.id ? (
                  <input
                    type="text"
                    value={editSessionData.sem}
                    onChange={(e) =>
                      setEditSessionData({
                        ...editSessionData,
                        sem: e.target.value,
                      })
                    }
                  />
                ) : (
                  session.sem
                )}
              </td>
              <td>
                {editSession === session.id ? (
                  <>
                    <button
                      className="custom-button save-button"
                      onClick={() => handleEditSession(session.id)}
                    >
                      <FontAwesomeIcon className="iconPadding" icon={faCheck} />
                      Save
                    </button>
                    <button
                      className="custom-button cancel-button"
                      onClick={() => handleEditSession(session.id)}
                    >
                      <FontAwesomeIcon className="iconPadding" icon={faXmark} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="custom-button edit-button"
                      onClick={() => {
                        setEditSession(session.id);
                        setEditSessionData(session);
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
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <FontAwesomeIcon className="iconPadding" icon={faTrash} />
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3>Add New Sessions</h3>
        {newSessions.map((session, index) => (
          <div key={index} className="new-course-inputs">
            <input
              type="text"
              placeholder="Year"
              value={session.year}
              onChange={(e) =>
                handleNewSessionChange(index, 'year', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Sem"
              value={session.sem}
              onChange={(e) =>
                handleNewSessionChange(index, 'sem', e.target.value)
              }
            />
          </div>
        ))}
        <div className="addbutton">
          <button
            className="custom-button add-row-button"
            onClick={handleAddNewSessionRow}
          >
            Add Another Session
          </button>
          <button
            className="custom-button submit-button"
            onClick={handleAddSession}
          >
            Submit Sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
