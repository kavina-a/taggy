import { test, expect } from "@playwright/test";

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
  await page.getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL("/");
}

test("vote, report, claim, and owner response on a business page", async ({ page, browser }) => {
  test.setTimeout(90_000);
  let slug: string | null = null;
  await page.goto("/directory");
  const cardCount = await page.locator("a[data-primary-category]").count();
  for (let i = 0; i < Math.min(cardCount, 20); i += 1) {
    await page.goto("/directory");
    await page.locator("a[data-primary-category]").nth(i).click();
    await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);
    if ((await page.getByRole("link", { name: "Log in to claim" }).count()) > 0) {
      slug = new URL(page.url()).pathname.split("/").pop()!;
      break;
    }
  }
  if (!slug) {
    throw new Error("No unclaimed listing found in the first 20 directory cards");
  }

  await loginWithFreshPhone(page);
  await page.goto(`/business/${slug}`);

  const uniqueToken = Date.now().toString(36);
  const reviewText =
    `A detailed first-hand visit writeup for the voting flow, covering food ` +
    `service and atmosphere with enough length. token-${uniqueToken}`;
  await page.getByRole("radio", { name: "Rate 5 stars" }).click();
  await page.getByLabel(/Your review/i).fill(reviewText);
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText("Thanks for your review!")).toBeVisible();

  const voterContext = await browser.newContext();
  const voterPage = await voterContext.newPage();
  await loginWithFreshPhone(voterPage);
  await voterPage.goto(`/business/${slug}`);

  const reviewLocator = voterPage.getByText(reviewText);
  if ((await reviewLocator.count()) === 0) {
    await voterPage.getByRole("button", { name: /review.*not currently recommended/i }).click();
  }
  await expect(voterPage.getByText(reviewText)).toBeVisible();

  const usefulButton = voterPage
    .locator("[data-slot=card]")
    .filter({ hasText: reviewText })
    .getByRole("button", { name: /^Useful/ });
  await usefulButton.click();
  await expect(usefulButton).toHaveAttribute("aria-pressed", "true");

  await voterPage
    .locator("[data-slot=card]")
    .filter({ hasText: reviewText })
    .getByRole("button", { name: "Report review" })
    .click();
  await voterPage.getByLabel("Offensive").check();
  await voterPage.getByRole("button", { name: "Submit report" }).click();
  await expect(voterPage.getByText("Thanks. We received your report.")).toBeVisible();
  await voterPage.keyboard.press("Escape");
  await expect(voterPage.getByText("Thanks. We received your report.")).toHaveCount(0);

  const claimSend = voterPage.waitForResponse("**/claim/send");
  await voterPage.getByRole("button", { name: "Claim this listing" }).click();
  const claimSendRes = await claimSend;
  const { devCode } = (await claimSendRes.json()) as { devCode?: string };
  expect(devCode).toBeTruthy();
  await voterPage.locator('input[inputmode="numeric"]').first().pressSequentially(devCode!);
  await voterPage.getByRole("button", { name: "Verify and claim" }).click();
  await expect(
    voterPage.getByText("You are the verified owner of this listing."),
  ).toBeVisible();

  await voterPage
    .locator("[data-slot=card]")
    .filter({ hasText: reviewText })
    .getByLabel("Response from the owner")
    .fill("Thanks for coming in — see you soon.");
  await voterPage
    .locator("[data-slot=card]")
    .filter({ hasText: reviewText })
    .getByRole("button", { name: "Post response" })
    .click();
  await expect(voterPage.getByText("Thanks for coming in — see you soon.")).toBeVisible();

  await voterContext.close();
});
