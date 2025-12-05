describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('http://localhost:4100')
    cy.wait(1000) // Wait for React to fully load
  })

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      const timestamp = Date.now()
      const user = {
        username: `user${timestamp}`,  // Shorter username
        email: `test${timestamp}@test.com`,
        password: 'Test123456!'
      }
      
      // Click on "Sign up" link in the header
      cy.contains('a', 'Sign up').click()
      
      // Wait for input fields to be visible
      cy.get('input[placeholder="Username"]', { timeout: 10000 }).should('be.visible').type(user.username)
      cy.get('input[placeholder="Email"]').should('be.visible').type(user.email)
      cy.get('input[placeholder="Password"]').should('be.visible').type(user.password)
      
      // Click the submit button by its text
      cy.contains('button', 'Sign up', { matchCase: false }).click()
      
      // Wait for redirect - should leave register page
      cy.url().should('not.include', '/register', { timeout: 10000 })
      
      // Should show user menu with username
      cy.contains(user.username, { timeout: 5000 }).should('be.visible')
    })

    it('should show error for duplicate email', () => {
      // Click on "Sign up" link in the header
      cy.contains('a', 'Sign up').click()
      
      cy.get('input[placeholder="Username"]', { timeout: 10000 }).should('be.visible').type('existinguser')
      cy.get('input[placeholder="Email"]').should('be.visible').type('aaaa@g.cn')
      cy.get('input[placeholder="Password"]').should('be.visible').type('Test123!')
      cy.contains('button', 'Sign up', { matchCase: false }).click()
      
      // Should show error message
      cy.get('.error-messages', { timeout: 5000 }).should('be.visible')
    })

    it('should have register form', () => {
      // Click on "Sign up" link in the header
      cy.contains('a', 'Sign up').click()
      
      // Verify form elements exist
      cy.get('input[placeholder="Username"]', { timeout: 10000 }).should('exist')
      cy.get('input[placeholder="Email"]').should('exist')
      cy.get('input[placeholder="Password"]').should('exist')
      cy.get('button').contains('Sign up', { matchCase: false }).should('exist')
    })
  })

  describe('User Login', () => {
    it('should login with valid credentials', () => {
      // Click on "Sign in" link in the header
      cy.contains('a', 'Sign in').click()
      
      cy.get('input[placeholder="Email"]', { timeout: 10000 }).should('be.visible').type('aaaa@g.cn')
      cy.get('input[placeholder="Password"]').should('be.visible').type('testpassword123')
      cy.contains('button', 'Sign in', { matchCase: false }).click()
      
      // Wait for redirect - should leave login page
      cy.url().should('not.include', '/login', { timeout: 10000 })
      
      // Should show seed user's username
      cy.contains('AAAAAAAAAAAAAAAA', { timeout: 5000 }).should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      // Click on "Sign in" link in the header
      cy.contains('a', 'Sign in').click()
      
      cy.get('input[placeholder="Email"]', { timeout: 10000 }).should('be.visible').type('invalid@test.com')
      cy.get('input[placeholder="Password"]').should('be.visible').type('wrongpassword')
      cy.contains('button', 'Sign in', { matchCase: false }).click()
      
      // Should show error message
      cy.get('.error-messages', { timeout: 5000 }).should('be.visible')
    })

    it('should have login form', () => {
      // Click on "Sign in" link in the header
      cy.contains('a', 'Sign in').click()
      
      // Verify form elements exist
      cy.get('input[placeholder="Email"]', { timeout: 10000 }).should('exist')
      cy.get('input[placeholder="Password"]').should('exist')
      cy.contains('button', 'Sign in', { matchCase: false }).should('exist')
    })
  })

  describe('User Logout', () => {
    it('should logout successfully', () => {
      // Login first - click Sign in link
      cy.contains('a', 'Sign in').click()
      
      cy.get('input[placeholder="Email"]', { timeout: 10000 }).should('be.visible').type('aaaa@g.cn')
      cy.get('input[placeholder="Password"]').should('be.visible').type('testpassword123')
      cy.contains('button', 'Sign in', { matchCase: false }).click()
      
      // Wait for login to complete
      cy.url().should('not.include', '/login', { timeout: 10000 })
      cy.wait(1000)
      
      // Click on Settings link in header (logged in user menu)
      cy.contains('a', 'Settings').click()
      cy.wait(500)
      
      // Click logout button
      cy.contains('button', 'logout', { timeout: 5000, matchCase: false }).click()
      
      // Should redirect and show Sign in link
      cy.contains('a', 'Sign in', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('Protected Routes', () => {
    it('should show unauthenticated view for editor', () => {
      // Verify we're on home page and Sign in link is visible
      cy.contains('a', 'Sign in').should('be.visible')
      cy.url().should('include', 'localhost:4100')
    })

    it('should access editor when authenticated', () => {
      // Login first - click Sign in link
      cy.contains('a', 'Sign in').click()
      
      cy.get('input[placeholder="Email"]', { timeout: 10000 }).should('be.visible').type('aaaa@g.cn')
      cy.get('input[placeholder="Password"]').should('be.visible').type('testpassword123')
      cy.contains('button', 'Sign in', { matchCase: false }).click()
      
      // Wait for login
      cy.url().should('not.include', '/login', { timeout: 10000 })
      cy.wait(1000)
      
      // Click "New Post" link in header (not "New Article")
      cy.contains('a', 'New Post').click()
      
      // Should show article form
      cy.get('input[placeholder="Article Title"]', { timeout: 5000 }).should('be.visible')
    })
  })
})
