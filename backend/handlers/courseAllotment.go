package handlers

import (
	"database/sql"
	"net/http"
	"student_attendance_system/models"

	"github.com/gin-gonic/gin"
)
func GetAllotments(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var allotments []models.CourseAllotment

        rows, err := db.Query("SELECT course_id, session_id, user_id FROM course_allotment;")
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
            return
        }
        defer rows.Close()

        for rows.Next() {
            var allotment models.CourseAllotment
            if err := rows.Scan( &allotment.CourseID, &allotment.SessionID, &allotment.UserID); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan allotments"})
                return
            }
            allotments = append(allotments, allotment)
        }

        if err := rows.Err(); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process allotments"})
            return
        }

        c.JSON(http.StatusOK, allotments)
    }
}

func GetCourseAllotment(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
		var sessions []models.GetAllCourseAllotment
        // Fetch attendance records for the user  
		//role:=c.Query("role")
		query:=`SELECT
                ca.id, 
				users.id, 
				users.username,
                c.title,
                s.year,
                s.term
				from users
				join course_allotment as ca
				on users.id=ca.user_id
				join courses as c
				on ca.course_id=c.id
				join sessions as s
				on ca.session_id=s.id
				`
        rows, err := db.Query(query)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
            return
        }
        defer rows.Close()

        for rows.Next() {
            var session models.GetAllCourseAllotment
            if err := rows.Scan(&session.Id,&session.UserID,&session.Username,&session.Title,&session.Year, &session.Sem); err != nil {
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


func AddCourseAllotment(db *sql.DB ) gin.HandlerFunc{
	return func(c *gin.Context){
		
		var input [] models.CourseAllotment
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
            _, err := tx.Exec("INSERT INTO course_allotment (user_id, course_id, session_id) VALUES (?, ?, ?)", session.UserID, session.CourseID, session.SessionID)
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

func UpdateCourseAllotment(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input models.CourseAllotment
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        id := c.Param("id")
        _, err := db.Exec("UPDATE course_allotment SET  session_id=?, course_id = ?  WHERE id = ?", input.SessionID, input.CourseID, id)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update course allotment"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "CourseAllotment updated successfully","data":input})
    }
}

func DeleteCourseAllotment(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        _, err := db.Exec("DELETE FROM course_allotment WHERE id = ?", id)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course allotment"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
    }
}







