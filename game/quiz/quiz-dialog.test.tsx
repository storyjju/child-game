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

  it("그림 보기는 이름을 붙여 읽을 수 있게 하고, 틀리면 남고 맞히면 풀린다", () => {
    const onSolved = vi.fn();
    const picture = {
      question: "apple",
      options: ["🏫", "🍎", "🥛", "🐶"],
      answer: "🍎",
      pictures: true,
      labels: { "🏫": "학교", "🍎": "사과", "🥛": "우유", "🐶": "강아지" },
    };
    render(<QuizDialog quiz={picture} onSolved={onSolved} />);

    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "학교" }));
    expect(screen.getByText("apple")).toBeInTheDocument();
    expect(screen.getByText(/다시 해볼까/)).toBeInTheDocument();
    expect(onSolved).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "사과" }));
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it("그림 퀴즈의 안내 문구는 그림을 고르라고 말한다", () => {
    const picture = {
      question: "사과",
      options: ["🍎", "🐶", "🏫", "🥛"],
      answer: "🍎",
      pictures: true,
      labels: { "🍎": "사과", "🐶": "강아지", "🏫": "학교", "🥛": "우유" },
    };
    render(<QuizDialog quiz={picture} onSolved={() => {}} />);
    expect(screen.getByText(/맞는 그림/)).toBeInTheDocument();
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
