package models

type Session struct {
	ID   int    `json:"id"`
	Year string `json:"year"`
	Sem  string `json:"sem"`
}