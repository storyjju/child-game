/** 이 기기의 브라우저 저장소. 막혀 있거나 서버 렌더링 중이면 undefined다. */
export function browserStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/** 저장소를 쓸 수 없거나 값이 깨졌으면 fallback을 돌려준다. */
export function readJson<T>(storage: Storage | undefined, key: string, fallback: T): T {
  try {
    const raw = storage?.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** 저장은 선택 사항이라 실패해도 조용히 넘어간다. */
export function writeJson(storage: Storage | undefined, key: string, value: unknown) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // 저장소를 쓸 수 없어도 이번 판은 그대로 보여 준다.
  }
}
