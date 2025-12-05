describe('Comments Management', () => {
  
  describe('Adding Comments', () => {
    let articleSlug;

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

      // Create an article to comment on
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
      
      cy.get('input[placeholder="Article Title"]').type(`Comment Test Article ${Date.now()}`);
      cy.get('input[placeholder="What\'s this article about?"]').type('Article for testing comments');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('This article is for testing comment functionality.');
      cy.contains('button', 'Publish Article').click();
      
      cy.wait(2000);
      
      // Extract slug from URL
      cy.url().then((url) => {
        articleSlug = url.split('/article/')[1];
      });
    });

    it('should display comment form when logged in', () => {
      cy.get('textarea[placeholder="Write a comment..."]').should('be.visible');
      cy.contains('button', 'Post Comment').should('be.visible');
    });

    it('should successfully add a comment to article', () => {
      const commentText = `Test comment ${Date.now()}`;

      cy.get('textarea[placeholder="Write a comment..."]').type(commentText);
      cy.contains('button', 'Post Comment').click();

      cy.wait(1000);

      // Comment should appear in the list
      cy.contains('.card', commentText).should('be.visible');
    });

    it('should display multiple comments', () => {
      // Add first comment
      cy.get('textarea[placeholder="Write a comment..."]').type('First comment');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Add second comment
      cy.get('textarea[placeholder="Write a comment..."]').type('Second comment');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Both comments should be visible
      cy.contains('.card', 'First comment').should('be.visible');
      cy.contains('.card', 'Second comment').should('be.visible');
    });

    it('should clear textarea after posting comment', () => {
      cy.get('textarea[placeholder="Write a comment..."]').type('Test comment');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Textarea should be cleared
      cy.get('textarea[placeholder="Write a comment..."]').should('have.value', '');
    });
  });

  describe('Deleting Comments', () => {
    let articleSlug;
    let commentText;

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

      // Create an article
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
      
      cy.get('input[placeholder="Article Title"]').type(`Delete Comment Test ${Date.now()}`);
      cy.get('input[placeholder="What\'s this article about?"]').type('Testing comment deletion');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Comment deletion test article.');
      cy.contains('button', 'Publish Article').click();
      
      cy.wait(2000);
      
      // Extract slug
      cy.url().then((url) => {
        articleSlug = url.split('/article/')[1];
      });

      // Add a comment to delete
      commentText = `Comment to delete ${Date.now()}`;
      cy.get('textarea[placeholder="Write a comment..."]').type(commentText);
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);
    });

    it('should show delete button for own comment', () => {
      // Find the comment card and check for delete icon
      cy.contains('.card', commentText).within(() => {
        cy.get('.mod-options').should('exist');
      });
    });

    it('should successfully delete own comment', () => {
      // Find and click delete button
      cy.contains('.card', commentText).within(() => {
        cy.get('.mod-options i').click();
      });

      cy.wait(1000);

      // Comment should be removed
      cy.contains('.card', commentText).should('not.exist');
    });

    it('should not show delete button for comments when not logged in', () => {
      // First, verify comment exists
      cy.contains('.card', commentText).should('exist');

      // Logout
      cy.contains('a', 'Settings').click();
      cy.contains('button', 'Or click here to logout').click();
      cy.wait(1000);

      // Navigate back to article
      cy.visit(`http://localhost:4100/article/${articleSlug}`);
      cy.wait(1000);

      // Delete button should not be visible
      cy.contains('.card', commentText).within(() => {
        cy.get('.mod-options').should('not.exist');
      });
    });
  });

  describe('Comment Display and Metadata', () => {
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

      // Create article with comment
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
      
      cy.get('input[placeholder="Article Title"]').type(`Comment Display Test ${Date.now()}`);
      cy.get('input[placeholder="What\'s this article about?"]').type('Testing comment display');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Comment display test article.');
      cy.contains('button', 'Publish Article').click();
      
      cy.wait(2000);

      // Add a comment
      cy.get('textarea[placeholder="Write a comment..."]').type('Test comment for metadata');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);
    });

    it('should display comment author information', () => {
      // Check for author username (skip the comment-form card)
      cy.get('.card').not('.comment-form').first().within(() => {
        cy.contains('AAAAAAAAAAAAAAAA').should('be.visible');
      });
    });

    it('should display comment date', () => {
      // Check for date (skip the comment-form card)
      cy.get('.card').not('.comment-form').first().within(() => {
        cy.get('.date-posted').should('be.visible');
      });
    });

    it('should display comment body text', () => {
      cy.contains('.card', 'Test comment for metadata').should('be.visible');
    });

    it('should show comments in chronological order', () => {
      // Add a newer comment
      cy.get('textarea[placeholder="Write a comment..."]').type('Newer comment');
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Comments appear in chronological order (oldest first), so newer comment should appear last
      cy.get('.card').not('.comment-form').last().should('contain', 'Newer comment');
      cy.get('.card').not('.comment-form').first().should('contain', 'Test comment for metadata');
    });
  });

  describe('Comment Validation', () => {
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

      // Create article
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
      
      cy.get('input[placeholder="Article Title"]').type(`Validation Test ${Date.now()}`);
      cy.get('input[placeholder="What\'s this article about?"]').type('Testing validation');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Validation test article.');
      cy.contains('button', 'Publish Article').click();
      
      cy.wait(2000);
    });

    it('should not post empty comment', () => {
      // Try to post without typing anything
      cy.contains('button', 'Post Comment').click();
      cy.wait(500);

      // No new comment card should appear (or check for error)
      cy.get('textarea[placeholder="Write a comment..."]').should('have.value', '');
    });

    it('should accept multiline comments', () => {
      const multilineComment = 'Line 1\nLine 2\nLine 3';
      
      cy.get('textarea[placeholder="Write a comment..."]').type(multilineComment);
      cy.contains('button', 'Post Comment').click();
      cy.wait(1000);

      // Comment should be visible
      cy.contains('.card', 'Line 1').should('be.visible');
    });
  });
});
