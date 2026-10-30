"use client";

import { useState, useSyncExternalStore } from "react";

import { DEFAULT_ANIMAL, loadAnimal, saveAnimal } from "./animal";

const subscribe = () => () => {};

/**
 * 고른 동물 표시와 바꾸는 함수. 서버 화면과 어긋나지 않도록 처음에는 기본 동물로 그리고,
 * 브라우저에서는 마지막으로 고른 동물을 읽어 온다.
 */
export function useAnimal(): [string, (id: string) => void] {
  const saved = useSyncExternalStore(subscribe, () => loadAnimal(), () => DEFAULT_ANIMAL);
  const [chosen, setChosen] = useState<string | null>(null);

  function choose(id: string) {
    setChosen(id);
    saveAnimal(id);
  }

  return [chosen ?? saved, choose];
}
