// src/Courses.js
import React, { useState, useEffect } from 'react';
import axios from './axios';
import './Courses.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { faTrash, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

const Courses = ({ authToken }) => {
  const [courses, setCourses] = useState([]);
  const [newCourses, setNewCourses] = useState([
    { code: '', title: '', credit: '' },
  ]);
  const [editCourse, setEditCourse] = useState(null);
  const [editCourseData, setEditCourseData] = useState({
    code: '',
    title: '',
    credit: '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/courses', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses(); // Call fetchCourses directly inside useEffect

    // Include authToken in the dependency array
  }, [authToken]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAddCourse = async () => {
    try {
      const parsedCoursesData = newCourses.map((course) => ({
        ...course,
        credit: parseInt(course.credit, 10),
      }));

      await axios.post('/courses', parsedCoursesData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setNewCourses([{ code: '', title: '', credit: '' }]);
      fetchCourses();
    } catch (error) {
      console.error('Error adding courses:', error);
    }
  };

  const handleDeleteCourse = async (code) => {
    try {
      await axios.delete(`/courses/${code}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleEditCourse = async (code) => {
    try {
      const parsedCourseData = {
        ...editCourseData,
        credit: parseInt(editCourseData.credit, 10),
      };
      await axios.put(`/courses/${code}`, parsedCourseData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setEditCourse(null);
      setEditCourseData({ code: '', title: '', credit: '' });
      fetchCourses();
    } catch (error) {
      console.error('Error editing course:', error);
    }
  };

  const handleNewCourseChange = (index, field, value) => {
    const updatedCourses = [...newCourses];
    updatedCourses[index][field] = value;
    setNewCourses(updatedCourses);
  };

  const handleAddNewCourseRow = () => {
    setNewCourses([...newCourses, { code: '', title: '', credit: '' }]);
  };

  return (
    <div className="containerCourse">
      <h2>Courses</h2>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Title</th>
            <th>Credit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.code}
              className={editCourse === course.code ? 'editing' : ''}
            >
              <td>
                {editCourse === course.code ? (
                  <input
                    type="text"
                    value={editCourseData.code}
                    onChange={(e) =>
                      setEditCourseData({
                        ...editCourseData,
                        code: e.target.value,
                      })
                    }
                  />
                ) : (
                  course.code
                )}
              </td>
              <td>
                {editCourse === course.code ? (
                  <input
                    type="text"
                    value={editCourseData.title}
                    onChange={(e) =>
                      setEditCourseData({
                        ...editCourseData,
                        title: e.target.value,
                      })
                    }
                  />
                ) : (
                  course.title
                )}
              </td>
              <td>
                {editCourse === course.code ? (
                  <input
                    type="text"
                    value={editCourseData.credit}
                    onChange={(e) =>
                      setEditCourseData({
                        ...editCourseData,
                        credit: e.target.value,
                      })
                    }
                  />
                ) : (
                  course.credit
                )}
              </td>
              <td>
                {editCourse === course.code ? (
                  <>
                    <button
                      className="custom-button save-button"
                      onClick={() => handleEditCourse(course.code)}
                    >
                      <FontAwesomeIcon className="iconPadding" icon={faCheck} />
                      Save
                    </button>
                    <button
                      className="custom-button cancel-button"
                      onClick={() => setEditCourse(null)}
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
                        setEditCourse(course.code);
                        setEditCourseData(course);
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
                      onClick={() => handleDeleteCourse(course.code)}
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
        <h3>Add New Courses</h3>
        {newCourses.map((course, index) => (
          <div key={index} className="new-course-inputs">
            <input
              type="text"
              placeholder="Code"
              value={course.code}
              onChange={(e) =>
                handleNewCourseChange(index, 'code', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Title"
              value={course.title}
              onChange={(e) =>
                handleNewCourseChange(index, 'title', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Credit"
              value={course.credit}
              onChange={(e) =>
                handleNewCourseChange(index, 'credit', e.target.value)
              }
            />
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

export default Courses;
