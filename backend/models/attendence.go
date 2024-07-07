package models

type Attendance struct {
	ID        int    `json:"id"`
	SessionID int    `json:"session_id"`
	UserID    int    `json:"user_id"`
	CourseID  int    `json:"course_id"`
	Date      string `json:"date"`
	Status    string `json:"status"`
}

type AttendanceList struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Date     string `json:"date"`
	Status   string `json:"status"`
}