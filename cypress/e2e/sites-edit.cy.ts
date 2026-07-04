describe("Sites - edit", () => {
  let siteId: string;

  beforeEach(() => {
    cy.login();

    // Grab the first site's id from the listing page so we have a stable target
    cy.visit("/sites");
    cy.get("table tbody tr")
      .first()
      .find("a")
      .invoke("attr", "href")
      .then((href) => {
        expect(href).to.match(/\/sites\/[0-9a-f-]+$/);
        siteId = href!.split("/").pop()!;
        cy.visit(`/sites/${siteId}/edit`);
      });
  });

  it("renders the edit form pre-populated with the site details", () => {
    cy.contains("Edit site");
    cy.get("#name").should("not.have.value", "");
    cy.get("#addressLine1").should("not.have.value", "");
    cy.get("#city").should("not.have.value", "");
    cy.get("#postcode").should("not.have.value", "");
  });

  it("shows a validation error when a required field is cleared", () => {
    cy.get("#name").clear();
    cy.get('button[type="submit"]').click();

    cy.contains("Name is required").should("be.visible");
    cy.url().should("include", "/edit");
  });

  it("returns to the site detail page when cancel is clicked", () => {
    cy.contains("button", "Cancel").click();
    cy.url().should("match", /\/sites\/[0-9a-f-]+$/);
    cy.url().should("not.include", "/edit");
  });

  it("saves changes and reflects the new site name after redirect", () => {
    const newName = `Renamed Site ${Date.now()}`;

    cy.get("#name").clear();
    cy.get("#name").type(newName);
    cy.get('button[type="submit"]').click();

    cy.url().should("match", /\/sites\/[0-9a-f-]+$/);
    cy.url().should("not.include", "/edit");
    cy.contains(newName).should("be.visible");
  });
});
