import { describe, expect, it } from "vitest";

import {
  compareSubject,
  loadRecords,
  MAX_RECORDS,
  saveRecord,
  summarizePlay,
  type PlayRecord,
} from "@/game/record";

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

function record(endedAt: number, math: number | null = 3000): PlayRecord {
  return { endedAt, averageMs: { math, english: 4000 } };
}

describe("한 판 요약", () => {
  it("과목별 한 문제 평균 풀이 시간을 낸다", () => {
    const play = summarizePlay(
      [
        { subject: "math", ms: 2000 },
        { subject: "math", ms: 4000 },
        { subject: "english", ms: 5000 },
      ],
      123,
    );
    expect(play).toEqual({
      endedAt: 123,
      averageMs: { math: 3000, english: 5000 },
    });
  });

  it("푼 문제가 없는 과목은 비어 있다", () => {
    expect(summarizePlay([], 1).averageMs).toEqual({
      math: null,
      english: null,
    });
  });
});

describe("기기 저장", () => {
  it("저장한 판을 최신순으로 다시 읽는다", () => {
    const storage = memoryStorage();
    saveRecord(record(1), storage);
    const records = saveRecord(record(2), storage);
    expect(records.map((r) => r.endedAt)).toEqual([2, 1]);
    expect(loadRecords(storage).map((r) => r.endedAt)).toEqual([2, 1]);
  });

  it(`최근 ${MAX_RECORDS}판까지만 보관한다`, () => {
    const storage = memoryStorage();
    for (let i = 1; i <= MAX_RECORDS + 3; i++) saveRecord(record(i), storage);
    const records = loadRecords(storage);
    expect(records).toHaveLength(MAX_RECORDS);
    expect(records[0].endedAt).toBe(MAX_RECORDS + 3);
  });

  it("저장소를 쓸 수 없어도 이번 판은 돌려준다", () => {
    expect(loadRecords(broken)).toEqual([]);
    expect(saveRecord(record(5), broken)).toEqual([record(5)]);
  });

  it("깨진 저장 값은 빈 기록으로 본다", () => {
    const storage = memoryStorage();
    storage.setItem("child-game:play-records", "{not json");
    expect(loadRecords(storage)).toEqual([]);
  });
});

describe("지난 판과 비교", () => {
  it("0.1초 이상 줄었으면 빨라진 초를 낸다", () => {
    expect(compareSubject(2500, 3000)).toEqual({
      kind: "faster",
      seconds: 0.5,
    });
  });

  it("0.1초 미만 차이나 느려진 경우는 빨라졌다고 하지 않는다", () => {
    expect(compareSubject(2950, 3000)).toEqual({ kind: "same", previousMs: 3000 });
    expect(compareSubject(4000, 3000)).toEqual({ kind: "same", previousMs: 3000 });
  });

  it("지난 판이 없으면 첫 기록이다", () => {
    expect(compareSubject(3000, undefined)).toEqual({ kind: "first" });
    expect(compareSubject(3000, null)).toEqual({ kind: "first" });
  });
});
