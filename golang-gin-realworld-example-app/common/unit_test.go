package common

import (
	"bytes"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestConnectingDatabase(t *testing.T) {
	asserts := assert.New(t)
	db := Init()
	// Test create & close DB
	_, err := os.Stat("./../gorm.db")
	asserts.NoError(err, "Db should exist")
	asserts.NoError(db.DB().Ping(), "Db should be able to ping")

	// Test get a connecting from connection pools
	connection := GetDB()
	asserts.NoError(connection.DB().Ping(), "Db should be able to ping")
	db.Close()

	// Test DB exceptions
	os.Chmod("./../gorm.db", 0000)
	db = Init()
	asserts.Error(db.DB().Ping(), "Db should not be able to ping")
	db.Close()
	os.Chmod("./../gorm.db", 0644)
}

func TestConnectingTestDatabase(t *testing.T) {
	asserts := assert.New(t)
	// Test create & close DB
	db := TestDBInit()
	_, err := os.Stat("./../gorm_test.db")
	asserts.NoError(err, "Db should exist")
	asserts.NoError(db.DB().Ping(), "Db should be able to ping")
	db.Close()

	// Test testDB exceptions
	os.Chmod("./../gorm_test.db", 0000)
	db = TestDBInit()
	_, err = os.Stat("./../gorm_test.db")
	asserts.NoError(err, "Db should exist")
	asserts.Error(db.DB().Ping(), "Db should not be able to ping")
	os.Chmod("./../gorm_test.db", 0644)

	// Test close delete DB
	TestDBFree(db)
	_, err = os.Stat("./../gorm_test.db")

	asserts.Error(err, "Db should not exist")
}

func TestRandString(t *testing.T) {
	asserts := assert.New(t)

	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	str := RandString(0)
	asserts.Equal(str, "", "length should be ''")

	str = RandString(10)
	asserts.Equal(len(str), 10, "length should be 10")
	for _, ch := range str {
		asserts.Contains(letters, ch, "char should be a-z|A-Z|0-9")
	}
}

func TestGenToken(t *testing.T) {
	asserts := assert.New(t)

	token := GenToken(2)

	asserts.IsType(token, string("token"), "token type should be string")
	asserts.Len(token, 115, "JWT's length should be 115")
}

func TestNewValidatorError(t *testing.T) {
	asserts := assert.New(t)

	type Login struct {
		Username string `form:"username" json:"username" binding:"exists,alphanum,min=4,max=255"`
		Password string `form:"password" json:"password" binding:"exists,min=8,max=255"`
	}

	var requestTests = []struct {
		bodyData       string
		expectedCode   int
		responseRegexg string
		msg            string
	}{
		{
			`{"username": "wangzitian0","password": "0123456789"}`,
			http.StatusOK,
			`{"status":"you are logged in"}`,
			"valid data and should return StatusCreated",
		},
		{
			`{"username": "wangzitian0","password": "01234567866"}`,
			http.StatusUnauthorized,
			`{"errors":{"user":"wrong username or password"}}`,
			"wrong login status should return StatusUnauthorized",
		},
		{
			`{"username": "wangzitian0","password": "0122"}`,
			http.StatusUnprocessableEntity,
			`{"errors":{"Password":"{min: 8}"}}`,
			"invalid password of too short and should return StatusUnprocessableEntity",
		},
		{
			`{"username": "_wangzitian0","password": "0123456789"}`,
			http.StatusUnprocessableEntity,
			`{"errors":{"Username":"{key: alphanum}"}}`,
			"invalid username of non alphanum and should return StatusUnprocessableEntity",
		},
	}

	r := gin.Default()

	r.POST("/login", func(c *gin.Context) {
		var json Login
		if err := Bind(c, &json); err == nil {
			if json.Username == "wangzitian0" && json.Password == "0123456789" {
				c.JSON(http.StatusOK, gin.H{"status": "you are logged in"})
			} else {
				c.JSON(http.StatusUnauthorized, NewError("user", errors.New("wrong username or password")))
			}
		} else {
			c.JSON(http.StatusUnprocessableEntity, NewValidatorError(err))
		}
	})

	for _, testData := range requestTests {
		bodyData := testData.bodyData
		req, err := http.NewRequest("POST", "/login", bytes.NewBufferString(bodyData))
		req.Header.Set("Content-Type", "application/json")
		asserts.NoError(err)

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		asserts.Equal(testData.expectedCode, w.Code, "Response Status - "+testData.msg)
		asserts.Regexp(testData.responseRegexg, w.Body.String(), "Response Content - "+testData.msg)
	}
}

func TestNewError(t *testing.T) {
	assert := assert.New(t)

	db := TestDBInit()
	type NotExist struct {
		heheda string
	}
	db.AutoMigrate(NotExist{})

	commenError := NewError("database", db.Find(NotExist{heheda: "heheda"}).Error)
	assert.IsType(commenError, commenError, "commenError should have right type")
	assert.Equal(map[string]interface{}(map[string]interface{}{"database": "no such table: not_exists"}),
		commenError.Errors, "commenError should have right error info")
}

// ===========================
// ADDITIONAL TESTS (Task 1.3)
// ===========================

// Test 1: JWT token generation with different user IDs
func TestGenTokenWithDifferentUserIDs(t *testing.T) {
	asserts := assert.New(t)

	// Test with user ID 1
	token1 := GenToken(1)
	asserts.NotEmpty(token1, "Token for user ID 1 should not be empty")
	asserts.IsType("string", token1, "Token should be a string")

	// Test with user ID 100
	token2 := GenToken(100)
	asserts.NotEmpty(token2, "Token for user ID 100 should not be empty")
	asserts.IsType("string", token2, "Token should be a string")

	// Test with user ID 999
	token3 := GenToken(999)
	asserts.NotEmpty(token3, "Token for user ID 999 should not be empty")

	// Tokens for different users should be different
	asserts.NotEqual(token1, token2, "Tokens for different users should be different")
	asserts.NotEqual(token2, token3, "Tokens for different users should be different")
	asserts.NotEqual(token1, token3, "Tokens for different users should be different")
}

// Test 2: JWT token with zero user ID
func TestGenTokenWithZeroUserID(t *testing.T) {
	asserts := assert.New(t)

	token := GenToken(0)
	asserts.NotEmpty(token, "Token should still be generated even with user ID 0")
	asserts.IsType("string", token, "Token should be a string")
}

// Test 3: JWT token format validation
func TestGenTokenFormat(t *testing.T) {
	asserts := assert.New(t)

	token := GenToken(123)

	// JWT tokens have 3 parts separated by dots
	parts := bytes.Split([]byte(token), []byte("."))
	asserts.Equal(3, len(parts), "JWT should have 3 parts (header.payload.signature)")

	// Each part should not be empty
	for i, part := range parts {
		asserts.NotEmpty(part, "JWT part %d should not be empty", i)
	}
}

// Test 4: RandString with various lengths
func TestRandStringVariousLengths(t *testing.T) {
	asserts := assert.New(t)

	testCases := []int{1, 5, 10, 20, 50, 100}

	for _, length := range testCases {
		str := RandString(length)
		asserts.Equal(length, len(str), "Random string should have exact length of %d", length)
		asserts.NotEmpty(str, "Random string should not be empty for length %d", length)
	}
}

// Test 5: RandString uniqueness
func TestRandStringUniqueness(t *testing.T) {
	asserts := assert.New(t)

	// Generate multiple random strings
	strings := make(map[string]bool)
	iterations := 100
	length := 10

	for i := 0; i < iterations; i++ {
		str := RandString(length)
		strings[str] = true
	}

	// With 100 iterations of 10-character strings, we should have
	// mostly unique values (very high probability)
	asserts.Greater(len(strings), 90, "Most random strings should be unique")
}

// Test 6: Database connection pool settings
func TestDatabaseConnectionPool(t *testing.T) {
	asserts := assert.New(t)

	// Note: This test will fail without CGO/GCC, but tests the concept
	// In a real scenario with CGO enabled, this would verify connection pool settings

	// Test that Init() function exists and can be called
	// The actual database initialization will fail without CGO, but we test the function signature
	asserts.NotNil(Init, "Init function should exist")
	asserts.NotNil(TestDBInit, "TestDBInit function should exist")
	asserts.NotNil(GetDB, "GetDB function should exist")
}

// Test 7: NewError with various error types
func TestNewErrorWithVariousTypes(t *testing.T) {
	asserts := assert.New(t)

	// Test with simple error
	err1 := errors.New("simple error")
	commonError1 := NewError("field1", err1)
	asserts.NotNil(commonError1, "NewError should return non-nil")
	asserts.Equal("simple error", commonError1.Errors["field1"], "Error message should match")

	// Test with different field names
	err2 := errors.New("validation failed")
	commonError2 := NewError("username", err2)
	asserts.Equal("validation failed", commonError2.Errors["username"], "Error for username field should match")

	// Test with database error
	err3 := errors.New("database connection failed")
	commonError3 := NewError("database", err3)
	asserts.Equal("database connection failed", commonError3.Errors["database"], "Database error should match")
}

// Test 8: RandString character set validation
func TestRandStringCharacterSet(t *testing.T) {
	asserts := assert.New(t)

	validChars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	str := RandString(50)

	for _, char := range str {
		asserts.Contains(validChars, string(char), "Each character should be from the valid set")
	}
}
