import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("renders the hero and core sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Walk into every appointment");
    await expect(page.getByRole("article", { name: "Visit brief" })).toBeVisible();
    await expect(page.locator("#how-it-works")).toBeAttached();
    await expect(page.locator("#product")).toBeAttached();
    await expect(page.locator("#waitlist")).toBeAttached();
  });

  test("joins the waitlist, then reports a duplicate", async ({ page }) => {
    const email = `e2e+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
    await page.goto("/#waitlist");

    const form = page.locator("#waitlist form");
    await form.getByLabel("Full name").fill("E2E Tester");
    await form.getByLabel("Email address").fill(email);
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(page.getByText("You’re on the list, E2E Tester.")).toBeVisible();
    await expect(page.getByText("Your place in line")).toBeVisible();

    await page.getByRole("button", { name: "Not you? Join with another email" }).click();
    await form.getByLabel("Full name").fill("E2E Again");
    await form.getByLabel("Email address").fill(email.toUpperCase());
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(page.getByText("You’re already on the list.")).toBeVisible();
  });

  test("shows inline validation errors", async ({ page }) => {
    await page.goto("/#waitlist");
    const form = page.locator("#waitlist form");
    await form.getByLabel("Email address").fill("not-an-email");
    await form.getByRole("button", { name: "Join the waitlist" }).click();

    await expect(form.getByText("Please enter your name.")).toBeVisible();
    await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(form.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  });
});

test.describe("English / Arabic", () => {
  test("switches the whole document to RTL Arabic and remembers it", async ({ page }) => {
    await page.goto("/");
    await page.locator('button[lang="ar"]').first().click();

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("ادخل كل موعد طبي");

    // The choice is stored in a cookie, so the server renders RTL on the next request.
    await page.reload();
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(page.locator('button[lang="ar"]').first()).toHaveAttribute("aria-pressed", "true");
  });

  test("shows validation messages in Arabic", async ({ page, context }) => {
    await context.addCookies([{ name: "clinora_locale", value: "ar", url: "http://localhost:3100" }]);
    await page.goto("/#waitlist");

    const form = page.locator("#waitlist form");
    await form.getByRole("button", { name: "انضم إلى قائمة الانتظار" }).click();
    await expect(form.getByText("يرجى إدخال اسمك.")).toBeVisible();
  });

  test("has no horizontal overflow in either direction", async ({ page, context }) => {
    for (const locale of ["en", "ar"]) {
      await context.addCookies([{ name: "clinora_locale", value: locale, url: "http://localhost:3100" }]);
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `overflow in ${locale}`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("auth & routing", () => {
  test("redirects signed-out visitors from /dashboard to sign-up", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("GET /api/me requires a session", async ({ request }) => {
    const response = await request.get("/api/me");
    expect(response.status()).toBe(401);
  });

  test("unknown routes show the branded 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn’t find that page" })).toBeVisible();
  });
});
