// ***********************************************************
// This support file is processed and loaded before test files
// ***********************************************************

// Import Cypress commands
import './commands'

// Disable uncaught exception handling for better test stability
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  return false
})
