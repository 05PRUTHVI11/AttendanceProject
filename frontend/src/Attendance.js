import React, { useState, useEffect } from 'react';
import axios from './axios'; // Ensure you import the configured axios instance
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Attendance.css';

function Attendance({ authToken, userRole, userName }) {
  const [date, setDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredDate, setFilteredDate] = useState(null);
  const [nameFilter, setNameFilter] = useState('');
  const [slCounter] = useState(1);

  useEffect(() => {
    // Fetch sessions and courses with Authorization header
    axios
      .get('/sessions', { headers: { Authorization: `Bearer ${authToken}` } })
      .then((res) => setSessions(res.data || []))
      .catch((err) => console.error('Failed to fetch sessions', err));

    axios
      .get('/courses', { headers: { Authorization: `Bearer ${authToken}` } })
      .then((res) => setCourses(res.data || []))
      .catch((err) => console.error('Failed to fetch courses', err));
  }, [authToken]);

  // Refresh the calendar when session or course changes
  useEffect(() => {
    setDate(new Date());
  }, [selectedSession, selectedCourse]);

  const fetchAttendance = () => {
    if (userRole === 'teacher' || userRole === 'admin') {
      axios
        .get('/view-attendance', {
          params: {
            session_id: parseInt(selectedSession),
            course_id: parseInt(selectedCourse),
            date: date.toISOString().split('T')[0],
          },
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((res) => {
          if (res.data.attendances && res.data.attendances.length > 0) {
            setAttendance(res.data.attendances);
            setMessage('');
          } else {
            setAttendance([]);
            setMessage('Attendance for this date is not found');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch attendance', err);
          setAttendance([]);
          setMessage('Failed to fetch attendance');
        });
    } else {
      const url = `/viewAttendanceList/${userName}`;
      axios
        .get(url, {
          params: {
            session_id: parseInt(selectedSession),
            course_id: parseInt(selectedCourse),
          },
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((res) => {
          if (res.data.attendances && res.data.attendances.length > 0) {
            setAttendance(res.data.attendances);
            setMessage('');
          } else {
            setAttendance([]);
            setMessage('Attendance for this date is not found');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch attendance', err);
          setAttendance([]);
          setMessage('Failed to fetch attendance');
        });
    }
  };

  const handleStatusChange = (userId, status) => {
    setAttendance((prev) =>
      prev.map((att) => (att.id === userId ? { ...att, status } : att))
    );
  };

  const handleSubmit = () => {
    // Create an array of attendance data
    const attendanceDataArray = attendance.map((att) => ({
      session_id: parseInt(selectedSession),
      user_id: att.id,
      course_id: parseInt(selectedCourse),
      date: date.toISOString().split('T')[0],
      status: att.status,
    }));

    // Send a single POST request with the array of attendance data
    axios
      .post('/add-attendance', attendanceDataArray, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => alert('All attendance records updated successfully'))
      .catch((err) => console.error('Failed to update attendance', err));
  };

  const handleDelete = () => {
    axios
      .delete('/deleteStudentAttendanceList', {
        params: {
          session_id: parseInt(selectedSession),
          course_id: parseInt(selectedCourse),
          date: date.toISOString().split('T')[0],
        },
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => {
        alert('All attendance records deleted successfully');
        fetchAttendance(); // Call fetchAttendance here to update the displayed data
      })
      .catch((err) => console.error('Failed to delete attendance', err));
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  function handlePrevClick() {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  }

  function handleNextClick() {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  }

  const renderTeacherFiltersSelect = () => (
    <div>
      <div className="filters-teacher">
        <div>
          <label>Select Session: </label>
          <select onChange={(e) => setSelectedSession(e.target.value)}>
            <option value="">Select Session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.year} - {session.sem}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select Course: </label>
          <select onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="arrow-container">
        <button className="arrow left" onClick={handlePrevClick}>
          &#8592;
        </button>

        <label>Select Date: </label>
        <DatePicker selected={date} onChange={(d) => setDate(d)} />
        <button className="arrow right" onClick={handleNextClick}>
          &#8594;
        </button>
      </div>
    </div>
  );
  const renderStudentFiltersSelect = () => (
    <div className="filters">
      <div>
        <label>Select Session: </label>
        <select onChange={(e) => setSelectedSession(e.target.value)}>
          <option value="">Select Session</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.year} - {session.sem}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Select Course: </label>
        <select onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStudentTable = () => (
    <div className="table-container">
      {attendance.length > 0 && (
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Date</th>
              <th>Day</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance
              .filter(
                (att) =>
                  !filteredDate ||
                  new Date(att.date).toDateString() ===
                    filteredDate.toDateString()
              )
              .filter((att) => !statusFilter || att.status === statusFilter)
              .map((att, index) => (
                <tr
                  key={att.id}
                  className={att.status === 'present' ? 'present' : 'absent'}
                >
                  <td>{slCounter + index}</td>
                  <td>{att.date}</td>
                  <td>{getDayName(att.date)}</td>
                  <td
                    className={
                      att.status === 'present' ? 'present1' : 'absent1'
                    }
                  >
                    {att.status}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderTeacherTable = () => (
    <div className="table-container">
      {attendance.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance
              .filter(
                (att) =>
                  !filteredDate ||
                  new Date(att.date).toDateString() ===
                    filteredDate.toDateString()
              )
              .filter((att) => !statusFilter || att.status === statusFilter)
              .filter(
                (att) =>
                  !nameFilter ||
                  att.username.toLowerCase().includes(nameFilter.toLowerCase())
              )
              .map((att, index) => (
                <tr
                  key={att.id}
                  className={att.status === 'present' ? 'present' : 'absent'}
                >
                  <td>{slCounter + index}</td>
                  <td>{att.username}</td>
                  <td>
                    <div className="status-buttons">
                      <button
                        onClick={() => handleStatusChange(att.id, 'present')}
                        style={{
                          backgroundColor:
                            att.status === 'present' ? 'green' : 'initial',
                          color: att.status === 'present' ? 'white' : 'initial',
                        }}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleStatusChange(att.id, 'absent')}
                        style={{
                          backgroundColor:
                            att.status === 'absent' ? 'red' : 'initial',
                          color: att.status === 'absent' ? 'white' : 'initial',
                        }}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderTeacherFilters = () => (
    <>
      <div className="filters1">
        <div>
          <label>Filter by Status: </label>
          <select onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <div>
          <label>Filter by Name: </label>
          <input type="text" onChange={(e) => setNameFilter(e.target.value)} />
        </div>
      </div>
      <button onClick={fetchAttendance}>Fetch Attendance</button>
    </>
  );

  const renderStudentFilters = () => (
    <>
      <div className="filters">
        <div>
          <label>Filter by Date: </label>
          <DatePicker
            selected={filteredDate}
            onChange={(d) => setFilteredDate(d)}
          />
        </div>
        <div>
          <label>Filter by Status: </label>
          <select onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>
      <button onClick={fetchAttendance}>Fetch Attendance</button>
    </>
  );
  return (
    <div className="container">
      {userRole === 'admin' ? (
        <div className="navbar">
          <h2>Attendance</h2>
        </div>
      ) : (
        <div className="navbarstudent">
          <h2>Attendance</h2>
        </div>
      )}
      {userRole === 'student'
        ? renderStudentFiltersSelect()
        : renderTeacherFiltersSelect()}
      {userRole === 'student' ? renderStudentFilters() : renderTeacherFilters()}
      {message && <p>{message}</p>}
      {userRole === 'student' ? renderStudentTable() : renderTeacherTable()}
      {attendance.length > 0 &&
        (userRole === 'teacher' || userRole === 'admin') && (
          <button onClick={handleSubmit}>Submit Attendance</button>
        )}
      <div>
        {attendance.length > 0 && userRole === 'admin' && (
          <button onClick={handleDelete}>Delete Attendance</button>
        )}
      </div>
    </div>
  );
}

export default Attendance;
