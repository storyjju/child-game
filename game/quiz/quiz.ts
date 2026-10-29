import { pick, shuffle, type Random } from "./random";

export type Choice = number | string;

export type Quiz = {
  question: string;
  options: Choice[];
  answer: Choice;
};

export function createQuiz(random: Random = Math.random): Quiz {
  const isAddition = random() < 0.5;
  let a = pick(random, 1, 9);
  let b = pick(random, 1, 9);
  if (!isAddition && a < b) [a, b] = [b, a];

  const answer = isAddition ? a + b : a - b;

  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const candidate = answer + pick(random, -3, 3);
    if (candidate >= 0) options.add(candidate);
  }

  return {
    question: `${a} ${isAddition ? "+" : "−"} ${b} = ?`,
    options: shuffle(random, [...options]),
    answer,
  };
}

export function isCorrect(quiz: Quiz, option: Choice) {
  return option === quiz.answer;
}
