import { pick, shuffle, type Random } from "./random";
import type { Quiz } from "./quiz";

/** 구구단 2～9단 전체에서 문제를 낸다. */
export function createMultiplicationQuiz(random: Random = Math.random): Quiz {
  const a = pick(random, 2, 9);
  const b = pick(random, 2, 9);
  const answer = a * b;

  // 같은 단의 이웃한 곱처럼 헷갈리기 쉬운 수를 먼저 후보로 둔다.
  const nearby = shuffle(
    random,
    [a * (b - 1), a * (b + 1), (a - 1) * b, (a + 1) * b].filter(
      (value) => value > 0 && value !== answer
    )
  );

  const options = new Set<number>([answer]);
  for (const value of nearby) {
    if (options.size < 4) options.add(value);
  }
  while (options.size < 4) {
    const candidate = answer + pick(random, -6, 6);
    if (candidate > 0) options.add(candidate);
  }

  return {
    question: `${a} × ${b} = ?`,
    options: shuffle(random, [...options]),
    answer,
  };
}
