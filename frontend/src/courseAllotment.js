import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Courses.css';

const CourseAllotment = ({ authToken }) => {
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
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/courses', {
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

      await axios.post('http://localhost:8080/courses', parsedCoursesData, {
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
      await axios.delete(`http://localhost:8080/courses/${code}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  // const handleEditCourse = async (code) => {
  //   try {
  //     await axios.put(`http://localhost:8080/courses/${code}`, editCourseData, {
  //       headers: { Authorization: `Bearer ${authToken}` },
  //     });
  //     setEditCourse(null);
  //     setEditCourseData({ code: '', title: '', credit: '' });
  //     fetchCourses();
  //   } catch (error) {
  //     console.error('Error editing course:', error);
  //   }
  // };
  const handleEditCourse = async (code) => {
    try {
      const parsedCourseData = {
        ...editCourseData,
        credit: parseInt(editCourseData.credit, 10),
      };
      await axios.put(
        `http://localhost:8080/courses/${code}`,
        parsedCourseData,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
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
      <h2>Course Allotment</h2>
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
            <tr key={course.code}>
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
                    <button onClick={() => handleEditCourse(course.code)}>
                      Save
                    </button>
                    <button onClick={() => setEditCourse(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditCourse(course.code);
                        setEditCourseData(course);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteCourse(course.code)}>
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
          <div key={index}>
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
        <button onClick={handleAddNewCourseRow}>Add Another Course</button>
        <button onClick={handleAddCourse}>Submit Courses</button>
      </div>
    </div>
  );
};

export default CourseAllotment;
