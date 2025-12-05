describe('Profile and Feed Management', () => {
  
  describe('User Profile', () => {
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

    it('should display user profile page', () => {
      // Navigate to own profile
      cy.contains('a', 'AAAAAAAAAAAAAAAA').click();
      cy.wait(1000);

      // Check profile information is displayed
      cy.get('.user-info').should('be.visible');
      cy.get('.user-info').should('contain', 'AAAAAAAAAAAAAAAA');
    });

    it('should display My Articles tab', () => {
      cy.contains('a', 'AAAAAAAAAAAAAAAA').click();
      cy.wait(1000);

      // Check that My Articles tab exists and is active
      cy.contains('a', 'My Articles').should('have.class', 'active');
    });

    it('should display Favorited Articles tab', () => {
      cy.contains('a', 'AAAAAAAAAAAAAAAA').click();
      cy.wait(1000);

      // Click Favorited Articles tab
      cy.contains('a', 'Favorited Articles').click();
      cy.wait(1000);

      // Check that Favorited Articles tab is now active
      cy.contains('a', 'Favorited Articles').should('have.class', 'active');
    });

    it('should show edit profile button for own profile', () => {
      cy.contains('a', 'AAAAAAAAAAAAAAAA').click();
      cy.wait(1000);

      // Check for edit profile button
      cy.contains('a', 'Edit Profile Settings').should('be.visible');
    });

    it('should navigate to settings when clicking Edit Profile Settings', () => {
      cy.contains('a', 'AAAAAAAAAAAAAAAA').click();
      cy.wait(1000);

      cy.contains('a', 'Edit Profile Settings').click();
      cy.wait(1000);

      // Should be on settings page
      cy.url().should('include', '/settings');
    });
  });

  describe('Follow/Unfollow Users', () => {
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

      // Navigate to Global Feed to find another user's article
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);
    });

    it('should show follow button on other user profile', () => {
      // Get the first article's author
      cy.get('.article-preview').first().find('.info a.author').invoke('text').then((author) => {
        // Skip test if it's our own article (Global Feed might only have our articles)
        if (author.trim() === 'AAAAAAAAAAAAAAAA') {
          cy.log('Skipping: First article is by current user');
          return;
        }

        // Click on the article author
        cy.get('.article-preview').first().find('.info a.author').click();
        cy.wait(1000);
        
        // Check if follow/unfollow button exists
        cy.get('.user-info').within(() => {
          cy.get('button').should('exist');
        });
      });
    });

    it('should toggle follow status when clicking follow button', () => {
      // Find an article not by us
      cy.get('.article-preview').each(($article) => {
        cy.wrap($article).find('.info a').first().invoke('text').then((author) => {
          if (author.trim() !== 'AAAAAAAAAAAAAAAA') {
            cy.wrap($article).find('.info a').first().click();
            cy.wait(1000);

            // Get initial follow button state
            cy.get('.user-info button').first().invoke('text').then((buttonText) => {
              const isFollowing = buttonText.includes('Unfollow');
              
              // Click the button
              cy.get('.user-info button').first().click();
              cy.wait(1000);

              // Check that button text changed
              if (isFollowing) {
                cy.get('.user-info button').first().should('contain', 'Follow');
              } else {
                cy.get('.user-info button').first().should('contain', 'Unfollow');
              }
            });

            return false; // Break the loop
          }
        });
      });
    });
  });

  describe('User Settings', () => {
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

      // Navigate to settings
      cy.contains('a', 'Settings').click();
      cy.wait(1000);
    });

    it('should display settings form', () => {
      cy.get('input[placeholder="URL of profile picture"]').should('be.visible');
      cy.get('input[placeholder="Username"]').should('be.visible');
      cy.get('textarea[placeholder="Short bio about you"]').should('be.visible');
      cy.get('input[placeholder="Email"]').should('be.visible');
      cy.get('input[placeholder="New Password"]').should('be.visible');
    });

    it('should have pre-populated user information', () => {
      cy.get('input[placeholder="Username"]').should('have.value', 'AAAAAAAAAAAAAAAA');
      cy.get('input[placeholder="Email"]').should('have.value', 'aaaa@g.cn');
    });

    it('should update user bio', () => {
      const newBio = `Updated bio ${Date.now()}`;
      
      cy.get('textarea[placeholder="Short bio about you"]').clear().type(newBio);
      cy.contains('button', 'Update Settings').click();
      cy.wait(1000);

      // Should redirect to home page after successful update
      cy.url().should('eq', 'http://localhost:4100/');
      
      // Navigate to profile to verify bio is updated
      cy.contains('a', 'AAAAAAAAAAAAAAAA').click();
      cy.wait(1000);
      cy.get('.user-info').should('contain', newBio);
    });

    it('should display logout button', () => {
      cy.contains('button', 'Or click here to logout').should('be.visible');
    });

    it('should logout when clicking logout button', () => {
      cy.contains('button', 'Or click here to logout').click();
      cy.wait(1000);

      // Should redirect to home and show Sign in link
      cy.url().should('eq', 'http://localhost:4100/');
      cy.contains('a', 'Sign in').should('be.visible');
    });
  });

  describe('Feed Navigation', () => {
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

    it('should switch between Your Feed and Global Feed', () => {
      // Should start on Your Feed
      cy.contains('a', 'Your Feed').should('have.class', 'active');

      // Switch to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);
      cy.contains('a', 'Global Feed').should('have.class', 'active');

      // Switch back to Your Feed
      cy.contains('a', 'Your Feed').click();
      cy.wait(1000);
      cy.contains('a', 'Your Feed').should('have.class', 'active');
    });

    it('should filter articles by tag', () => {
      // Go to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Click on a tag
      cy.get('.tag-list a').first().click();
      cy.wait(1000);

      // Should show a third tab with the tag filter (has active class)
      cy.get('.feed-toggle .nav-item').should('have.length', 3);
      cy.get('.feed-toggle .nav-item').eq(2).find('a').should('have.class', 'active');
    });

    it('should display articles in feed', () => {
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Should show article previews
      cy.get('.article-preview').should('have.length.greaterThan', 0);
    });

    it('should navigate to article when clicking on title', () => {
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);

      // Click on first article
      cy.get('.article-preview').first().find('h1').click();
      cy.wait(1000);

      // Should be on article page
      cy.url().should('include', '/article/');
    });
  });

  describe('Article Interactions from Feed', () => {
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

      // Go to Global Feed
      cy.contains('a', 'Global Feed').click();
      cy.wait(1000);
    });

    it('should show favorite button on article preview', () => {
      cy.get('.article-preview').first().within(() => {
        cy.get('button').should('exist');
      });
    });

    it('should display article metadata in preview', () => {
      cy.get('.article-preview').first().within(() => {
        cy.get('.info').should('be.visible');
        cy.get('.info a').should('be.visible'); // Author
        cy.get('.date').should('be.visible'); // Date
      });
    });

    it('should navigate to author profile when clicking author', () => {
      cy.get('.article-preview').first().within(() => {
        cy.get('.info a').first().invoke('text').then((author) => {
          cy.get('.info a').first().click();
          cy.wait(1000);
          
          // Should be on author's profile
          cy.url().should('include', '/@');
        });
      });
    });
  });
});
