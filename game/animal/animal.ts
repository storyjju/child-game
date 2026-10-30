import { browserStorage } from "@/game/storage";

export type Animal = { id: string; emoji: string; name: string };

/** 이름 대신 쓰는 동물 표시. 아이를 알아볼 수 있는 정보를 받지 않고 기록만 나눈다. */
export const ANIMALS: Animal[] = [
  { id: "rabbit", emoji: "🐰", name: "토끼" },
  { id: "bear", emoji: "🐻", name: "곰" },
  { id: "cat", emoji: "🐱", name: "고양이" },
  { id: "dog", emoji: "🐶", name: "강아지" },
  { id: "panda", emoji: "🐼", name: "판다" },
  { id: "fox", emoji: "🦊", name: "여우" },
];

export const DEFAULT_ANIMAL = ANIMALS[0].id;

const STORAGE_KEY = "child-game:last-animal";

/** 마지막으로 고른 동물. 없거나 알 수 없는 값이면 기본 동물이다. */
export function loadAnimal(storage: Storage | undefined = browserStorage()): string {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    return ANIMALS.some((animal) => animal.id === saved) ? (saved as string) : DEFAULT_ANIMAL;
  } catch {
    return DEFAULT_ANIMAL;
  }
}

export function saveAnimal(id: string, storage: Storage | undefined = browserStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, id);
  } catch {
    // 저장은 선택 사항이다.
  }
}
