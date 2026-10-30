import { describe, expect, it } from "vitest";

import {
  compareSubject,
  emptyMedals,
  loadMedals,
  loadRecords,
  MAX_MEDALS,
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

function play(endedAt: number, ms: Partial<PlayRecord["averageMs"]> = {}): PlayRecord {
  return {
    endedAt,
    averageMs: { math: null, multiplication: null, korean: null, english: null, ...ms },
  };
}

describe("한 판 요약", () => {
  it("과목별 한 문제 평균 풀이 시간을 낸다", () => {
    const summary = summarizePlay(
      [
        { subject: "math", ms: 2000 },
        { subject: "math", ms: 4000 },
        { subject: "multiplication", ms: 6000 },
        { subject: "korean", ms: 1000 },
        { subject: "english", ms: 5000 },
      ],
      123,
    );
    expect(summary).toEqual({
      endedAt: 123,
      averageMs: { math: 3000, multiplication: 6000, korean: 1000, english: 5000 },
    });
  });

  it("푼 문제가 없는 과목은 비어 있다", () => {
    expect(summarizePlay([], 1).averageMs).toEqual({
      math: null,
      multiplication: null,
      korean: null,
      english: null,
    });
  });
});

describe("기기 저장", () => {
  it("저장한 판을 최신순으로 다시 읽는다", () => {
    const storage = memoryStorage();
    saveRecord("rabbit", play(1, { math: 3000 }), storage);
    const { records } = saveRecord("rabbit", play(2, { math: 2000 }), storage);
    expect(records.map((r) => r.endedAt)).toEqual([2, 1]);
    expect(loadRecords("rabbit", storage).map((r) => r.endedAt)).toEqual([2, 1]);
  });

  it(`최근 ${MAX_RECORDS}판까지만 보관한다`, () => {
    const storage = memoryStorage();
    for (let i = 1; i <= MAX_RECORDS + 3; i++) {
      saveRecord("rabbit", play(i, { math: 3000 }), storage);
    }
    const records = loadRecords("rabbit", storage);
    expect(records).toHaveLength(MAX_RECORDS);
    expect(records[0].endedAt).toBe(MAX_RECORDS + 3);
  });

  it("저장소를 쓸 수 없어도 이번 판과 메달은 돌려준다", () => {
    expect(loadRecords("rabbit", broken)).toEqual([]);
    const saved = saveRecord("rabbit", play(5, { math: 3000 }), broken);
    expect(saved.records).toEqual([play(5, { math: 3000 })]);
    expect(saved.medals.math).toEqual([{ endedAt: 5, ms: 3000 }]);
  });

  it("깨진 저장 값은 빈 기록으로 본다", () => {
    const storage = memoryStorage();
    storage.setItem("child-game:play-records:rabbit", "{not json");
    storage.setItem("child-game:medals:rabbit", "[1,2");
    expect(loadRecords("rabbit", storage)).toEqual([]);
    expect(loadMedals("rabbit", storage)).toEqual(emptyMedals());
  });

  it("과목이 늘기 전에 저장된 판은 새 과목이 비어 있는 것으로 읽는다", () => {
    const storage = memoryStorage();
    storage.setItem(
      "child-game:play-records:rabbit",
      JSON.stringify([{ endedAt: 1, averageMs: { math: 3000, english: 4000 } }]),
    );
    expect(loadRecords("rabbit", storage)).toEqual([
      play(1, { math: 3000, english: 4000 }),
    ]);
  });
});

describe("동물 표시별 기록", () => {
  it("다른 표시의 기록과 메달은 서로 보이지 않고, 원래 표시로 돌아가면 그대로 있다", () => {
    const storage = memoryStorage();
    saveRecord("rabbit", play(1, { math: 3000 }), storage);
    saveRecord("rabbit", play(2, { math: 2000 }), storage);

    const bear = saveRecord("bear", play(3, { math: 9000 }), storage);
    expect(bear.records.map((r) => r.endedAt)).toEqual([3]);
    expect(bear.medals.math).toEqual([{ endedAt: 3, ms: 9000 }]);

    expect(loadRecords("rabbit", storage).map((r) => r.endedAt)).toEqual([2, 1]);
    expect(loadMedals("rabbit", storage).math.map((m) => m.ms)).toEqual([2000, 3000]);
  });
});

describe("메달 순위", () => {
  it(`과목별로 평균이 빠른 순서대로 ${MAX_MEDALS}개까지만 남긴다`, () => {
    const storage = memoryStorage();
    [4000, 2500, 3500, 3000, 5000].forEach((ms, i) => {
      saveRecord("rabbit", play(i + 1, { math: ms }), storage);
    });
    expect(loadMedals("rabbit", storage).math).toEqual([
      { endedAt: 2, ms: 2500 },
      { endedAt: 4, ms: 3000 },
      { endedAt: 3, ms: 3500 },
    ]);
  });

  it("평균 시간이 같으면 먼저 끝낸 판이 앞선다", () => {
    const storage = memoryStorage();
    saveRecord("rabbit", play(1, { math: 3000 }), storage);
    saveRecord("rabbit", play(2, { math: 3000 }), storage);
    expect(loadMedals("rabbit", storage).math.map((m) => m.endedAt)).toEqual([1, 2]);
  });

  it("최근 판 목록에서 밀려난 판이라도 3위 안이면 메달로 남는다", () => {
    const storage = memoryStorage();
    saveRecord("rabbit", play(1, { math: 1000 }), storage);
    for (let i = 2; i <= MAX_RECORDS + 3; i++) {
      saveRecord("rabbit", play(i, { math: 9000 }), storage);
    }
    expect(loadRecords("rabbit", storage).some((r) => r.endedAt === 1)).toBe(false);
    expect(loadMedals("rabbit", storage).math[0]).toEqual({ endedAt: 1, ms: 1000 });
  });

  it("과목끼리는 따로 순위를 매기고, 하지 않은 과목은 영향을 받지 않는다", () => {
    const storage = memoryStorage();
    saveRecord("rabbit", play(1, { math: 3000, english: 8000 }), storage);
    saveRecord("rabbit", play(2, { korean: 2000 }), storage);
    const medals = loadMedals("rabbit", storage);
    expect(medals.math).toEqual([{ endedAt: 1, ms: 3000 }]);
    expect(medals.english).toEqual([{ endedAt: 1, ms: 8000 }]);
    expect(medals.korean).toEqual([{ endedAt: 2, ms: 2000 }]);
    expect(medals.multiplication).toEqual([]);
  });
});

describe("지난 판과 비교", () => {
  it("0.1초 이상 줄었으면 빨라진 초를 낸다", () => {
    expect(compareSubject(2500, 3000)).toEqual({ kind: "faster", seconds: 0.5 });
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
