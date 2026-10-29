import { describe, expect, it } from "vitest";

import { createWordQuiz, isCorrect, WORDS } from "@/game/quiz";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("영어 단어 퀴즈", () => {
  it("단어는 약 30개이고 영어와 한국어 뜻이 각각 겹치지 않는다", () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(WORDS.map((w) => w.en)).size).toBe(WORDS.length);
    expect(new Set(WORDS.map((w) => w.ko)).size).toBe(WORDS.length);
  });

  it("보기는 서로 다른 네 개이고 정답은 정확히 하나다", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const quiz = createWordQuiz(seeded(seed));
      expect(quiz.options).toHaveLength(4);
      expect(new Set(quiz.options).size).toBe(4);
      expect(quiz.options.filter((o) => isCorrect(quiz, o))).toHaveLength(1);
    }
  });

  it("문제는 영어 단어이고 정답은 그 단어의 한국어 뜻이다", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) {
      const quiz = createWordQuiz(seeded(seed));
      const word = WORDS.find((w) => quiz.question === `${w.en} = ?`);
      expect(word).toBeDefined();
      expect(quiz.answer).toBe(word!.ko);
      for (const option of quiz.options) {
        expect(WORDS.some((w) => w.ko === option)).toBe(true);
      }
      seen.add(word!.en);
    }
    expect(seen.size).toBeGreaterThan(10);
  });
});
