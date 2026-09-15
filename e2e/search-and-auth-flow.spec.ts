import { test, expect } from "@playwright/test";

// One continuous smoke path proving every Phase 2 vertical slice composes
// correctly: home -> search -> filter -> business page -> phone-OTP login ->
// logged-in header state. `devCode` (only present when NODE_ENV !==
// "production") lets this run against the real send/verify backend with no
// SMS provider (D-03).
// A fresh phone number every run — reusing a fixed one would hit an
// already-signed-up User on a re-run (hasSeenProfilePrompt: true already
// persisted), skipping the exact "logged-in header" step this test proves.
const TEST_PHONE = `+9477${Date.now().toString().slice(-7)}`;

test("home -> search -> filter -> business page -> OTP login -> logged-in header", async ({
  page,
}) => {
  // 1. Start at the home page and submit a free-text query via the SearchBar.
  await page.goto("/");
  await page.getByLabel("What are you looking for?").fill("cafe");
  await page.getByRole("button", { name: "Search" }).click();

  // 2. Land on /search, confirm at least one ranked result card is visible.
  await expect(page).toHaveURL(/\/search\?find_desc=cafe/);
  await expect(page.locator('a[data-primary-category]').first()).toBeVisible();
  const initialCount = await page.getByText(/^\d+ results/).first().innerText();

  // 3. Apply one filter (a category checkbox) and confirm the result set
  // updates (narrows from the unfiltered "cafe" query).
  await page.getByRole("checkbox", { name: "Cafes & Bakeries" }).check();
  await expect(async () => {
    const updatedCount = await page.getByText(/^\d+ results/).first().innerText();
    expect(updatedCount).not.toBe(initialCount);
  }).toPass();

  // 4. Click into a result's business page and confirm it renders (name,
  // hours badge, attribute badge — reusing Phase 1's proven assertions).
  const card = page.locator('a[data-primary-category]').first();
  const businessName = await card.locator("h3").innerText();
  await card.click();

  await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);
  await expect(
    page.getByRole("heading", { level: 1, name: businessName }),
  ).toBeVisible();
  await expect(page.getByText(/Open now|Closed/)).toBeVisible();
  await expect(page.getByTestId("attribute-badge").first()).toBeVisible();

  // 5. Navigate to /login via the header's "Log in" CTA (exact: true since
  // Phase 3 added a second, business-page-scoped "Log in to write a
  // review" link whose accessible name also contains "Log in").
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL("/login");

  // 6. Submit a test phone number, reading the devCode the send call
  // returns (dev-mode transport, no real SMS provider — D-03).
  const sendResponsePromise = page.waitForResponse("**/api/auth/otp/send");
  await page.getByLabel("Phone number").fill(TEST_PHONE);
  await page.getByRole("button", { name: "Send code" }).click();
  const sendResponse = await sendResponsePromise;
  const { devCode } = (await sendResponse.json()) as { devCode?: string };
  expect(devCode).toBeTruthy();

  // 7. Enter that code on the OTP-entry step.
  await expect(
    page.getByRole("heading", { level: 1, name: "Enter the code" }),
  ).toBeVisible();
  await page.locator('input[inputmode="numeric"]').first().pressSequentially(devCode!);
  await page.getByRole("button", { name: "Verify" }).click();

  // 8. Dismiss the progressive-profile dialog via "Skip for now".
  await expect(
    page.getByRole("heading", { name: "What should we call you?" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Skip for now" }).click();

  // 9. The header now shows the logged-in avatar/dropdown instead of "Log in".
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
});
