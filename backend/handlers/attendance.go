package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"student_attendance_system/models"

	"github.com/gin-gonic/gin"
)

func AddAttendance(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// var inputs[] models.Attendance

		// if err := c.ShouldBindJSON(&input); err != nil {
		// 	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		// 	return
		// }
		// for _,input in range(inputs){
		// query := `INSERT INTO attendance (session_id, user_id, course_id, date, status) 
		// 		  VALUES (?, ?, ?, ?, ?) 
		// 		  ON DUPLICATE KEY UPDATE status = VALUES(status)`

		// _, err := db.Exec(query, input.SessionID, input.UserID, input.CourseID, input.Date, input.Status)
		// if err != nil {
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add or update attendance"})
		// 	return
		// }

		var inputs[] models.Attendance
		if err := c.ShouldBindJSON(&inputs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		tx, err := db.Begin()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
            return
        }

        for _, input := range inputs {
			query := `INSERT INTO attendance (session_id, user_id, course_id, date, status) 
				  VALUES (?, ?, ?, ?, ?) 
				  ON DUPLICATE KEY UPDATE status = VALUES(status)`
            _, err := tx.Exec(query, input.SessionID, input.UserID, input.CourseID, input.Date, input.Status)
            if err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add attendance"})
                return
            }
        }

        if err := tx.Commit(); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Attendance recorded successfully"})
	}	
}

func ViewAttendance(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.Query("session_id")
		courseID := c.Query("course_id")
		date := c.Query("date")

		if sessionID == "" || courseID == "" || date == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing query parameters"})
			return
		}
		if _, err := strconv.Atoi(courseID); err != nil {
			var id int
			err := db.QueryRow("SELECT id FROM courses WHERE title = ?", courseID).Scan(&id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query course ID"})
				return
			}
			courseID = strconv.Itoa(id)
		}

		query := `
			SELECT 
				users.id, 
				users.username, 
				COALESCE(attendance.status, '') AS status
			FROM 
				users
			JOIN 
				course_allotment ON users.id = course_allotment.user_id
			LEFT JOIN 
				(
					SELECT 
						user_id, 
						status
					FROM 
						attendance
					WHERE 
						date = ? AND course_id = ? AND session_id = ?
				) AS attendance ON users.id = attendance.user_id
			WHERE 
				course_allotment.course_id = ? AND course_allotment.session_id = ? AND users.role='student'`

		rows, err := db.Query(query, date, courseID, sessionID, courseID, sessionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query attendance"})
			return
		}
		defer rows.Close()

		var attendances []struct {
			ID       int    `json:"id"`
			Username string `json:"username"`
			Status   string `json:"status"`
		}

		for rows.Next() {
			var attendance struct {
				ID       int    `json:"id"`
				Username string `json:"username"`
				Status   string `json:"status"`
			}
			if err := rows.Scan(&attendance.ID, &attendance.Username, &attendance.Status); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan attendance"})
				return
			}
			attendances = append(attendances, attendance)
		}

		c.JSON(http.StatusOK, gin.H{"attendances": attendances})
	}
}

func ViewAttendancebyName(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.Query("session_id")
		courseID := c.Query("course_id")
		date := c.Query("date")
		username := c.Param("username")
        
		if sessionID == "" || courseID == "" || date == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing query parameters"})
			return
		}
		if _, err := strconv.Atoi(courseID); err != nil {
			var id int
			err := db.QueryRow("SELECT id FROM courses WHERE title = ?", courseID).Scan(&id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query course ID"})
				return
			}
			courseID = strconv.Itoa(id)
		}

		query := `
			SELECT 
				users.id, 
				users.username, 
				COALESCE(attendance.status, '') AS status
			FROM 
				users
			JOIN 
				course_allotment ON users.id = course_allotment.user_id
			LEFT JOIN 
				(
					SELECT 
						user_id, 
						status
					FROM 
						attendance
					WHERE 
						date = ? AND course_id = ? AND session_id = ?
				) AS attendance ON users.id = attendance.user_id
			WHERE 
				course_allotment.course_id = ? AND course_allotment.session_id = ? AND users.username=?`

		rows, err := db.Query(query, date, courseID, sessionID, courseID, sessionID,username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query attendance"})
			return
		}
		defer rows.Close()

		var attendances []struct {
			ID       int    `json:"id"`
			Username string `json:"username"`
			Status   string `json:"status"`
		}

		for rows.Next() {
			var attendance struct {
				ID       int    `json:"id"`
				Username string `json:"username"`
				Status   string `json:"status"`
			}
			if err := rows.Scan(&attendance.ID, &attendance.Username, &attendance.Status); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan attendance"})
				return
			}
			attendances = append(attendances, attendance)
		}

		c.JSON(http.StatusOK, gin.H{"attendances": attendances})
	}
}

