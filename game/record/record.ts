export type Subject = "math" | "english";

export type SolveTime = { subject: Subject; ms: number };

export type PlayRecord = {
  endedAt: number;
  averageMs: Record<Subject, number | null>;
};

export type Comparison =
  | { kind: "first" }
  | { kind: "faster"; seconds: number }
  | { kind: "same"; previousMs: number };

export const MAX_RECORDS = 10;

const STORAGE_KEY = "child-game:play-records";
const SUBJECTS: Subject[] = ["math", "english"];

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

/** Records live only in this browser; unavailable storage reads as empty. */
export function loadRecords(storage: Storage | undefined = browserStorage()) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as PlayRecord[]) : [];
  } catch {
    return [];
  }
}

/** Saves a finished play and returns the records newest first. */
export function saveRecord(
  play: PlayRecord,
  storage: Storage | undefined = browserStorage(),
) {
  const records = [play, ...loadRecords(storage)].slice(0, MAX_RECORDS);
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage is optional; the current play is still shown.
  }
  return records;
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

function browserStorage() {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
