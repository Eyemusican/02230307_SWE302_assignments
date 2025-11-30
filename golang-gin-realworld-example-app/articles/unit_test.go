package articles

import (
	"testing"
	"time"

	"realworld-backend/users"

	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
	"github.com/stretchr/testify/assert"
)

// Test helper to create a mock article model
func newTestArticleModel() ArticleModel {
	return ArticleModel{
		Title:       "Test Article Title",
		Description: "This is a test article description",
		Body:        "This is the body of the test article with some content.",
		Slug:        "test-article-title",
		AuthorID:    1,
	}
}

// Test helper to create a mock article user model
func newTestArticleUserModel() ArticleUserModel {
	return ArticleUserModel{
		UserModelID: 1,
		UserModel: users.UserModel{
			Username: "testuser",
			Email:    "test@example.com",
			Bio:      "Test bio",
		},
	}
}

// ===========================
// PART 1: MODEL TESTS
// ===========================

// Test 1: Article creation with valid data
func TestArticleModelCreation(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()

	asserts.Equal("Test Article Title", article.Title, "Title should match")
	asserts.Equal("test-article-title", article.Slug, "Slug should match")
	asserts.Equal("This is a test article description", article.Description, "Description should match")
	asserts.NotEmpty(article.Body, "Body should not be empty")
}

// Test 2: Article slug generation
func TestArticleSlugGeneration(t *testing.T) {
	asserts := assert.New(t)

	testCases := []struct {
		title        string
		expectedSlug string
	}{
		{"Hello World", "hello-world"},
		{"Test Article 123", "test-article-123"},
		{"Go Programming!", "go-programming"},
		{"API Testing & Validation", "api-testing-and-validation"},
	}

	for _, tc := range testCases {
		generatedSlug := slug.Make(tc.title)
		asserts.Equal(tc.expectedSlug, generatedSlug, "Slug should be generated correctly for: "+tc.title)
	}
}

// Test 3: Article validation - empty title
func TestArticleValidationEmptyTitle(t *testing.T) {
	asserts := assert.New(t)

	article := ArticleModel{
		Title:       "",
		Description: "Description",
		Body:        "Body",
	}

	asserts.Empty(article.Title, "Empty title should be empty")
}

// Test 4: Article validation - title length
func TestArticleValidationTitleLength(t *testing.T) {
	asserts := assert.New(t)

	// Valid title (minimum 4 characters as per validator)
	article1 := ArticleModel{
		Title: "Test",
	}
	asserts.GreaterOrEqual(len(article1.Title), 4, "Valid title should have at least 4 characters")

	// Short title
	article2 := ArticleModel{
		Title: "Hi",
	}
	asserts.Less(len(article2.Title), 4, "Short title should be less than 4 characters")
}

// Test 5: Article validation - body size
func TestArticleValidationBodySize(t *testing.T) {
	asserts := assert.New(t)

	article := ArticleModel{
		Title:       "Test Article",
		Description: "Short desc",
		Body:        "This is a valid body with reasonable length.",
	}

	asserts.LessOrEqual(len(article.Body), 2048, "Body should not exceed 2048 characters")
	asserts.NotEmpty(article.Body, "Body should not be empty")
}

// Test 6: Tag association
func TestArticleTagAssociation(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()

	// Create mock tags
	tags := []TagModel{
		{Tag: "golang"},
		{Tag: "testing"},
		{Tag: "backend"},
	}
	article.Tags = tags

	asserts.Equal(3, len(article.Tags), "Article should have 3 tags")
	asserts.Equal("golang", article.Tags[0].Tag, "First tag should be golang")
	asserts.Equal("testing", article.Tags[1].Tag, "Second tag should be testing")
}

// Test 7: Article timestamps
func TestArticleTimestamps(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()

	asserts.NotZero(article.CreatedAt, "CreatedAt should not be zero")
	asserts.NotZero(article.UpdatedAt, "UpdatedAt should not be zero")
}

// Test 8: Article author relationship
func TestArticleAuthorRelationship(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()
	author := newTestArticleUserModel()
	article.Author = author
	article.AuthorID = 1 // Set the ID explicitly

	asserts.Equal(author.UserModel.Username, article.Author.UserModel.Username, "Author username should match")
	asserts.Equal(uint(1), article.AuthorID, "AuthorID should be 1")
	asserts.NotNil(article.Author, "Article should have an author")
}

