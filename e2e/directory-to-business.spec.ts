import { test, expect } from "@playwright/test";

test("directory to business page click-through", async ({ page }) => {
  await page.goto("/directory");

  const firstCard = page.locator("a[data-primary-category]").first();
  const businessName = await firstCard.locator("h3").innerText();
  await firstCard.click();

  await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);
  await expect(
    page.getByRole("heading", { level: 1, name: businessName }),
  ).toBeVisible();
  await expect(page.getByTestId("business-map")).toBeVisible();
});
