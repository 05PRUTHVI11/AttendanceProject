package handlers

import (
	"database/sql"
	"net/http"
	"student_attendance_system/middlewares"
	"student_attendance_system/models"
	"student_attendance_system/utils"

	"github.com/gin-gonic/gin"
)

func Register(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var inputs []struct {
            Username string `json:"username" binding:"required"`
            Password string `json:"password" binding:"required"`
            Role     string `json:"role" binding:"required"`
        }

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
            hashedPassword, err := utils.HashPassword(input.Password)
            if err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
                return
            }

            _, err = tx.Exec("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", input.Username, hashedPassword, input.Role)
            if err != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
                println(err)
                return
            }
        }

        if err := tx.Commit(); err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Users registered successfully"})
    }
}


func Login(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input struct {
            Username string `json:"username" binding:"required"`
            Password string `json:"password" binding:"required"`
        }

        // Bind JSON input to struct
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Query user from database
        var user models.User
        err := db.QueryRow("SELECT id, username, password, role FROM users WHERE username = ?", input.Username).Scan(&user.ID, &user.Username, &user.Password, &user.Role)
        if err != nil {
            if err == sql.ErrNoRows {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username"})
                return
            }
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
            return
        }

        // Verify password
        println("input password",input.Password)
        println("user password",user.Password)
        if !utils.CheckPasswordHash(input.Password, user.Password) {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
            return
        }


        // Generate JWT token
        token, err := middlewares.GenerateJWT(user.Username, user.Role)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
            return
        }

        // Return token to the client
        c.JSON(http.StatusOK, gin.H{"token": token})
    }
}

func GetUser(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        username, exists := c.Get("username")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        var user models.User
        err := db.QueryRow("SELECT id, username, role FROM users WHERE username = ?", username).Scan(&user.ID, &user.Username, &user.Role)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
            return
        }

        c.JSON(http.StatusOK, user)
    }
}
func GetAllUser(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        _, exists := c.Get("username")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        var users []models.User
        query:=`SELECT id, username, role from users`

        rows, err := db.Query(query)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
            return
        }
        defer rows.Close()

        for rows.Next() {
            var user models.User
            if err := rows.Scan(&user.ID, &user.Username, &user.Role); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan users"})
                return
            }
            users = append(users, user)
        }

        if err := rows.Err(); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process users"})
            return
        }

        c.JSON(http.StatusOK, users)
    }
}

func UpdateUser(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input models.User

        // Bind JSON to input struct
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Check if password is provided and hash it
        if input.Password != "" {
            hashedPassword, err := utils.HashPassword(input.Password)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
                return
            }
            input.Password = hashedPassword // Update input with hashed password
        } else {
            // If password is not provided, fetch existing password from DB or ignore it
            // Example: Fetch existing user data from DB and merge with input
                
            var existingPassword string
            err := db.QueryRow("SELECT password FROM users WHERE id = ?", input.ID).Scan(&existingPassword)
            if err != nil {
                if err == sql.ErrNoRows {
                    c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
                    return
                }
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user password"})
                return
            }
            input.Password = existingPassword
                println(input.Password)
        }

        // Update user in the database
        _, err := db.Exec("UPDATE users SET username=?, role=?, password=? WHERE id=?;", input.Username, input.Role, input.Password, input.ID)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
    }
}



func DeleteUser(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id:=c.Query("id")
        _, err := db.Exec("DELETE FROM users WHERE id = ?", id)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
    }
}