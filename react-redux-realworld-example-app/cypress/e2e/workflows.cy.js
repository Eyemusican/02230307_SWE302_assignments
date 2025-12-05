describe('Complete User Workflows', () => {
  
  describe('Full User Journey - Registration to Article Publication', () => {
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'testpassword123'
    };

    it('should complete full workflow: register, create article, comment, and favorite', () => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);

      // Step 1: Register new user
      cy.contains('a', 'Sign up').click();
      cy.get('input[placeholder="Username"]').type(testUser.username);
      cy.get('input[placeholder="Email"]').type(testUser.email);
      cy.get('input[placeholder="Password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait(1000);

      // Verify registration successful - should be logged in
      cy.url().should('eq', 'http://localhost:4100/');
      cy.contains('a', testUser.username).should('be.visible');

      // Step 2: Create a new article
      cy.contains('a', 'New Post').click();
      cy.wait(1000);

      const articleTitle = `My First Article ${timestamp}`;
      cy.get('input[placeholder="Article Title"]').type(articleTitle);
      cy.get('input[placeholder="What\'s this article about?"]').type('A comprehensive guide');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('# Introduction\\n\\nThis is my first article on Conduit!');
      cy.get('input[placeholder="Enter tags"]').type('javascript{enter}');
      cy.contains('button', 'Publish Article').click();
      cy.wait(2000);

      // Should be on article page
      cy.url().should('include', '/article/');
      cy.get('h1').should('contain', articleTitle);

      // Step 3: Verify article was created - check we're on article page
      cy.url().should('include', '/article/');
      cy.get('h1').should('contain', articleTitle);

      // Step 4: View own profile to see the article
      cy.contains('a', testUser.username).click();
      cy.wait(1000);
      cy.get('.user-info').should('contain', testUser.username);
      cy.contains('.article-preview h1', articleTitle).should('be.visible');

      // Step 5: Update profile settings
      cy.contains('a', 'Edit Profile Settings').click();
      cy.wait(1000);
      const newBio = `Software developer passionate about ${timestamp}`;
      cy.get('textarea[placeholder="Short bio about you"]').clear().type(newBio);
      cy.contains('button', 'Update Settings').click();
      cy.wait(1000);

      // Step 6: Verify bio updated
      cy.contains('a', testUser.username).click();
      cy.wait(1000);
      cy.get('.user-info').should('contain', newBio);

      // Step 7: Comment on own article
      cy.contains('.article-preview h1', articleTitle).click();
      cy.wait(2000);
      cy.get('textarea[placeholder="Write a comment..."]').type('This is my first comment!');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Verify comment appears
      cy.get('.card').not('.comment-form').should('contain', 'This is my first comment!');

      // Step 8: Edit the article
      cy.contains('a', 'Edit Article').click();
      cy.wait(1000);
      cy.get('textarea[placeholder="Write your article (in markdown)"]')
        .clear()
        .type('# Introduction\\n\\nThis is my updated article with more content!');
      cy.contains('button', 'Publish Article').click();
      cy.wait(2000);

      // Verify update
      cy.get('.article-content').should('contain', 'updated article with more content');
    });
  });

  describe('Multi-User Interaction Workflow', () => {
    const timestamp = Date.now();

    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
    });

    it('should handle interactions between existing user and articles', () => {
      // Login as existing user
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);

      // Go to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Interact with an article - favorite it
      cy.get('.article-preview').first().within(() => {
        // Get initial favorite state
        cy.get('button').first().then(($btn) => {
          const isFavorited = $btn.hasClass('btn-primary');
          
          // Click to toggle
          cy.get('button').first().click();
          cy.wait(1000);

          // Verify state changed
          if (isFavorited) {
            cy.get('button').first().should('have.class', 'btn-outline-primary');
          } else {
            cy.get('button').first().should('have.class', 'btn-primary');
          }
        });
      });

      // View favorited articles
      cy.contains('a', 'AAAAAAAAAAAAAAAA').click();
      cy.wait(1000);
      cy.contains('a', 'Favorited Articles').click();
      cy.wait(1000);

      // Should see articles (if any were favorited)
      cy.get('.articles-toggle').should('be.visible');
    });

    it('should create article, comment, and interact with tags', () => {
      // Login
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);

      // Create article with multiple tags
      cy.contains('a', 'New Post').click();
      cy.wait(1000);

      const articleTitle = `Workflow Test Article ${timestamp}`;
      cy.get('input[placeholder="Article Title"]').type(articleTitle);
      cy.get('input[placeholder="What\'s this article about?"]').type('Testing workflows');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Testing complete workflows with multiple features.');
      
      // Add multiple tags
      cy.get('input[placeholder="Enter tags"]').type('testing{enter}');
      cy.get('input[placeholder="Enter tags"]').type('workflow{enter}');
      cy.get('input[placeholder="Enter tags"]').type('e2e{enter}');
      
      cy.contains('button', 'Publish Article').click();
      cy.wait(2000);

      // Verify article has all tags
      cy.get('.tag-list').should('contain', 'testing');
      cy.get('.tag-list').should('contain', 'workflow');
      cy.get('.tag-list').should('contain', 'e2e');

      // Add multiple comments
      cy.get('textarea[placeholder="Write a comment..."]').type('First comment');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      cy.get('textarea[placeholder="Write a comment..."]').type('Second comment');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      cy.get('textarea[placeholder="Write a comment..."]').type('Third comment');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Verify all comments exist
      cy.get('.card').not('.comment-form').should('have.length', 3);

      // Delete one comment
      cy.get('.card').not('.comment-form').first().within(() => {
        cy.get('.mod-options .ion-trash-a').click();
      });
      cy.wait(1000);

      // Should have 2 comments left
      cy.get('.card').not('.comment-form').should('have.length', 2);

      // Go back to home
      cy.contains('a', 'Home').click();
      cy.wait(1000);

      // Filter by one of the tags
      cy.get('.tag-list a').contains('testing').click();
      cy.wait(1000);

      // Should see our article in filtered view
      cy.contains('.article-preview h1', articleTitle).should('be.visible');

      // Click on article from feed
      cy.contains('.article-preview h1', articleTitle).click();
      cy.wait(2000);

      // Delete the article
      cy.contains('button', 'Delete Article').click();
      cy.wait(1000);

      // Should redirect to home
      cy.url().should('eq', 'http://localhost:4100/');
    });

    it('should handle article editing and tag modifications', () => {
      // Login
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);

      // Create article
      cy.contains('a', 'New Post').click();
      cy.wait(1000);

      const articleTitle = `Tag Modification Test ${timestamp}`;
      cy.get('input[placeholder="Article Title"]').type(articleTitle);
      cy.get('input[placeholder="What\'s this article about?"]').type('Testing tag modifications');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Content for tag testing.');
      cy.get('input[placeholder="Enter tags"]').type('tag1{enter}');
      cy.get('input[placeholder="Enter tags"]').type('tag2{enter}');
      
      cy.contains('button', 'Publish Article').click();
      cy.wait(2000);

      // Edit article - add more content and tags
      cy.contains('a', 'Edit Article').click();
      cy.wait(1000);

      // Add a new tag
      cy.get('input[placeholder="Enter tags"]').type('tag3{enter}');

      // Update article
      cy.contains('button', 'Publish Article').click();
      cy.wait(2000);

      // Verify new tag added
      cy.get('.tag-list').should('contain', 'tag1');
      cy.get('.tag-list').should('contain', 'tag2');
      cy.get('.tag-list').should('contain', 'tag3');

      // Clean up - delete article
      cy.contains('button', 'Delete Article').click();
      cy.wait(1000);
    });
  });

  describe('Navigation and State Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
      
      // Login
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
    });

    it('should maintain state across navigation', () => {
      // Go to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Remember first article title
      cy.get('.article-preview').first().find('h1').invoke('text').then((title) => {
        // Navigate to Settings
        cy.contains('a', 'Settings').click();
        cy.wait(1000);

        // Go back to Home
        cy.contains('a', 'Home').click();
        cy.wait(1000);

        // Switch to Global Feed again
        cy.contains('a', 'Global Feed').click();
        cy.wait(1000);

        // Should still see the same articles
        cy.get('.article-preview').first().find('h1').should('contain', title);
      });
    });

    it('should handle logout and require re-authentication', () => {
      // Navigate to Settings
      cy.contains('a', 'Settings').click();
      cy.wait(1000);

      // Logout
      cy.contains('button', 'Or click here to logout').click();
      cy.wait(1000);

      // Should be logged out
      cy.contains('a', 'Sign in').should('be.visible');
      cy.contains('a', 'Sign up').should('be.visible');

      // Verify user-specific navigation items are gone
      cy.get('.navbar').should('not.contain', 'New Post');
      cy.get('.navbar').should('not.contain', 'Settings');
    });

    it('should handle pagination and feed switching', () => {
      // Start on Your Feed
      cy.contains('a', 'Your Feed').should('have.class', 'active');

      // Switch to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);
      cy.contains('a', 'Global Feed').should('have.class', 'active');

      // Check if articles exist
      cy.get('.article-preview').should('have.length.greaterThan', 0);

      // If pagination exists, test it
      cy.get('body').then(($body) => {
        if ($body.find('.pagination').length > 0) {
          cy.get('.pagination .page-link').last().click();
          cy.wait(1000);
          cy.get('.article-preview').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
      
      // Login
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
    });

    it('should handle empty article creation', () => {
      cy.contains('a', 'New Post').click();
      cy.wait(1000);

      // Try to publish without content
      cy.contains('button', 'Publish Article').click();
      cy.wait(1000);

      // Should still be on editor page
      cy.url().should('include', '/editor');
    });

    it('should handle empty comment submission', () => {
      // Go to any article
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);
      cy.get('.article-preview').first().find('h1').click();
      cy.wait(2000);

      // Try to post empty comment
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Comment form should still be present
      cy.get('textarea[placeholder="Write a comment..."]').should('be.visible');
    });

    it('should display articles with no tags', () => {
      // Create article without tags
      cy.contains('a', 'New Post').click();
      cy.wait(1000);

      const timestamp = Date.now();
      cy.get('input[placeholder="Article Title"]').type(`No Tags Article ${timestamp}`);
      cy.get('input[placeholder="What\'s this article about?"]').type('Article without tags');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Content without any tags.');
      
      cy.contains('button', 'Publish Article').click();
      cy.wait(2000);

      // Should successfully create article
      cy.url().should('include', '/article/');
      
      // Tag list may be empty or not present
      cy.get('body').then(($body) => {
        if ($body.find('.tag-list').length > 0) {
          cy.get('.tag-list').should('not.contain', 'span.tag-default');
        }
      });

      // Clean up
      cy.contains('button', 'Delete Article').click();
      cy.wait(1000);
    });
  });
});
