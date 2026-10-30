import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuizDialog } from "@/game/quiz";

// 보기는 2×2로 놓인다: 5 7 / 9 6
const quiz = { question: "3 + 4 = ?", options: [5, 7, 9, 6], answer: 7 };

function option(name: string) {
  return screen.getByRole("button", { name });
}

function press(from: string, key: string) {
  fireEvent.keyDown(option(from), { key });
}

describe("퀴즈 대화상자 키보드 조작", () => {
  it("퀴즈가 열리면 첫 번째 보기에 포커스가 있다", async () => {
    render(<QuizDialog quiz={quiz} onSolved={() => {}} />);

    await waitFor(() => expect(option("5")).toHaveFocus());
  });

  it("오른쪽·왼쪽 방향키로 옆 보기로 옮긴다", async () => {
    render(<QuizDialog quiz={quiz} onSolved={() => {}} />);
    await waitFor(() => expect(option("5")).toHaveFocus());

    press("5", "ArrowRight");
    expect(option("7")).toHaveFocus();

    press("7", "ArrowLeft");
    expect(option("5")).toHaveFocus();
  });

  it("아래·위 방향키로 아랫줄·윗줄 보기로 옮긴다", async () => {
    render(<QuizDialog quiz={quiz} onSolved={() => {}} />);
    await waitFor(() => expect(option("5")).toHaveFocus());

    press("5", "ArrowDown");
    expect(option("9")).toHaveFocus();

    press("9", "ArrowUp");
    expect(option("5")).toHaveFocus();
  });

  it("가장자리에서는 더 가지 않고 그 자리에 머문다", async () => {
    render(<QuizDialog quiz={quiz} onSolved={() => {}} />);
    await waitFor(() => expect(option("5")).toHaveFocus());

    press("5", "ArrowLeft");
    press("5", "ArrowUp");
    expect(option("5")).toHaveFocus();

    press("5", "ArrowDown");
    press("9", "ArrowDown");
    expect(option("9")).toHaveFocus();
    press("9", "ArrowRight");
    expect(option("6")).toHaveFocus();
    press("6", "ArrowRight");
    expect(option("6")).toHaveFocus();
  });

  it("방향키로 옮긴 보기를 누르면 그 보기로 답한다", async () => {
    const onSolved = vi.fn();
    render(<QuizDialog quiz={quiz} onSolved={onSolved} />);
    await waitFor(() => expect(option("5")).toHaveFocus());

    press("5", "ArrowRight");
    fireEvent.click(document.activeElement as HTMLElement);

    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it("방향키는 창 밖으로 새지 않아 화면이 스크롤되지 않는다", async () => {
    render(<QuizDialog quiz={quiz} onSolved={() => {}} />);
    await waitFor(() => expect(option("5")).toHaveFocus());

    const notPrevented = fireEvent.keyDown(option("5"), { key: "ArrowDown" });
    expect(notPrevented).toBe(false);
  });

  it("방향키 사용법을 안내한다", () => {
    render(<QuizDialog quiz={quiz} onSolved={() => {}} />);
    expect(screen.getByText(/방향키/)).toBeInTheDocument();
  });
});
