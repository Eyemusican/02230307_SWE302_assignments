package main

import (
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"realworld-backend/articles"
	"realworld-backend/common"
	"realworld-backend/users"

	"github.com/jinzhu/gorm"
)

func Migrate(db *gorm.DB) {
	users.AutoMigrate()
	db.AutoMigrate(&articles.ArticleModel{})
	db.AutoMigrate(&articles.TagModel{})
	db.AutoMigrate(&articles.FavoriteModel{})
	db.AutoMigrate(&articles.ArticleUserModel{})
	db.AutoMigrate(&articles.CommentModel{})

	// Performance optimization: Add database indexes
	db.Model(&articles.ArticleModel{}).AddIndex("idx_articles_author", "author_id")
	db.Model(&articles.ArticleModel{}).AddIndex("idx_articles_created_at", "created_at")
	db.Model(&articles.CommentModel{}).AddIndex("idx_comments_article", "article_id")

	fmt.Println("✅ Database indexes added for performance optimization")
}

func main() {

	db := common.Init()
	Migrate(db)
	defer db.Close()

	r := gin.Default()

	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4100"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Security Headers Middleware
	r.Use(func(c *gin.Context) {
		// Prevent clickjacking attacks
		c.Header("X-Frame-Options", "DENY")

		// Prevent MIME-sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		// Enable XSS protection
		c.Header("X-XSS-Protection", "1; mode=block")

		// Content Security Policy
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8080 http://localhost:4100")

		// Remove information disclosure headers
		c.Header("Server", "")
		c.Header("X-Powered-By", "")

		c.Next()
	})

	v1 := r.Group("/api")
	users.UsersRegister(v1.Group("/users"))
	v1.Use(users.AuthMiddleware(false))
	articles.ArticlesAnonymousRegister(v1.Group("/articles"))
	articles.TagsAnonymousRegister(v1.Group("/tags"))

	v1.Use(users.AuthMiddleware(true))
	users.UserRegister(v1.Group("/user"))
	users.ProfileRegister(v1.Group("/profiles"))

	articles.ArticlesRegister(v1.Group("/articles"))

	testAuth := r.Group("/api/ping")

	testAuth.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// test 1 to 1
	tx1 := db.Begin()

	// Hash the password for seed user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("testpassword123"), bcrypt.DefaultCost)

	userA := users.UserModel{
		Username:     "AAAAAAAAAAAAAAAA",
		Email:        "aaaa@g.cn",
		Bio:          "seed user for testing",
		Image:        nil,
		PasswordHash: string(hashedPassword),
	}

	// Check if user already exists before saving
	var existingUser users.UserModel
	if err := db.Where("email = ?", "aaaa@g.cn").First(&existingUser).Error; err != nil {
		// User doesn't exist, create it
		if result := tx1.Save(&userA); result.Error != nil {
			tx1.Rollback()
			fmt.Println("Seed user creation failed (already exists):", result.Error)
		} else {
			tx1.Commit()
			fmt.Println(userA)
		}
	} else {
		tx1.Rollback()
		fmt.Println("Seed user already exists, skipping")
	}

	//db.Save(&ArticleUserModel{
	//    UserModelID:userA.ID,
	//})
	//var userAA ArticleUserModel
	//db.Where(&ArticleUserModel{
	//    UserModelID:userA.ID,
	//}).First(&userAA)
	//fmt.Println(userAA)

	r.Run("0.0.0.0:8080") // listen on all interfaces (IPv4 and IPv6)
}
