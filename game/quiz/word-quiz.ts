import { pick, shuffle, type Random } from "./random";
import type { Quiz } from "./quiz";
import { WORDS } from "./words";

export function createWordQuiz(random: Random = Math.random): Quiz {
  const word = WORDS[pick(random, 0, WORDS.length - 1)];

  const options = new Set<string>([word.ko]);
  while (options.size < 4) {
    options.add(WORDS[pick(random, 0, WORDS.length - 1)].ko);
  }

  return {
    question: `${word.en} = ?`,
    options: shuffle(random, [...options]),
    answer: word.ko,
  };
}
