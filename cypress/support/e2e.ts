// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Next.js server actions signal a redirect by throwing an error whose digest
// starts with "NEXT_REDIRECT". The client router listens for this to perform
// the navigation, so it is expected behaviour — not a real test failure.
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message?.includes("NEXT_REDIRECT") ||
    // Some Next.js versions expose the digest on the error object instead of the message
    (err as Error & { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
  ) {
    return false;
  }
});
