package handlers

import (
	"database/sql"
	"net/http"
	"student_attendance_system/models"

	"github.com/gin-gonic/gin"
)


func GetSessions(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
		var sessions []models.Session
        // Fetch attendance records for the user  
		query:=`SELECT id, year, term  FROM sessions`
        rows, err := db.Query(query)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
            return
        }
        defer rows.Close()

        for rows.Next() {
            var session models.Session
            if err := rows.Scan(&session.ID,&session.Year, &session.Sem); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan sessions"})
                return
            }
            sessions = append(sessions, session)
        }

        if err := rows.Err(); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process sessions"})
            return
        }

        c.JSON(http.StatusOK, sessions)
    }
}


func AddSessions(db *sql.DB ) gin.HandlerFunc{
	return func(c *gin.Context){
		
		var input [] models.Session
		if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
		tx, err := db.Begin()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
            return
        }

        for _, session := range input {
            _, err := tx.Exec("INSERT INTO sessions (id, year, term) VALUES (?, ?, ?)", session.ID, session.Year, session.Sem)
            if err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add session"})
                return
            }
        }

        if err := tx.Commit(); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "sessions added successfully"})

	}
	
}

func UpdateSessions(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input models.Session
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        id := c.Param("id")
        _, err := db.Exec("UPDATE sessions SET year = ?, term = ? WHERE id = ?",  input.Year, input.Sem, id)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update sessions"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Sessions updated successfully","data":input})
    }
}

func DeleteSessions(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        _, err := db.Exec("DELETE FROM sessions WHERE id = ?", id)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
    }
}







