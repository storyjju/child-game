import { browserStorage, readJson, writeJson } from "@/game/storage";
import { SUBJECTS, type Subject } from "@/game/subject";

export type SolveTime = { subject: Subject; ms: number };

export type PlayRecord = {
  endedAt: number;
  averageMs: Record<Subject, number | null>;
};

export type MedalEntry = { endedAt: number; ms: number };

/** 과목별 최고 기록. 평균 풀이 시간이 빠른 순서이고 최대 MAX_MEDALS개다. */
export type Medals = Record<Subject, MedalEntry[]>;

export type Comparison =
  | { kind: "first" }
  | { kind: "faster"; seconds: number }
  | { kind: "same"; previousMs: number };

export const MAX_RECORDS = 10;
export const MAX_MEDALS = 3;

// 동물 표시(owner)마다 따로 저장한다. 표시가 생기기 전의 기기 전체 기록은 읽지 않는다.
const recordsKey = (owner: string) => `child-game:play-records:${owner}`;
const medalsKey = (owner: string) => `child-game:medals:${owner}`;

export function emptyMedals(): Medals {
  return Object.fromEntries(SUBJECTS.map((subject) => [subject, []])) as unknown as Medals;
}

export function summarizePlay(times: SolveTime[], endedAt: number): PlayRecord {
  const averageMs = {} as PlayRecord["averageMs"];
  for (const subject of SUBJECTS) {
    const ms = times.filter((t) => t.subject === subject).map((t) => t.ms);
    averageMs[subject] = ms.length
      ? ms.reduce((sum, value) => sum + value, 0) / ms.length
      : null;
  }
  return { endedAt, averageMs };
}

/** 과목이 늘기 전에 저장된 판은 새 과목이 비어 있는 것으로 읽는다. */
function normalizeRecord(raw: PlayRecord): PlayRecord {
  const averageMs = {} as PlayRecord["averageMs"];
  for (const subject of SUBJECTS) {
    const value = raw.averageMs?.[subject];
    averageMs[subject] = typeof value === "number" ? value : null;
  }
  return { endedAt: raw.endedAt, averageMs };
}

/** 기록은 이 브라우저에만 있다. 저장소를 쓸 수 없으면 빈 기록으로 읽는다. */
export function loadRecords(
  owner: string,
  storage: Storage | undefined = browserStorage(),
): PlayRecord[] {
  const parsed = readJson<unknown>(storage, recordsKey(owner), []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((r): r is PlayRecord => typeof r?.endedAt === "number")
    .map(normalizeRecord);
}

export function loadMedals(
  owner: string,
  storage: Storage | undefined = browserStorage(),
): Medals {
  const parsed = readJson<Partial<Record<Subject, unknown>> | null>(
    storage,
    medalsKey(owner),
    null,
  );
  const medals = emptyMedals();
  if (!parsed || typeof parsed !== "object") return medals;
  for (const subject of SUBJECTS) {
    const entries = parsed[subject];
    if (!Array.isArray(entries)) continue;
    medals[subject] = entries
      .filter((e): e is MedalEntry => typeof e?.endedAt === "number" && typeof e?.ms === "number")
      .slice(0, MAX_MEDALS);
  }
  return medals;
}

function mergeMedals(medals: Medals, play: PlayRecord): Medals {
  const merged = emptyMedals();
  for (const subject of SUBJECTS) {
    const ms = play.averageMs[subject];
    const entries = ms == null ? medals[subject] : [...medals[subject], { endedAt: play.endedAt, ms }];
    merged[subject] = [...entries]
      .sort((a, b) => a.ms - b.ms || a.endedAt - b.endedAt)
      .slice(0, MAX_MEDALS);
  }
  return merged;
}

/** 끝낸 판을 저장하고 최신순 기록과 메달을 돌려준다. */
export function saveRecord(
  owner: string,
  play: PlayRecord,
  storage: Storage | undefined = browserStorage(),
): { records: PlayRecord[]; medals: Medals } {
  const records = [play, ...loadRecords(owner, storage)].slice(0, MAX_RECORDS);
  const medals = mergeMedals(loadMedals(owner, storage), play);
  writeJson(storage, recordsKey(owner), records);
  writeJson(storage, medalsKey(owner), medals);
  return { records, medals };
}

export function compareSubject(
  currentMs: number,
  previousMs: number | null | undefined,
): Comparison {
  if (previousMs == null) return { kind: "first" };
  const savedMs = previousMs - currentMs;
  if (savedMs >= 100) {
    return { kind: "faster", seconds: Math.round(savedMs / 100) / 10 };
  }
  return { kind: "same", previousMs };
}
