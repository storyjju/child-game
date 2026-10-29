import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 사진을 고르기 전에는 시작할 수 없다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("산수 마을의 모험");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "산수 마을"
  );
  await expect(page.getByRole("button", { name: /모험 시작/ })).toBeDisabled();
});
