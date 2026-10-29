import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 얼굴 캐릭터 만들기를 보여주고 사진을 고르기 전에는 시작할 수 없다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /산수 마을/ })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("얼굴 사진")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /모험 시작/ })).toBeDisabled();
});
