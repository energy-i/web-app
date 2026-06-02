describe("Sign In", () => {
  beforeEach(() => {
    cy.visit("/sign-in");
  });

  it("shows validation errors with empty fields", () => {
    cy.get('button[type="submit"]').click();
    cy.get("#email:invalid").should("exist");
  });

  it("shows an error with invalid credentials", () => {
    cy.get("#email").type("wrong@example.com");
    cy.get("#password").type("wrongpassword");
    cy.get('button[type="submit"]').click();

    cy.get('[role="alert"]').should("be.visible");
  });

  it("signs in successfully with valid credentials", () => {
    cy.get("#email").type("admin@energycorp.com");
    cy.get("#password").type("password123");
    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
  });
});
