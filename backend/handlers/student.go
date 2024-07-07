package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"student_attendance_system/models"

	"github.com/gin-gonic/gin"
)

// GetAttendance retrieves the attendance records for the authenticated student
func GetAttendance(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get username from context
        username := c.GetString("username")
        if username == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Username not provided"})
            return
        }

        // Fetch user ID based on username
        var user models.User
        err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&user.ID)
        if err != nil {
            if err == sql.ErrNoRows {
                c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            } else {
                log.Printf("Error fetching user: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
            }
            return
        }

        // Fetch attendance records for the user
        rows, err := db.Query("SELECT id, student_id, date, status FROM attendance WHERE student_id = ?", user.ID)
        if err != nil {
            log.Printf("Error querying attendance: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attendance"})
            return
        }
        defer rows.Close()

        var attendances []models.Attendance
        for rows.Next() {
            var attendance models.Attendance
            if err := rows.Scan(&attendance.ID, &attendance.UserID, &attendance.Date, &attendance.Status); err != nil {
                log.Printf("Error scanning attendance row: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan attendance"})
                return
            }
            attendances = append(attendances, attendance)
        }

        // Check for errors after iterating through rows
        if err = rows.Err(); err != nil {
            log.Printf("Error iterating attendance rows: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to iterate attendance rows"})
            return
        }

        // Return the attendance records
        c.JSON(http.StatusOK, gin.H{"attendances": attendances})
    }
}

