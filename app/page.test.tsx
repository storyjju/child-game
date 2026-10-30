import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";

import Home from "@/app/page";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

test("홈 화면은 얼굴 캐릭터 만들기를 보여주고 사진을 고르기 전에는 사진으로 시작할 수 없다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /산수 마을/ })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("얼굴 사진")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /모험 시작/ })).toBeDisabled();
});

test("사진을 올릴 수 없어도 기본 캐릭터로 바로 시작할 수 있고 첫 마을은 산수 마을이다", () => {
  render(<Home />);

  const start = screen.getByRole("button", { name: /기본 캐릭터로 시작/ });
  expect(start).toBeEnabled();

  fireEvent.click(start);

  expect(
    screen.getByRole("heading", { level: 2, name: "산수 마을" })
  ).toBeInTheDocument();
});

test("동물 표시 여섯 개 중 첫 번째가 선택되어 있고 다른 표시를 고를 수 있다", () => {
  render(<Home />);

  const group = screen.getByRole("radiogroup", { name: "내 표시" });
  expect(group.querySelectorAll('[role="radio"]')).toHaveLength(6);
  expect(screen.getByRole("radio", { name: "토끼" })).toBeChecked();

  fireEvent.click(screen.getByRole("radio", { name: "곰" }));

  expect(screen.getByRole("radio", { name: "곰" })).toBeChecked();
  expect(screen.getByRole("radio", { name: "토끼" })).not.toBeChecked();
});

test("마지막으로 고른 동물 표시를 다음에도 기억한다", () => {
  const first = render(<Home />);
  fireEvent.click(screen.getByRole("radio", { name: "여우" }));
  first.unmount();

  render(<Home />);
  expect(screen.getByRole("radio", { name: "여우" })).toBeChecked();
});

test("기본은 모든 마을 모험이고, 마을 골라서 하기를 눌러야 마을 목록이 보인다", () => {
  render(<Home />);

  expect(screen.getByRole("radio", { name: "모든 마을 모험" })).toBeChecked();
  expect(screen.queryByRole("radiogroup", { name: "마을" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("radio", { name: "마을 골라서 하기" }));

  const villages = screen.getByRole("radiogroup", { name: "마을" });
  expect(villages.querySelectorAll('[role="radio"]')).toHaveLength(4);
  for (const name of ["산수 마을", "곱셈 마을", "국어 마을", "영어 마을"]) {
    expect(screen.getByRole("radio", { name })).toBeInTheDocument();
  }
});

test("마을을 골라서 시작하면 그 마을에서 시작한다", () => {
  render(<Home />);

  fireEvent.click(screen.getByRole("radio", { name: "마을 골라서 하기" }));
  fireEvent.click(screen.getByRole("radio", { name: "국어 마을" }));
  fireEvent.click(screen.getByRole("button", { name: /기본 캐릭터로 시작/ }));

  expect(
    screen.getByRole("heading", { level: 2, name: "국어 마을" })
  ).toBeInTheDocument();
});
