import { expect, test, type Page } from "@playwright/test";

const unique = (label: string) => `${label}+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function joinWaitlist(page: Page, name: string, email: string) {
  const form = page.locator("#waitlist form");
  await form.getByLabel("Full name").fill(name);
  await form.getByLabel("Email address").fill(email);
  await form.getByRole("button", { name: "Join the waitlist" }).click();
}

test("an invite link credits the inviter, end to end", async ({ browser }) => {
  // Inviter joins and gets a personal link.
  const inviterContext = await browser.newContext();
  await inviterContext.grantPermissions(["clipboard-read", "clipboard-write"]);
  const inviter = await inviterContext.newPage();
  await inviter.goto("/#waitlist");
  await joinWaitlist(inviter, "Inviter", unique("inviter"));

  await expect(inviter.getByText("Your place in line")).toBeVisible();
  await expect(inviter.getByText("No friends have joined yet")).toBeVisible();
  const linkInput = inviter.locator("#referral-link");
  await expect(linkInput).toHaveValue(/\?ref=[0-9A-Z]{8}#waitlist$/);
  const link = await linkInput.inputValue();

  await inviter.getByRole("button", { name: "Copy link" }).click();
  await expect(inviter.getByRole("button", { name: "Copied!" })).toBeVisible();

  // A friend opens the link in a different browser and joins.
  const friendContext = await browser.newContext();
  const friend = await friendContext.newPage();
  await friend.goto(link);
  await expect(friend.getByText("You’ve been invited to Clinora.")).toBeVisible();
  await joinWaitlist(friend, "Friend", unique("friend"));
  await expect(friend.getByText("You’re on the list, Friend.")).toBeVisible();
  // The friend's address bar no longer carries someone else's code.
  expect(new URL(friend.url()).searchParams.has("ref")).toBe(false);

  // The inviter sees the referral after refreshing their status…
  await inviter.getByRole("button", { name: "Refresh" }).click();
  await expect(inviter.getByText("1 friend joined")).toBeVisible();

  // …and again when they come back later on the same device.
  await inviter.reload();
  await expect(inviter.getByText("Welcome back — here’s your spot.")).toBeVisible();
  await expect(inviter.getByText("1 friend joined")).toBeVisible();

  await Promise.all([inviterContext.close(), friendContext.close()]);
});

test("a malformed invite code is ignored and never blocks joining", async ({ page }) => {
  await page.goto("/?ref=not-a-code#waitlist");
  await expect(page.getByText("You’ve been invited to Clinora.")).toHaveCount(0);
  await joinWaitlist(page, "Plain", unique("plain"));
  await expect(page.getByText("You’re on the list, Plain.")).toBeVisible();
});

test("the referral screen is fully translated and mirrored in Arabic", async ({ page, context }) => {
  await context.addCookies([{ name: "clinora_locale", value: "ar", url: "http://localhost:3100" }]);
  await page.goto("/#waitlist");
  const form = page.locator("#waitlist form");
  await form.getByLabel("الاسم الكامل").fill("Rania");
  await form.getByLabel("البريد الإلكتروني").fill(unique("rania"));
  await form.getByRole("button", { name: "انضم إلى قائمة الانتظار" }).click();

  await expect(page.getByText("ترتيبك في القائمة")).toBeVisible();
  await expect(page.getByText("لم ينضم أي صديق بعد")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  // The link itself stays left-to-right inside the Arabic page.
  await expect(page.locator("#referral-link")).toHaveAttribute("dir", "ltr");
});
