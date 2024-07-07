package models

type Course struct {
	ID      int    `json:"id"`
	Code    string `json:"code"`
	Title   string `json:"title"`
	Credit  int    `json:"credit"`
	Session string `json:"session"`
	Term    string `json:"term"`
}
type Courses struct {
	ID     int    `json:"id"`
	Code   string `json:"code" binding:"required"`
	Title  string `json:"title" binding:"required"`
	Credit int    `json:"credit" binding:"required"`
}