import React, { useState, useEffect, useCallback } from 'react';
import axios from './axios';
import './viewAllotment.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faTrash, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

const ViewAllotments = ({ authToken }) => {
  const [allotments, setAllotments] = useState([]);
  const [editAllotment, setEditAllotment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newCourses, setNewCourses] = useState([
    { user_id: '', course_id: '', session_id: '' },
  ]);

  const fetchAllotments = useCallback(async () => {
    try {
      const response = await axios.get('/courseAllotment', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data || [];
      setAllotments(data);
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  }, [authToken]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllotments();

      try {
        const sessionsResponse = await axios.get('/sessions', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setSessions(sessionsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch sessions', err);
      }

      try {
        const coursesResponse = await axios.get('/courses', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCourses(coursesResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      }

      try {
        const usersResponse = await axios.get('/users', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUsers(usersResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    fetchData();
  }, [authToken, fetchAllotments]);

  const handleDeleteAllotment = async (id) => {
    try {
      await axios.delete(`/courseAllotment/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await fetchAllotments(); // Ensure fetchAllotments is awaited after delete
    } catch (error) {
      console.error('Error deleting allotment:', error);
    }
  };

  const handleEditAllotment = async (allotment) => {
    try {
      const allotmentData = {
        session_id:
          parseInt(selectedSessionId) ||
          sessions.find(
            (session) =>
              session.year === allotment.year && session.sem === allotment.sem
          )?.id,
        user_id: parseInt(selectedUserId) || allotment.user_id,
        course_id:
          parseInt(selectedCourseId) ||
          courses.find((course) => course.title === allotment.title)?.id,
      };

      await axios.put(`/courseAllotment/${allotment.id}`, allotmentData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setEditAllotment(null);
      await fetchAllotments(); // Ensure fetchAllotments is awaited after edit
    } catch (error) {
      console.error('Error editing allotment:', error);
    }
  };

  const handleNewCourseChange = (index, field, value) => {
    const updatedCourses = [...newCourses];
    updatedCourses[index][field] = value;
    setNewCourses(updatedCourses);
  };

  const handleAddNewCourseRow = () => {
    setNewCourses([
      ...newCourses,
      { user_id: '', course_id: '', session_id: '' },
    ]);
  };

  const startEditing = (allotment) => {
    setEditAllotment(allotment);
    setSelectedSessionId(
      sessions.find(
        (session) =>
          session.year === allotment.year && session.sem === allotment.sem
      )?.id || ''
    );
    setSelectedCourseId(
      courses.find((course) => course.title === allotment.title)?.id || ''
    );
    setSelectedUserId(allotment.user_id);
  };

  const handleAddCourse = async () => {
    try {
      const parsedCoursesData = newCourses.map((course) => ({
        ...course,
        user_id: parseInt(course.user_id, 10),
        session_id: parseInt(course.session_id, 10),
        course_id: parseInt(course.course_id, 10),
      }));

      await axios.post('/courseAllotment', parsedCoursesData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setNewCourses([{ user_id: '', course_id: '', session_id: '' }]);
      await fetchAllotments(); // Ensure fetchAllotments is awaited after adding new courses
    } catch (error) {
      console.error('Error adding courses:', error);
    }
  };

  return (
    <div className="containerCourse">
      <h2>View Allotments</h2>
      <table>
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Session</th>
            <th>User Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allotments.map((allotment) => (
            <tr key={allotment.id}>
              <td>
                {editAllotment?.id === allotment.id ? (
                  <select
                    value={selectedCourseId} // Use value instead of selected
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  allotment.title
                )}
              </td>
              <td>
                {editAllotment?.id === allotment.id ? (
                  <select
                    value={selectedSessionId} // Use value instead of selected
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                  >
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.year} - {session.sem}
                      </option>
                    ))}
                  </select>
                ) : (
                  allotment.year + '-' + allotment.sem
                )}
              </td>
              <td>
                {editAllotment?.id === allotment.id ? (
                  <select
                    value={selectedUserId} // Use value instead of selected
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                ) : (
                  allotment.username
                )}
              </td>
              <td>
                {editAllotment?.id === allotment.id ? (
                  <>
                    <button
                      className="custom-button save-button"
                      onClick={() => handleEditAllotment(allotment)}
                    >
                      <FontAwesomeIcon className="iconPadding" icon={faCheck} />
                      Save
                    </button>
                    <button
                      className="custom-button cancel-button"
                      onClick={() => setEditAllotment(null)}
                    >
                      <FontAwesomeIcon className="iconPadding" icon={faXmark} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="custom-button edit-button"
                      onClick={() => startEditing(allotment)}
                    >
                      <FontAwesomeIcon
                        className="iconPadding"
                        icon={faPenToSquare}
                      />
                      Edit
                    </button>
                    <button
                      className="custom-button delete-button"
                      onClick={() => handleDeleteAllotment(allotment.id)}
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
        <h3>Add New Course Allotment</h3>
        {newCourses.map((course, index) => (
          <div key={index} className="new">
            <label>User:</label>
            <select
              className="select"
              value={course.user_id}
              onChange={(e) =>
                handleNewCourseChange(index, 'user_id', e.target.value)
              }
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <label>Course:</label>
            <select
              className="select"
              value={course.course_id}
              onChange={(e) =>
                handleNewCourseChange(index, 'course_id', e.target.value)
              }
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <label>Session:</label>
            <select
              className="select"
              value={course.session_id}
              onChange={(e) =>
                handleNewCourseChange(index, 'session_id', e.target.value)
              }
            >
              <option value="">Select Session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.year} - {session.sem}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="addbutton">
          <button
            className="custom-button add-row-button"
            onClick={handleAddNewCourseRow}
          >
            Add Another Course
          </button>
          <button
            className="custom-button submit-button"
            onClick={handleAddCourse}
          >
            Submit Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAllotments;
