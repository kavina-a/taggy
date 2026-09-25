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
  await page.getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL("/");
}

test("upload photo, Q&A vote, and public collection share", async ({ page, browser }) => {
  test.setTimeout(90_000);

  await page.goto("/directory");
  await page.locator("a[data-primary-category]").first().click();
  await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);
  const slug = new URL(page.url()).pathname.split("/").pop()!;

  await loginWithFreshPhone(page);
  await page.goto(`/business/${slug}`);

  const caption = `Front door dusk ${Date.now().toString(36)}`;
  await page.getByLabel("Add a photo").setInputFiles({
    name: "front.png",
    mimeType: "image/png",
    buffer: makePng(400, 300),
  });
  await page.getByLabel("Caption (optional)").fill(caption);
  const upload = page.waitForResponse(`**/api/businesses/${slug}/photos`);
  await page.getByRole("button", { name: "Upload photo" }).click();
  expect((await upload).ok()).toBeTruthy();
  await expect(page.getByRole("img", { name: caption })).toBeVisible();

  const questionText = `Do they take walk-ins on Sundays ${Date.now().toString(36)}?`;
  await page.getByLabel("Ask a question").fill(questionText);
  const questionPost = page.waitForResponse(`**/api/businesses/${slug}/questions`);
  await page.getByRole("button", { name: "Post question" }).click();
  expect((await questionPost).ok()).toBeTruthy();
  await expect(page.getByRole("paragraph").filter({ hasText: questionText })).toBeVisible();

  const answerer = await browser.newContext();
  const answerPage = await answerer.newPage();
  await loginWithFreshPhone(answerPage);
  await answerPage.goto(`/business/${slug}`);
  const questionCard = answerPage.locator("li").filter({ hasText: questionText });
  await expect(questionCard.getByRole("paragraph").filter({ hasText: questionText })).toBeVisible();
  const answerText = `Yes until 2pm, later needs a booking ${Date.now().toString(36)}`;
  await questionCard.getByLabel("Your answer").fill(answerText);
  const answerPost = answerPage.waitForResponse("**/answers");
  await questionCard.getByRole("button", { name: "Post answer" }).click();
  expect((await answerPost).ok()).toBeTruthy();
  await expect(answerPage.getByRole("paragraph").filter({ hasText: answerText })).toBeVisible();
  await answerer.close();

  await page.reload();
  await expect(page.getByRole("paragraph").filter({ hasText: answerText })).toBeVisible();
  const useful = page
    .locator("li")
    .filter({ hasText: answerText })
    .getByRole("button", { name: /^Useful/ });
  await useful.click();
  await expect(useful).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /^Save$/ }).click();
  await page.getByRole("checkbox").first().click();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("button", { name: /^Saved$/ })).toBeVisible();

  await page.goto("/saved");
  await expect(page.getByRole("heading", { name: "Saved places", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My Saved Places", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Make public" }).click();
  const share = page.getByRole("link", { name: "Shareable link" });
  await expect(share).toBeVisible();
  await share.click();
  await expect(page.getByRole("heading", { name: "My Saved Places", exact: true })).toBeVisible();
});
