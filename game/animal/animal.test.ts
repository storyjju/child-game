import { describe, expect, it } from "vitest";

import { ANIMALS, DEFAULT_ANIMAL, loadAnimal, saveAnimal } from "./animal";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

const broken = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
} as unknown as Storage;

describe("동물 표시", () => {
  it("6개이고 이름과 그림이 겹치지 않는다", () => {
    expect(ANIMALS).toHaveLength(6);
    expect(new Set(ANIMALS.map((a) => a.id)).size).toBe(6);
    expect(new Set(ANIMALS.map((a) => a.emoji)).size).toBe(6);
    expect(new Set(ANIMALS.map((a) => a.name)).size).toBe(6);
  });

  it("처음 쓰는 기기에서는 첫 번째 동물이 선택되어 있다", () => {
    expect(DEFAULT_ANIMAL).toBe(ANIMALS[0].id);
    expect(loadAnimal(memoryStorage())).toBe(ANIMALS[0].id);
  });

  it("마지막으로 고른 동물을 기억한다", () => {
    const storage = memoryStorage();
    saveAnimal("fox", storage);
    expect(loadAnimal(storage)).toBe("fox");
  });

  it("알 수 없는 값이 저장되어 있으면 기본 동물로 돌아간다", () => {
    const storage = memoryStorage();
    storage.setItem("child-game:last-animal", "dragon");
    expect(loadAnimal(storage)).toBe(DEFAULT_ANIMAL);
  });

  it("저장소를 쓸 수 없어도 오류 없이 기본 동물로 동작한다", () => {
    expect(loadAnimal(broken)).toBe(DEFAULT_ANIMAL);
    expect(() => saveAnimal("bear", broken)).not.toThrow();
  });
});
