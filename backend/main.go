package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"student_attendance_system/handlers"
	"student_attendance_system/middlewares"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {
    
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
    dbUser := os.Getenv("DB_USERNAME")
    dbPass := os.Getenv("DB_PASSWORD")
    dbHost := os.Getenv("DB_HOST")
    dbPort := os.Getenv("DB_PORT")
    dbName := os.Getenv("DB_DATABASE")

    dataSourceName := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPass, dbHost, dbPort, dbName)
    db, err := sql.Open("mysql", dataSourceName)
    if err != nil {
        panic(err)
    }
    defer db.Close()

    err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
    r := gin.Default()

    // Configure CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000","http://localhost:5173"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))
   
    r.POST("/login", handlers.Login(db))
    auth := r.Group("/")
    auth.Use(middlewares.Authenticate())
    
    //Users
    auth.GET("/user", middlewares.Authorize("student","teacher","admin"), handlers.GetUser(db))
    auth.GET("/users", middlewares.Authorize("admin"), handlers.GetAllUser(db))
    auth.POST("/register", middlewares.Authorize("admin"), handlers.Register(db))
    auth.PUT("/user", middlewares.Authorize("admin"), handlers.UpdateUser(db))
    auth.DELETE("/user", middlewares.Authorize("admin"), handlers.DeleteUser(db))

    //Courses
    auth.GET("/courses", middlewares.Authorize("student","teacher","admin"), handlers.GetCourses(db))
    auth.POST("/courses", middlewares.Authorize("admin"), handlers.AddCourses(db))
    auth.PUT("/courses/:code", middlewares.Authorize("admin"), handlers.UpdateCourse(db))
    auth.DELETE("/courses/:code", middlewares.Authorize("admin"), handlers.DeleteCourse(db))

    //sessions
    auth.GET("/sessions", middlewares.Authorize("student","teacher","admin"), handlers.GetSessions(db))
    auth.POST("/sessions", middlewares.Authorize("admin"), handlers.AddSessions(db))
    auth.PUT("/sessions/:id", middlewares.Authorize("admin"), handlers.UpdateSessions(db))
    auth.DELETE("/sessions/:id", middlewares.Authorize("admin"), handlers.DeleteSessions(db))

    //CourseAllotment
    auth.GET("/courseAllotment", middlewares.Authorize("admin"), handlers.GetCourseAllotment(db))
    auth.POST("/courseAllotment", middlewares.Authorize("admin"), handlers.AddCourseAllotment(db))
    auth.PUT("/courseAllotment/:id", middlewares.Authorize("admin"), handlers.UpdateCourseAllotment(db))
    auth.DELETE("/courseAllotment/:id", middlewares.Authorize("admin"), handlers.DeleteCourseAllotment(db))
    
    //Attendance
    auth.GET("/attendance", middlewares.Authorize("student","admin"), handlers.GetAttendance(db))
    auth.POST("/attendance", middlewares.Authorize("teacher","admin"), handlers.AddAttendance(db))
    auth.POST("/add-attendance", middlewares.Authorize("teacher","admin"), handlers.AddAttendance(db))
    auth.GET("/view-attendance", middlewares.Authorize("student","admin","teacher"), handlers.ViewAttendance(db))
    auth.GET("/view-attendance/:username", middlewares.Authorize("student","admin","teacher"), handlers.ViewAttendancebyName(db))
    auth.GET("/viewAttendanceList/:username", middlewares.Authorize("student","admin","teacher"), handlers.ViewAttendanceList(db))
    auth.GET("/viewStudentAttendanceList/", middlewares.Authorize("admin"), handlers.ViewStudentAttendanceList(db))
    auth.DELETE("/deleteStudentAttendanceList", middlewares.Authorize("admin"), handlers.DeleteAttendance(db))
    
    r.Run(":9090")
}
