import { PICTURE_WORDS } from "./picture-words";
import { pick, shuffle, type Random } from "./random";
import type { Quiz } from "./quiz";

type Language = "korean" | "english";

/** 낱말 하나를 문제로 보여 주고, 보기 네 개는 그림으로 낸다. */
export function createPictureQuiz(
  language: Language,
  random: Random = Math.random
): Quiz {
  const word = PICTURE_WORDS[pick(random, 0, PICTURE_WORDS.length - 1)];

  const chosen = new Map([[word.picture, word]]);
  while (chosen.size < 4) {
    const other = PICTURE_WORDS[pick(random, 0, PICTURE_WORDS.length - 1)];
    chosen.set(other.picture, other);
  }

  return {
    question: language === "korean" ? word.ko : word.en,
    options: shuffle(random, [...chosen.keys()]),
    answer: word.picture,
    pictures: true,
    labels: Object.fromEntries([...chosen].map(([picture, w]) => [picture, w.ko])),
  };
}
