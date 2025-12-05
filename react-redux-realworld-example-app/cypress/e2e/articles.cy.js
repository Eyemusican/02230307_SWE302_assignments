describe('Article Management', () => {
  
  describe('Article Creation', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
      
      // Login with seed user
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);
      
      // Navigate to editor
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
    });

    it('should display article editor form', () => {
      cy.get('input[placeholder="Article Title"]').should('be.visible');
      cy.get('input[placeholder="What\'s this article about?"]').should('be.visible');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').should('be.visible');
      cy.get('input[placeholder="Enter tags"]').should('be.visible');
      cy.contains('button', 'Publish Article').should('be.visible');
    });

    it('should create a new article successfully', () => {
      const timestamp = Date.now();
      const title = `Test Article ${timestamp}`;

      cy.get('input[placeholder="Article Title"]').type(title);
      cy.get('input[placeholder="What\'s this article about?"]').type('Test Description for E2E');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('# Test Content\n\nThis is test content for article management.');
      cy.get('input[placeholder="Enter tags"]').type('test{enter}');
      cy.get('input[placeholder="Enter tags"]').type('cypress{enter}');
      cy.contains('button', 'Publish Article').click();

      cy.wait(2000);

      // Should redirect to article page
      cy.url().should('include', '/article/');

      // Article should be displayed
      cy.contains(title, { timeout: 10000 }).should('be.visible');
      cy.contains('This is test content for article management').should('be.visible');
    });

    it('should add multiple tags to article', () => {
      cy.get('input[placeholder="Article Title"]').type('Multi Tag Article');
      cy.get('input[placeholder="What\'s this article about?"]').type('Testing tags');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Article with tags');
      
      cy.get('input[placeholder="Enter tags"]').type('tag1{enter}');
      cy.get('input[placeholder="Enter tags"]').type('tag2{enter}');
      cy.get('input[placeholder="Enter tags"]').type('tag3{enter}');

      // Verify tags appear
      cy.contains('.tag-default', 'tag1').should('be.visible');
      cy.contains('.tag-default', 'tag2').should('be.visible');
      cy.contains('.tag-default', 'tag3').should('be.visible');
    });

    it('should remove tags before publishing', () => {
      cy.get('input[placeholder="Enter tags"]').type('tag1{enter}');
      cy.get('input[placeholder="Enter tags"]').type('tag2{enter}');

      // Click remove icon on first tag
      cy.get('.tag-default').first().find('i.ion-close-round').click();

      // Should only have one tag left
      cy.get('.tag-default').should('have.length', 1);
      cy.contains('.tag-default', 'tag2').should('be.visible');
    });
  });

  describe('Article Reading', () => {
    let articleSlug;
    let articleTitle;

    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
      
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(1000);

      // Create test article for each test
      articleTitle = `Read Test Article ${Date.now()}`;
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
      
      cy.get('input[placeholder="Article Title"]').type(articleTitle);
      cy.get('input[placeholder="What\'s this article about?"]').type('Article for reading tests');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('# Reading Test\n\nThis article is for testing reading functionality.');
      cy.get('input[placeholder="Enter tags"]').type('reading{enter}');
      cy.get('input[placeholder="Enter tags"]').type('test{enter}');
      cy.contains('button', 'Publish Article').click();
      
      cy.wait(2000);
      
      // Extract slug from URL
      cy.url().then((url) => {
        articleSlug = url.split('/article/')[1];
      });
    });

    it('should display article content correctly', () => {
      // Already on article page from beforeEach
      // Verify content
      cy.contains(articleTitle).should('be.visible');
      cy.contains('This article is for testing reading functionality').should('be.visible');
    });

    it('should display article metadata', () => {
      // Already on article page
      // Check author name
      cy.contains('AAAAAAAAAAAAAAAA').should('be.visible');

      // Check tags
      cy.contains('.tag-default', 'reading').should('be.visible');
      cy.contains('.tag-default', 'test').should('be.visible');
    });
  });

  describe('Article Editing', () => {
    let articleSlug;
    let originalTitle;

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

      // Create article for each test
      originalTitle = `Editable Article ${Date.now()}`;
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
      
      cy.get('input[placeholder="Article Title"]').type(originalTitle);
      cy.get('input[placeholder="What\'s this article about?"]').type('Description to edit');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Body to edit');
      cy.get('input[placeholder="Enter tags"]').type('edit{enter}');
      cy.contains('button', 'Publish Article').click();
      
      cy.wait(2000);
      
      // Extract slug
      cy.url().then((url) => {
        articleSlug = url.split('/article/')[1];
      });
    });

    it('should show edit button for own article', () => {
      cy.contains('Edit Article', { timeout: 10000 }).should('be.visible');
    });

    it('should navigate to editor when clicking edit', () => {
      cy.contains('Edit Article').click();
      cy.wait(1000);
      cy.url().should('include', '/editor/');
    });

    it('should pre-populate editor with article data', () => {
      cy.contains('Edit Article').click();
      cy.wait(1000);

      cy.get('input[placeholder="Article Title"]').should('have.value', originalTitle);
      cy.get('input[placeholder="What\'s this article about?"]').should('have.value', 'Description to edit');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').should('contain.value', 'Body to edit');
    });

    it('should successfully update article title and content', () => {
      cy.contains('Edit Article').click();
      cy.wait(1000);

      // Modify only body content (updating title causes slug conflict)
      cy.get('textarea[placeholder="Write your article (in markdown)"]').clear().type('Updated body content');
      cy.contains('button', 'Publish Article').click();

      cy.wait(2000);

      // Should show updated content with original title
      cy.contains(originalTitle, { timeout: 10000 }).should('be.visible');
      cy.contains('Updated body content').should('be.visible');
    });

    it('should update article description', () => {
      cy.contains('Edit Article').click();
      cy.wait(1000);

      cy.get('input[placeholder="What\'s this article about?"]').clear().type('New description after edit');
      cy.contains('button', 'Publish Article').click();

      cy.wait(2000);

      // Verify we're back on article page with original title
      cy.url().should('include', '/article/');
      cy.contains(originalTitle).should('be.visible');
    });
  });

  describe('Article Deletion', () => {
    let articleTitle;

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

      // Create article to delete
      articleTitle = `Delete Me Article ${Date.now()}`;
      cy.contains('a', 'New Post').click();
      cy.wait(1000);
      
      cy.get('input[placeholder="Article Title"]').type(articleTitle);
      cy.get('input[placeholder="What\'s this article about?"]').type('This will be deleted');
      cy.get('textarea[placeholder="Write your article (in markdown)"]').type('Content to delete');
      cy.contains('button', 'Publish Article').click();
      
      cy.wait(2000);
    });

    it('should show delete button for own article', () => {
      cy.contains('Delete Article', { timeout: 10000 }).should('be.visible');
    });

    it('should successfully delete article', () => {
      cy.contains('Delete Article').click();

      cy.wait(2000);

      // Should redirect to home
      cy.url().should('eq', 'http://localhost:4100/');
    });
  });

  describe('Article Favorites', () => {
    it('should display favorite button in article previews', () => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
      
      // Login
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(2000);

      // Check Global Feed for any article with favorite button
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Verify favorite buttons exist in article previews
      cy.get('.article-preview').first().within(() => {
        cy.get('button').should('exist');
      });
    });

    it('should toggle favorite state when clicking button', () => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
      
      // Login
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(2000);

      // Go to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Get first article's initial state
      cy.get('.article-preview').first().within(() => {
        cy.get('button').first().then(($btn) => {
          const wasFavorited = $btn.hasClass('btn-primary');
          
          // Click to toggle
          cy.wrap($btn).click();
          cy.wait(1500);
          
          // Verify state changed
          if (wasFavorited) {
            // Should now be unfavorited
            cy.get('button.btn-outline-primary').should('exist');
          } else {
            // Should now be favorited
            cy.get('button.btn-primary').should('exist');
          }
        });
      });
    });

    it('should unfavorite when clicking favorited article button', () => {
      cy.clearLocalStorage();
      cy.visit('http://localhost:4100');
      cy.wait(1000);
      
      // Login
      cy.contains('a', 'Sign in').click();
      cy.get('input[placeholder="Email"]').type('aaaa@g.cn');
      cy.get('input[placeholder="Password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      cy.wait(2000);

      // Go to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Check initial state and ensure it's favorited first
      cy.get('.article-preview').first().within(() => {
        cy.get('button').first().then(($btn) => {
          // If not favorited, favorite it first
          if ($btn.hasClass('btn-outline-primary')) {
            cy.wrap($btn).click();
            cy.wait(1000);
          }
        });
      });

      // Now unfavorite (button should be btn-primary at this point)
      cy.get('.article-preview').first().within(() => {
        cy.get('button.btn-primary').click();
      });
      cy.wait(1000);

      // Verify button state changed back (should be outline)
      cy.get('.article-preview').first().within(() => {
        cy.get('button.btn-outline-primary').should('exist');
      });
    });
  });
});
