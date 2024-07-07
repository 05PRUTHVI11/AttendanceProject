package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"student_attendance_system/models"

	"github.com/gin-gonic/gin"
)

func GetCourses(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get username from context
        username := c.GetString("username")
        if username == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Username not provided"})
            return
        }
		
        // Fetch user ID based on username
        if username != "admin" {
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
            var courses []models.Course
            // Fetch attendance records for the user  
            query:=`SELECT c.id, c.code, c.title, c.credit, s.year, s.term
            FROM courses c
            JOIN course_allotment ca ON c.id = ca.course_id
            JOIN sessions s ON ca.session_id = s.id
            WHERE ca.user_id = ?`

            rows, err := db.Query(query, user.ID)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
                return
            }
            defer rows.Close()

            for rows.Next() {
                var course models.Course
                if err := rows.Scan(&course.ID, &course.Code, &course.Title, &course.Credit, &course.Session, &course.Term); err != nil {
                    c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan course"})
                    return
                }
                courses = append(courses, course)
            }

            if err := rows.Err(); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process courses"})
                return
            }

            c.JSON(http.StatusOK, courses)
        } else {
            var courses []models.Courses
            // Fetch attendance records for the user  
            query:=`SELECT * FROM courses`

            rows, err := db.Query(query)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
                return
            }
            defer rows.Close()

            for rows.Next() {
                var course models.Courses
                if err := rows.Scan(&course.ID, &course.Code, &course.Title, &course.Credit); err != nil {
                    c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan course"})
                    return
                }
                courses = append(courses, course)
            }

            if err := rows.Err(); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process courses"})
                return
            }

            c.JSON(http.StatusOK, courses)
        }
    }
}

type CourseInput struct {
	Code 	string  `json:"code" binding:"required"`
	Title   string  `json:"title" binding:"required"`
	Credit  int 	`json:"credit" binding:"required"`
}

func AddCourses(db *sql.DB ) gin.HandlerFunc{
	return func(c *gin.Context){
		
		var input []CourseInput
		if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }
		tx, err := db.Begin()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
            return
        }

        for _, course := range input {
            _, err := tx.Exec("INSERT INTO courses (code, title, credit) VALUES (?, ?, ?)", course.Code, course.Title, course.Credit)
            if err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add course"})
                return
            }
        }

        if err := tx.Commit(); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Courses added successfully"})

        username := c.GetString("username")
        if username == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Username not provided"})
            return
        } 

	}
	
}


func UpdateCourse(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input CourseInput
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        id := c.Param("code")
        _, err := db.Exec("UPDATE courses SET code = ?, title = ?, credit = ? WHERE code = ?", input.Code, input.Title, input.Credit, id)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update course"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Course updated successfully","data":input})
    }
}

func DeleteCourse(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("code") 
        //var course models.Course
		
        // err := db.QueryRow("SELECT id FROM courses WHERE code = ?", id).Scan(&course.ID)
        // if err != nil {
        //     if err == sql.ErrNoRows {
        //         c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
        //     } else {
        //         log.Printf("Error fetching user: %v", err)
        //         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get course"})
        //     }
        //     return
        // }
        // _, err = db.Exec("DELETE FROM course_allotment WHERE course_id = ?", course.ID)
        // if err != nil {
        //     c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course allotment for course deletion"})
        //     return
        // }
        
        _, err := db.Exec("DELETE FROM courses WHERE code = ?", id)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
    }
}







