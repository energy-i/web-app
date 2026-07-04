describe("Sites - create", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/sites/new");
  });

  it("renders the create site form", () => {
    cy.contains("Create a new site");
    cy.get("#name").should("exist");
    cy.get("#addressLine1").should("exist");
    cy.get("#city").should("exist");
    cy.get("#postcode").should("exist");
    cy.get("#sector").should("exist");
    cy.get("#area").should("exist");
    cy.get("#eac").should("exist");
  });

  it("shows validation errors when required fields are empty", () => {
    cy.get('button[type="submit"]').click();

    cy.contains("Name is required").should("be.visible");
    cy.contains("Address is required").should("be.visible");
    cy.contains("City is required").should("be.visible");
    cy.contains("Postcode is required").should("be.visible");
    cy.url().should("include", "/sites/new");
  });

  it("returns to the sites listing when cancel is clicked", () => {
    cy.contains("button", "Cancel").click();
    cy.url().should("match", /\/sites$/);
  });

  it("creates a new site and redirects to the site detail page", () => {
    const uniqueName = `Cypress Site ${Date.now()}`;

    cy.get("#name").type(uniqueName);
    cy.get("#addressLine1").type("1 Example Street");
    cy.get("#city").type("Testville");
    cy.get("#postcode").type("TE1 1ST");
    cy.get("#sector").type("Office");
    cy.get("#area").type("1234");
    cy.get("#eac").type("56789");

    cy.get('button[type="submit"]').click();

    cy.url().should("match", /\/sites\/[0-9a-f-]+$/);
    cy.contains(uniqueName).should("be.visible");
  });
});
