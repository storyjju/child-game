import { describe, expect, it } from "vitest";

import { createQuiz, isCorrect } from "@/game/quiz";

import { seeded } from "./seeded";

function parse(question: string) {
  const match = question.match(/^(\d+) ([+−]) (\d+) = \?$/);
  if (!match) throw new Error(`unexpected question: ${question}`);
  return { a: Number(match[1]), op: match[2], b: Number(match[3]) };
}

describe("산수 퀴즈", () => {
  it("보기는 서로 다른 네 개이고 정답은 정확히 하나다", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const quiz = createQuiz(seeded(seed));
      expect(quiz.options).toHaveLength(4);
      expect(new Set(quiz.options).size).toBe(4);
      expect(quiz.options.filter((o) => isCorrect(quiz, o))).toHaveLength(1);
    }
  });

  it("한 자리 수의 덧셈 또는 뺄셈이고 답이 문제의 계산 결과와 같다", () => {
    const ops = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      const quiz = createQuiz(seeded(seed));
      const { a, op, b } = parse(quiz.question);
      ops.add(op);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(9);
      expect(quiz.answer).toBe(op === "+" ? a + b : a - b);
    }
    expect(ops).toEqual(new Set(["+", "−"]));
  });

  it("뺄셈 결과와 모든 보기는 음수가 아니다", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const quiz = createQuiz(seeded(seed));
      expect(quiz.answer).toBeGreaterThanOrEqual(0);
      for (const option of quiz.options) {
        expect(option).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
