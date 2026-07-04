describe("Sites - listing", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/sites");
  });

  it("shows the sites table with seeded sites", () => {
    cy.contains("Sites");
    cy.get("table").should("exist");
    cy.get("table tbody tr").its("length").should("be.gte", 1);
  });

  it("navigates to a site detail page when a site is clicked", () => {
    cy.get("table tbody tr").first().find("a").click();
    cy.url().should("match", /\/sites\/[0-9a-f-]+$/);
  });
});
