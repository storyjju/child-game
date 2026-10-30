import type { Subject } from "@/game/subject";

import { createMultiplicationQuiz } from "./multiplication-quiz";
import { createPictureQuiz } from "./picture-quiz";
import { createQuiz, type Quiz } from "./quiz";
import type { Random } from "./random";

/** 마을의 과목에 맞는 퀴즈를 만든다. */
export function createQuizFor(subject: Subject, random: Random = Math.random): Quiz {
  switch (subject) {
    case "math":
      return createQuiz(random);
    case "multiplication":
      return createMultiplicationQuiz(random);
    case "korean":
      return createPictureQuiz("korean", random);
    case "english":
      return createPictureQuiz("english", random);
  }
}
