import { test, expect } from "@playwright/test";
import { makePng } from "../lib/moderation/make-png";

async function loginWithFreshPhone(page: import("@playwright/test").Page) {
  const phone = `+9477${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
  await page.goto("/login");
  const sendResponsePromise = page.waitForResponse("**/api/auth/otp/send");
  await page.getByLabel("Phone number").fill(phone);
  await page.getByRole("button", { name: "Send code" }).click();
  const sendResponse = await sendResponsePromise;
  const { devCode } = (await sendResponse.json()) as { devCode?: string };
  expect(devCode).toBeTruthy();
  await page.locator('input[inputmode="numeric"]').first().pressSequentially(devCode!);
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByRole("heading", { name: "What should we call you?" })).toBeVisible();
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await page.getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL("/");
  return phone;
}

test("Sinhala language pref translates the home headline", async ({ page, context }) => {
  await context.addCookies([
    { name: "lang_pref", value: "si", url: "http://localhost:3000" },
  ]);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "කොළඹ සුපිරි දේශීය ව්‍යාපාර සොයන්න" }),
  ).toBeVisible();
});

test("business page shows People also viewed and guests cannot open the report queue", async ({
  page,
}) => {
  await page.goto("/business/ministry-of-crab");
  await expect(page.getByRole("heading", { name: "People also viewed" })).toBeVisible();

  await page.goto("/moderation");
  await expect(page).toHaveURL(/\/login/);
});

test("review photos upload through the file picker and Top Rated rail appears", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/directory");
  await page.locator("a[data-primary-category]").first().click();
  await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);
  const slug = new URL(page.url()).pathname.split("/").pop()!;

  await loginWithFreshPhone(page);
  await page.goto(`/business/${slug}`);

  await page.getByRole("radio", { name: "Rate 5 stars" }).click();
  const reviewText =
    `File-upload review covering food, service, and the room so it clears the minimum. token-${Date.now().toString(36)}`;
  await page.getByLabel(/Your review/i).fill(reviewText);
  await page.getByLabel("Add photos").setInputFiles({
    name: "plate.png",
    mimeType: "image/png",
    buffer: makePng(400, 300),
  });
  await expect(page.getByRole("button", { name: "Add photos" })).toBeEnabled({ timeout: 15_000 });
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText("Thanks for your review!")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Top Rated this month" })).toBeVisible();
});

test("claimed owner can edit listing description", async ({ page }) => {
  test.setTimeout(90_000);
  await loginWithFreshPhone(page);
  await page.goto("/businesses/new");

  const stamp = Date.now().toString(36);
  await page.getByLabel("Name", { exact: true }).fill(`Owner Edit Cafe ${stamp}`);
  await page.getByLabel("Description").fill("A small cafe created so the owner can edit hours and copy.");
  await page.getByLabel("Address").fill("12 Test Lane, Colombo 07");
  const bizPhone = `077${Date.now().toString().slice(-7)}`;
  await page.getByLabel("Business phone").fill(bizPhone);

  const otpPromise = page.waitForResponse("**/api/listings/otp");
  await page.getByRole("button", { name: "Send verification code" }).click();
  const otpRes = await otpPromise;
  const { devCode } = (await otpRes.json()) as { devCode?: string };
  expect(devCode).toBeTruthy();
  await page.locator('input[inputmode="numeric"]').first().pressSequentially(devCode!);
  await page.getByRole("button", { name: "Verify and create listing" }).click();
  await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);

  await expect(page.getByRole("heading", { name: "Edit listing" })).toBeVisible();
  await page.getByLabel("Description").fill("Updated owner description with a patio and filter coffee.");
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(page.getByText("Listing updated.")).toBeVisible();
  await expect(page.getByRole("region", { name: "About" })).toContainText(
    "Updated owner description with a patio and filter coffee.",
  );
});
