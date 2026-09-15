import { test, expect } from "@playwright/test";

// A fresh phone number every run so this user has never reviewed the
// target business before (reusing a fixed number would hit REV-01's
// one-review-per-user-per-business 409 on a re-run) — same convention as
// e2e/search-and-auth-flow.spec.ts.
const TEST_PHONE = `+9477${Date.now().toString().slice(-7)}`;

test("guest login prompt -> OTP login -> write review -> edit review, respecting REV-03 secrecy", async ({
  page,
}) => {
  // 1. Land on a real business page via the directory (same click-through
  // as e2e/directory-to-business.spec.ts).
  await page.goto("/directory");
  const card = page.locator("a[data-primary-category]").first();
  await card.click();
  await expect(page).toHaveURL(/\/business\/[a-z0-9-]+/);
  const slug = new URL(page.url()).pathname.split("/").pop()!;

  // 2. Guest sees a login prompt, never the composer.
  await expect(
    page.getByRole("link", { name: /Log in to write a review/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit review" })).toHaveCount(0);

  // 3. Log in via the existing phone-OTP dev-mode flow (D-03 — no real SMS
  // provider), reused rather than any second auth UI (D-05).
  await page.getByRole("link", { name: /Log in to write a review/i }).click();
  await expect(page).toHaveURL("/login");

  const sendResponsePromise = page.waitForResponse("**/api/auth/otp/send");
  await page.getByLabel("Phone number").fill(TEST_PHONE);
  await page.getByRole("button", { name: "Send code" }).click();
  const sendResponse = await sendResponsePromise;
  const { devCode } = (await sendResponse.json()) as { devCode?: string };
  expect(devCode).toBeTruthy();

  await expect(
    page.getByRole("heading", { level: 1, name: "Enter the code" }),
  ).toBeVisible();
  await page.locator('input[inputmode="numeric"]').first().pressSequentially(devCode!);
  await page.getByRole("button", { name: "Verify" }).click();

  await expect(
    page.getByRole("heading", { name: "What should we call you?" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Skip for now" }).click();
  await expect(page).toHaveURL("/");

  // 4. Return to the same business page, now logged in.
  await page.goto(`/business/${slug}`);
  await expect(page.getByRole("button", { name: "Submit review" })).toBeVisible();

  // 5. Write a review — rating first (REV-01's required ordering), then
  // text meeting the 50-char minimum. Text carries a unique base36 token
  // (NOT Date.now()'s raw digits — a 13-digit run trips MOD-01's card-like
  // PII guard, lib/moderation/classify-content.ts's CARD_REGEX) so it can
  // be located after reload without assuming which outcome bucket the
  // REV-03 filter assigns it to.
  const uniqueToken = Date.now().toString(36);
  const reviewText =
    `This is a genuine account of visiting the business earlier today, ` +
    `the overall experience was solid and worth sharing in detail. token-${uniqueToken}`;

  await page.getByRole("radio", { name: "Rate 4 stars" }).click();
  await page.getByLabel(/Your review/i).fill(reviewText);
  await page.getByRole("button", { name: "Submit review" }).click();

  // 6. Same generic confirmation is shown no matter what the (never
  // revealed) visibility_status outcome is — spec 6.3 / REV-03.
  await expect(page.getByText("Thanks for your review!")).toBeVisible();

  // 7. Reload for a fresh SSR fetch and confirm the review is reachable —
  // EITHER directly in the main (recommended) list, OR via the "not
  // currently recommended" disclosure link, whichever REV-03 actually
  // assigned. Never assume a fixed outcome (REV-04: never hidden, always
  // reachable through one path or the other).
  await page.reload();
  if ((await page.getByText(reviewText).count()) === 0) {
    const disclosureButton = page.getByRole("button", {
      name: /review.*not currently recommended/i,
    });
    await expect(disclosureButton).toBeVisible();
    await disclosureButton.click();
    await expect(page.getByText(reviewText)).toBeVisible();
  } else {
    await expect(page.getByText(reviewText).first()).toBeVisible();
  }

  // 8. Editing: the composer collapses to an "Edit your review" affordance
  // once an existing review is loaded, and the review card's own "Edit"
  // link scrolls to the same composer section.
  await expect(page.getByRole("link", { name: "Edit" }).first()).toHaveAttribute(
    "href",
    "#write-a-review",
  );
  await page.getByRole("button", { name: "Edit your review" }).click();
  await expect(page.getByRole("radio", { name: "Rate 4 stars" })).toHaveAttribute(
    "aria-checked",
    "true",
  );

  const editedToken = Date.now().toString(36);
  const editedText =
    `Updating my review after a second visit, still a genuine and detailed ` +
    `account worth sharing with other readers here. token-${editedToken}`;
  await page.getByLabel(/Your review/i).fill(editedText);
  await page.getByRole("button", { name: "Submit review" }).click();
  await expect(page.getByText("Thanks for your review!")).toBeVisible();

  await page.reload();
  if ((await page.getByText(editedText).count()) === 0) {
    const disclosureButton = page.getByRole("button", {
      name: /review.*not currently recommended/i,
    });
    await expect(disclosureButton).toBeVisible();
    await disclosureButton.click();
    await expect(page.getByText(editedText)).toBeVisible();
  } else {
    await expect(page.getByText(editedText).first()).toBeVisible();
  }
});
