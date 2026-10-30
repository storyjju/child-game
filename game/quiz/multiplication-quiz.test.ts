import { describe, expect, it } from "vitest";

import { createMultiplicationQuiz, isCorrect } from "@/game/quiz";

import { seeded } from "./seeded";

function parse(question: string) {
  const match = question.match(/^(\d+) × (\d+) = \?$/);
  if (!match) throw new Error(`unexpected question: ${question}`);
  return { a: Number(match[1]), b: Number(match[2]) };
}

describe("곱셈 퀴즈", () => {
  it("구구단 2～9단 곱셈이고 답이 두 수의 곱과 같다", () => {
    const dans = new Set<number>();
    for (let seed = 1; seed <= 400; seed++) {
      const quiz = createMultiplicationQuiz(seeded(seed));
      const { a, b } = parse(quiz.question);
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(9);
      expect(quiz.answer).toBe(a * b);
      dans.add(a);
    }
    expect(dans).toEqual(new Set([2, 3, 4, 5, 6, 7, 8, 9]));
  });

  it("보기는 서로 다른 자연수 네 개이고 정답은 정확히 하나다", () => {
    for (let seed = 1; seed <= 400; seed++) {
      const quiz = createMultiplicationQuiz(seeded(seed));
      expect(quiz.options).toHaveLength(4);
      expect(new Set(quiz.options).size).toBe(4);
      for (const option of quiz.options) {
        expect(Number.isInteger(option)).toBe(true);
        expect(option).toBeGreaterThan(0);
      }
      expect(quiz.options.filter((o) => isCorrect(quiz, o))).toHaveLength(1);
    }
  });
});
