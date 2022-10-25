import user from "../../fixtures/user.json";

describe("Smoke test -- upload page", () => {
  beforeEach(() => {
    localStorage.setItem("HAS_REQUESTED_BROWSER_PUSH_PERMISSION", "true");
  });

  it("should load upload page when visited", () => {
    const base64Entropy = Buffer.from(user.entropy).toString("base64");
    cy.visit(`trending?login=${base64Entropy}`);

    cy.findByText(user.name, { timeout: 10000 }).should("exist");

    cy.visit("upload");

    cy.findByRole("heading", { name: /upload tracks/i, level: 1 }).should(
      "exist"
    );
  });
});
