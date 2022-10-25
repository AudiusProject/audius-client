interface Window {
  audio: { paused: boolean };
}

describe("Play Track", () => {
  it("should play a trending track", () => {
    cy.visit("trending");
    cy.findByRole("list", { name: /weekly trending tracks/i }).within(() => {
      cy.findAllByRole("listitem").first().click("left");
    });

    cy.findByRole("button", { name: /track loading/i, timeout: 20000 }).should(
      "be.disabled"
    );
    cy.findByRole("button", {
      name: /pause track/i,
      timeout: 20000,
    }).should("exist");
    cy.window().its("audio.paused").should("equal", false);
    cy.findByRole("button", {
      name: /pause track/i,
    }).click();
    cy.findByRole("button", { name: /play track/i }).should("exist");
    cy.window().its("audio.paused").should("equal", true);
  });
});