func ViewAttendanceList(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.Query("session_id")
		courseID := c.Query("course_id")
		username := c.Param("username")
        
		if sessionID == "" || courseID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing query parameters"})
			return
		}
		if _, err := strconv.Atoi(courseID); err != nil {
			var id int
			err := db.QueryRow("SELECT id FROM courses WHERE title = ?", courseID).Scan(&id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query course ID"})
				return
			}
			courseID = strconv.Itoa(id)
		}

		query := `
			SELECT 
				users.id, 
				users.username, 
				attendance.date,
				COALESCE(attendance.status, '') AS status
			FROM 
				users
			JOIN 
				course_allotment ON users.id = course_allotment.user_id
			LEFT JOIN 
				(
					SELECT 
						user_id, 
						status,
						date
					FROM 
						attendance
					WHERE 
						 course_id = ? AND session_id = ?
				) AS attendance ON users.id = attendance.user_id
			WHERE 
				course_allotment.course_id = ? AND course_allotment.session_id = ? AND users.username=?`

		rows, err := db.Query(query, courseID, sessionID, courseID, sessionID,username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query attendance"})
			return
		}
		defer rows.Close()

		var attendances []struct {
			ID       int    `json:"id"`
			Username string `json:"username"`
			Date 	 string `json:"date"`
			Status   string `json:"status"`
		}

		for rows.Next() {
			var attendance struct {
				ID       int    `json:"id"`
				Username string `json:"username"`
				Date 	 string `json:"date"`
				Status   string `json:"status"`
			}
			if err := rows.Scan(&attendance.ID, &attendance.Username,&attendance.Date, &attendance.Status); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan attendance"})
				return
			}
			attendances = append(attendances, attendance)
		}

		c.JSON(http.StatusOK, gin.H{"attendances": attendances})
	}
}

func ViewStudentAttendanceList(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := c.Query("session_id")
		courseID := c.Query("course_id")
		role := c.Query("role")
	
		if sessionID == "" || courseID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing query parameters"})
			return
		}
		if _, err := strconv.Atoi(courseID); err != nil {
			var id int
			err := db.QueryRow("SELECT id FROM courses WHERE title = ?", courseID).Scan(&id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query course ID"})
				return
			}
			courseID = strconv.Itoa(id)
		}

		query := `
			SELECT 
				users.id, 
				users.username, 
				attendance.date,
				COALESCE(attendance.status, '') AS status
			FROM 
				users
			JOIN 
				course_allotment ON users.id = course_allotment.user_id
			LEFT JOIN 
				(
					SELECT 
						user_id, 
						status,
						date
					FROM 
						attendance
					WHERE 
						 course_id = ? AND session_id = ?
				) AS attendance ON users.id = attendance.user_id
			WHERE 
				course_allotment.course_id = ? AND course_allotment.session_id = ? AND users.role=?`

		rows, err := db.Query(query, courseID, sessionID, courseID, sessionID, role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query attendance"})
			return
		}
		defer rows.Close()

		var attendances[] models.AttendanceList

		for rows.Next() {
			var attendance models.AttendanceList
			if err := rows.Scan(&attendance.ID, &attendance.Username,&attendance.Date, &attendance.Status); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan attendance"})
				return
			}
			attendances = append(attendances, attendance)
		}

		c.JSON(http.StatusOK, gin.H{"attendances": attendances})
	}
}

func DeleteAttendance(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        date := c.Query("date")
		sessionID := c.Query("session_id")
		courseID := c.Query("course_id")
		println(date);
        _, err := db.Exec("DELETE FROM attendance WHERE date = ? and course_id =? and session_id=?", date,courseID,sessionID)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attendance"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "attendance deleted successfully"})
    }
}