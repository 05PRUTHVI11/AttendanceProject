package models

type CourseAllotment struct {
	UserID    int `json:"user_id"`
	CourseID  int `json:"course_id"`
	SessionID int `json:"session_id"`
}

type GetAllCourseAllotment struct {
	Id       int    `json:"id"`
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Title    string `json:"title"`
	Year     string `json:"year"`
	Sem      string `json:"sem"`
}