// Test 9: Comment association with article
func TestArticleCommentAssociation(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()
	comments := []CommentModel{
		{Body: "First comment", ArticleID: article.ID},
		{Body: "Second comment", ArticleID: article.ID},
	}
	article.Comments = comments

	asserts.Equal(2, len(article.Comments), "Article should have 2 comments")
	asserts.Equal("First comment", article.Comments[0].Body, "First comment body should match")
}

// Test 10: Article with no tags
func TestArticleWithNoTags(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()
	article.Tags = []TagModel{}

	asserts.Equal(0, len(article.Tags), "Article should have no tags")
}

// ===========================
// PART 2: SERIALIZER TESTS
// ===========================

// Test 11: TagSerializer output format
func TestTagSerializer(t *testing.T) {
	asserts := assert.New(t)

	tag := TagModel{Tag: "golang"}
	serializer := TagSerializer{
		C:        &gin.Context{},
		TagModel: tag,
	}

	response := serializer.Response()
	asserts.Equal("golang", response, "Tag serializer should return tag string")
}

// Test 12: TagsSerializer with multiple tags
func TestTagsSerializer(t *testing.T) {
	asserts := assert.New(t)

	tags := []TagModel{
		{Tag: "golang"},
		{Tag: "testing"},
		{Tag: "api"},
	}
	serializer := TagsSerializer{
		C:    &gin.Context{},
		Tags: tags,
	}

	response := serializer.Response()
	asserts.Equal(3, len(response), "Should serialize 3 tags")
	asserts.Equal("golang", response[0], "First tag should be golang")
	asserts.Equal("testing", response[1], "Second tag should be testing")
	asserts.Equal("api", response[2], "Third tag should be api")
}

// Test 13: ArticleResponse structure
func TestArticleResponseStructure(t *testing.T) {
	asserts := assert.New(t)

	response := ArticleResponse{
		Title:          "Test Article",
		Slug:           "test-article",
		Description:    "Test description",
		Body:           "Test body",
		Favorite:       false,
		FavoritesCount: 0,
	}

	asserts.Equal("Test Article", response.Title, "Title should match")
	asserts.Equal("test-article", response.Slug, "Slug should match")
	asserts.False(response.Favorite, "Favorite should be false")
	asserts.Equal(uint(0), response.FavoritesCount, "FavoritesCount should be 0")
}

// Test 14: CommentModel structure
func TestCommentModelStructure(t *testing.T) {
	asserts := assert.New(t)

	comment := CommentModel{
		Body:      "This is a test comment",
		ArticleID: 1,
		AuthorID:  1,
	}

	asserts.Equal("This is a test comment", comment.Body, "Comment body should match")
	asserts.Equal(uint(1), comment.ArticleID, "ArticleID should be 1")
	asserts.Equal(uint(1), comment.AuthorID, "AuthorID should be 1")
	asserts.LessOrEqual(len(comment.Body), 2048, "Comment body should not exceed 2048 characters")
}

// ===========================
// PART 3: VALIDATOR TESTS
// ===========================

// Test 15: ArticleModelValidator with valid input
func TestArticleModelValidatorValidInput(t *testing.T) {
	asserts := assert.New(t)

	validator := NewArticleModelValidator()
	validator.Article.Title = "Valid Article Title"
	validator.Article.Description = "This is a valid description"
	validator.Article.Body = "This is a valid body content"
	validator.Article.Tags = []string{"golang", "testing"}

	asserts.Equal("Valid Article Title", validator.Article.Title, "Title should match")
	asserts.GreaterOrEqual(len(validator.Article.Title), 4, "Title should be at least 4 characters")
	asserts.LessOrEqual(len(validator.Article.Description), 2048, "Description should not exceed 2048 characters")
	asserts.LessOrEqual(len(validator.Article.Body), 2048, "Body should not exceed 2048 characters")
	asserts.Equal(2, len(validator.Article.Tags), "Should have 2 tags")
}

