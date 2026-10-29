import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuizDialog } from "@/game/quiz";

const quiz = { question: "3 + 4 = ?", options: [5, 7, 9, 6], answer: 7 };

describe("퀴즈 대화상자", () => {
  it("문제와 보기 네 개를 보여준다", () => {
    render(<QuizDialog quiz={quiz} onSolved={() => {}} />);

    expect(screen.getByText("3 + 4 = ?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^\d+$/ })).toHaveLength(4);
  });

  it("틀린 보기를 고르면 같은 문제가 남고 부드러운 안내가 보이며 풀린 것으로 처리되지 않는다", () => {
    const onSolved = vi.fn();
    render(<QuizDialog quiz={quiz} onSolved={onSolved} />);

    fireEvent.click(screen.getByRole("button", { name: "5" }));

    expect(screen.getByText(/다시 해볼까/)).toBeInTheDocument();
    expect(screen.getByText("3 + 4 = ?")).toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();
  });

  it("영어 단어 퀴즈도 같은 방식으로 틀리면 남고 맞히면 풀린다", () => {
    const onSolved = vi.fn();
    const word = {
      question: "apple = ?",
      options: ["학교", "사과", "우유", "강아지"],
      answer: "사과",
    };
    render(<QuizDialog quiz={word} onSolved={onSolved} />);

    fireEvent.click(screen.getByRole("button", { name: "학교" }));
    expect(screen.getByText("apple = ?")).toBeInTheDocument();
    expect(screen.getByText(/다시 해볼까/)).toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "사과" }));
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it("틀린 뒤에도 계속 다시 고를 수 있고 맞는 보기를 고르면 풀린 것으로 처리된다", () => {
    const onSolved = vi.fn();
    render(<QuizDialog quiz={quiz} onSolved={onSolved} />);

    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: "7" }));

    expect(onSolved).toHaveBeenCalledTimes(1);
  });
});
