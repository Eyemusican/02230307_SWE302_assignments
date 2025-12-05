// ***********************************************
// Custom Cypress Commands for RealWorld App
// ***********************************************

// Generate unique test data
Cypress.Commands.add('generateTestUser', () => {
  const timestamp = Date.now()
  const user = {
    username: `testuser_${timestamp}`,
    email: `testuser_${timestamp}@test.com`,
    password: 'Test123456!'
  }
  return user
})

// Register a new user
Cypress.Commands.add('register', (username, email, password) => {
  cy.visit('/#/register')
  cy.get('input[type="text"]').type(username)
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/#/login')
  cy.get('input[placeholder="Email"]').type(email)
  cy.get('input[placeholder="Password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.wait(1000) // Wait for redirect
})

// Login via API (faster for setup)
Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/users/login`,
    body: {
      user: {
        email: email,
        password: password
      }
    }
  }).then((response) => {
    window.localStorage.setItem('jwt', response.body.user.token)
  })
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('a[href="/#/settings"]').click()
  cy.contains('button', 'Or click here to logout').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

// Create article command
Cypress.Commands.add('createArticle', (title, description, body, tags = '') => {
  cy.visit('/#/editor')
  cy.get('input[placeholder="Article Title"]').type(title)
  cy.get('input[placeholder="What\'s this article about?"]').type(description)
  cy.get('textarea[placeholder="Write your article (in markdown)"]').type(body)
  if (tags) {
    cy.get('input[placeholder="Enter tags"]').type(tags)
  }
  cy.get('button[type="submit"]').click()
})

// Delete article command
Cypress.Commands.add('deleteArticle', () => {
  cy.contains('button', 'Delete Article').click()
})

// Add comment command
Cypress.Commands.add('addComment', (commentText) => {
  cy.get('textarea[placeholder="Write a comment..."]').type(commentText)
  cy.contains('button', 'Post Comment').click()
})

// Delete comment command
Cypress.Commands.add('deleteComment', (commentText) => {
  cy.contains('.card', commentText)
    .find('.mod-options')
    .find('i.ion-trash-a')
    .click()
})

// Favorite article command
Cypress.Commands.add('favoriteArticle', () => {
  cy.get('button').contains('Favorite Article').click()
})

// Follow user command
Cypress.Commands.add('followUser', (username) => {
  cy.visit(`/#/@${username}`)
  cy.contains('button', 'Follow').click()
})

// Note: clearLocalStorage is already a built-in Cypress command, no need to override