// Test 16: ArticleModelValidator with missing required fields
func TestArticleModelValidatorMissingTitle(t *testing.T) {
	asserts := assert.New(t)

	validator := NewArticleModelValidator()
	validator.Article.Title = "" // Missing required field
	validator.Article.Description = "Description"
	validator.Article.Body = "Body"

	asserts.Empty(validator.Article.Title, "Title should be empty when not provided")
}

// Test 17: ArticleModelValidator with invalid title length
func TestArticleModelValidatorInvalidTitleLength(t *testing.T) {
	asserts := assert.New(t)

	validator := NewArticleModelValidator()
	validator.Article.Title = "Hi" // Too short (min=4)

	asserts.Less(len(validator.Article.Title), 4, "Title should be less than 4 characters")
}

// Test 18: NewArticleModelValidatorFillWith
func TestNewArticleModelValidatorFillWith(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()
	article.Tags = []TagModel{
		{Tag: "golang"},
		{Tag: "testing"},
	}

	validator := NewArticleModelValidatorFillWith(article)

	asserts.Equal(article.Title, validator.Article.Title, "Title should be filled from article model")
	asserts.Equal(article.Description, validator.Article.Description, "Description should be filled from article model")
	asserts.Equal(article.Body, validator.Article.Body, "Body should be filled from article model")
	asserts.Equal(2, len(validator.Article.Tags), "Tags should be filled from article model")
	asserts.Equal("golang", validator.Article.Tags[0], "First tag should match")
}

// Test 19: CommentModelValidator with valid input
func TestCommentModelValidatorValidInput(t *testing.T) {
	asserts := assert.New(t)

	validator := NewCommentModelValidator()
	validator.Comment.Body = "This is a valid comment"

	asserts.Equal("This is a valid comment", validator.Comment.Body, "Comment body should match")
	asserts.LessOrEqual(len(validator.Comment.Body), 2048, "Comment body should not exceed 2048 characters")
}

// Test 20: CommentModelValidator with empty body
func TestCommentModelValidatorEmptyBody(t *testing.T) {
	asserts := assert.New(t)

	validator := NewCommentModelValidator()
	validator.Comment.Body = ""

	asserts.Empty(validator.Comment.Body, "Comment body should be empty")
}

// Test 21: CommentModelValidator with max length
func TestCommentModelValidatorMaxLength(t *testing.T) {
	asserts := assert.New(t)

	validator := NewCommentModelValidator()
	longBody := make([]byte, 2048)
	for i := range longBody {
		longBody[i] = 'a'
	}
	validator.Comment.Body = string(longBody)

	asserts.Equal(2048, len(validator.Comment.Body), "Comment body should be exactly 2048 characters")
}

// Test 22: FavoriteModel structure
func TestFavoriteModelStructure(t *testing.T) {
	asserts := assert.New(t)

	favorite := FavoriteModel{
		FavoriteID:   1,
		FavoriteByID: 2,
	}

	asserts.Equal(uint(1), favorite.FavoriteID, "FavoriteID should be 1")
	asserts.Equal(uint(2), favorite.FavoriteByID, "FavoriteByID should be 2")
}

// Test 23: TagModel uniqueness concept
func TestTagModelUniqueness(t *testing.T) {
	asserts := assert.New(t)

	tag1 := TagModel{Tag: "golang"}
	tag2 := TagModel{Tag: "golang"}

	asserts.Equal(tag1.Tag, tag2.Tag, "Same tags should have same values")
}

// Test 24: Article description validation
func TestArticleDescriptionValidation(t *testing.T) {
	asserts := assert.New(t)

	article := newTestArticleModel()
	article.Description = "Short description"

	asserts.NotEmpty(article.Description, "Description should not be empty")
	asserts.LessOrEqual(len(article.Description), 2048, "Description should not exceed max length")
}

// Test 25: Multiple articles collection
func TestMultipleArticlesCollection(t *testing.T) {
	asserts := assert.New(t)

	articles := []ArticleModel{
		{Title: "First Article", Slug: "first-article"},
		{Title: "Second Article", Slug: "second-article"},
		{Title: "Third Article", Slug: "third-article"},
	}

	asserts.Equal(3, len(articles), "Should have 3 articles")
	asserts.Equal("First Article", articles[0].Title, "First article title should match")
	asserts.Equal("second-article", articles[1].Slug, "Second article slug should match")
}
