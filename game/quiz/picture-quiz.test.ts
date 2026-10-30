import { describe, expect, it } from "vitest";

import {
  createPictureQuiz,
  createQuizFor,
  isCorrect,
  PICTURE_WORDS,
} from "@/game/quiz";
import { SUBJECTS } from "@/game/subject";

import { seeded } from "./seeded";

describe("그림 낱말 목록", () => {
  it("약 30개이고 한국어 낱말, 영어 낱말, 그림이 각각 겹치지 않는다", () => {
    expect(PICTURE_WORDS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(PICTURE_WORDS.map((w) => w.ko)).size).toBe(PICTURE_WORDS.length);
    expect(new Set(PICTURE_WORDS.map((w) => w.en)).size).toBe(PICTURE_WORDS.length);
    expect(new Set(PICTURE_WORDS.map((w) => w.picture)).size).toBe(PICTURE_WORDS.length);
  });
});

describe.each([
  ["korean", "ko"],
  ["english", "en"],
] as const)("%s 그림 퀴즈", (language, field) => {
  it("문제는 낱말 하나이고 보기는 서로 다른 그림 네 개, 정답은 정확히 하나다", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const quiz = createPictureQuiz(language, seeded(seed));
      expect(quiz.pictures).toBe(true);
      expect(quiz.options).toHaveLength(4);
      expect(new Set(quiz.options).size).toBe(4);
      expect(quiz.options.filter((o) => isCorrect(quiz, o))).toHaveLength(1);
    }
  });

  it("정답 그림은 문제 낱말의 그림이다", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) {
      const quiz = createPictureQuiz(language, seeded(seed));
      const word = PICTURE_WORDS.find((w) => w[field] === quiz.question);
      expect(word).toBeDefined();
      expect(quiz.answer).toBe(word!.picture);
      seen.add(word![field]);
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  it("모든 보기에 접근성 이름(한국어 낱말)이 붙어 있다", () => {
    const quiz = createPictureQuiz(language, seeded(7));
    for (const option of quiz.options) {
      const word = PICTURE_WORDS.find((w) => w.picture === option);
      expect(quiz.labels?.[String(option)]).toBe(word!.ko);
    }
  });
});

describe("과목별 퀴즈", () => {
  it("과목마다 알맞은 퀴즈를 만든다", () => {
    const rng = seeded(3);
    expect(createQuizFor("math", rng).question).toMatch(/^\d+ [+−] \d+ = \?$/);
    expect(createQuizFor("multiplication", rng).question).toMatch(/^\d+ × \d+ = \?$/);
    expect(createQuizFor("korean", rng).pictures).toBe(true);
    expect(createQuizFor("english", rng).pictures).toBe(true);
    for (const subject of SUBJECTS) {
      expect(createQuizFor(subject, rng).options).toHaveLength(4);
    }
  });
});
