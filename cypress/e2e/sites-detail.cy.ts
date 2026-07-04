describe("Sites - detail (areas)", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/sites");
    cy.get("table tbody tr").first().find("a").click();
    cy.url().should("match", /\/sites\/[0-9a-f-]+$/);
  });

  it("shows the site name in the breadcrumb", () => {
    cy.get("nav").find('[aria-current="page"]').should("not.be.empty");
  });

  it("shows either the areas grid or an empty-state alert", () => {
    cy.get("body").then(($body) => {
      if ($body.find('[role="alert"]').length > 0) {
        cy.contains("No areas").should("be.visible");
      } else {
        cy.get('[data-slot="card"]').its("length").should("be.gte", 1);
        cy.contains(/appliance(s)?/i).should("exist");
      }
    });
  });
});
