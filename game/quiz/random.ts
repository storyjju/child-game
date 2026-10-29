export type Random = () => number;

export function pick(random: Random, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

export function shuffle<T>(random: Random, items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
