import { test, expect } from "@playwright/test";

// AUTH-02 / CONTEXT.md D-05 regression net — the single most important thing
// to catch this phase: no feature built in Phase 2 actually requires login,
// so none of these pages should ever redirect a guest or render an auth-wall
// placeholder in its place. Playwright gives every test a fresh, cookie-less
// browser context by default — no login happens anywhere in this file.

const KNOWN_SLUG = "ministry-of-crab";

test("guest can reach and see real content on every Phase 2 page with zero login prompts", async ({
  page,
}) => {
  // 1. Home page (02-07)
  await page.goto("/");
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Find great local businesses in Colombo" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();

  // 2. /search with no params (02-04/02-08)
  await page.goto("/search");
  await expect(page).toHaveURL("/search");
  await expect(
    page
      .locator('a[data-primary-category]')
      .first()
      .or(page.getByRole("heading", { level: 2, name: "No matches found" })),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();

  // 3. /search with a free-text query (02-04/02-08)
  await page.goto("/search?find_desc=cafe");
  await expect(page).toHaveURL("/search?find_desc=cafe");
  await expect(
    page
      .locator('a[data-primary-category]')
      .first()
      .or(page.getByRole("heading", { level: 2, name: "No matches found" })),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();

  // 4. A known seeded business page (Phase 1, unchanged)
  await page.goto(`/business/${KNOWN_SLUG}`);
  await expect(page).toHaveURL(`/business/${KNOWN_SLUG}`);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();

  // 5. /login itself (02-05) — the phone-entry heading is the real page
  // content; the header's own "Log in" CTA also stays visible here since
  // the session is still genuinely unauthenticated throughout.
  await page.goto("/login");
  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: "Log in or sign up" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();
});
