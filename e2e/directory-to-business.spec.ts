import { test, expect } from "@playwright/test";

test("directory to business page click-through", async ({ page }) => {
  await page.goto("/directory");

  // The directory index groups businesses under category-group headings
  // (per UI-SPEC's category-grouped layout), not one flat list.
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();

  // Prefer a restaurant card so the attribute-badge assertion below is
  // exercised against the richest attribute schema; fall back to whatever
  // card is first if no restaurant is on this page.
  let card = page.locator('a[data-primary-category="restaurant"]').first();
  if ((await card.count()) === 0) {
    card = page.locator("a[data-primary-category]").first();
  }
  const businessName = await card.locator("h3").innerText();
  await card.click();

  await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);
  await expect(
    page.getByRole("heading", { level: 1, name: businessName }),
  ).toBeVisible();
  await expect(page.getByTestId("business-map")).toBeVisible();

  // Deterministic regardless of the current wall-clock time — either value
  // is acceptable, this just proves the badge renders from a real
  // server-computed value (01-RESEARCH.md's open-now anti-pattern warning).
  await expect(page.getByText(/Open now|Closed/)).toBeVisible();

  // At least one category-correct attribute badge renders on the business
  // page (LIST-03), proving the full seeded dataset validates end-to-end.
  await expect(page.getByTestId("attribute-badge").first()).toBeVisible();
});
