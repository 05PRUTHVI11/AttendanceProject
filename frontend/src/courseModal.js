import React, { useState, useEffect } from 'react';
import './CourseModal.css';

const CourseModal = ({
  authToken,
  fetchCourses,
  setIsEditing,
  currentCourse,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (currentCourse) {
      setName(currentCourse.name);
      setDescription(currentCourse.description);
    }
  }, [currentCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentCourse ? 'PUT' : 'POST';
    const endpoint = currentCourse
      ? `YOUR_BACKEND_ENDPOINT/courses/${currentCourse.id}`
      : 'YOUR_BACKEND_ENDPOINT/courses';

    await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ name, description }),
    });

    fetchCourses();
    setIsEditing(false);
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>{currentCourse ? 'Edit Course' : 'Add Course'}</h2>
        <label>
          Course Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <button type="submit">{currentCourse ? 'Update' : 'Add'}</button>
        <button type="button" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CourseModal;
