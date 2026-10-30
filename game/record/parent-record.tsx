"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SUBJECT_NAMES, SUBJECTS, type Subject } from "@/game/subject";

import { compareSubject, type MedalEntry, type Medals, type PlayRecord } from "./record";

const MEDAL_NAMES = ["금메달", "은메달", "동메달"] as const;
const MEDAL_ICONS = ["🥇", "🥈", "🥉"] as const;

type ParentRecordProps = {
  /** 최신순이며 첫 번째가 방금 끝낸 판이다. */
  records: PlayRecord[];
  medals: Medals;
};

export function ParentRecord({ records, medals }: ParentRecordProps) {
  const [current] = records;
  if (!current) return null;

  const playedNow = SUBJECTS.filter((subject) => current.averageMs[subject] != null);
  const withMedals = SUBJECTS.filter((subject) => medals[subject].length > 0);

  return (
    <Collapsible className="w-full">
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            className="group h-11 w-full justify-between text-base"
          />
        }
      >
        부모님용 기록
        <ChevronDownIcon className="transition-transform group-data-[panel-open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-4 pt-2 text-sm">
        <section aria-label="이번 판" className="flex flex-col gap-2">
          <h3 className="font-medium">이번 판 한 문제 평균 풀이 시간</h3>
          <ul className="flex flex-col gap-1">
            {playedNow.map((subject) => (
              <li key={subject} className="flex flex-wrap gap-x-2">
                <span className="font-medium">
                  {SUBJECT_NAMES[subject]} {formatSeconds(current.averageMs[subject])}
                </span>
                <span className="text-muted-foreground">
                  {describe(current.averageMs[subject], previousAverage(records, subject))}
                </span>
              </li>
            ))}
          </ul>
        </section>
        {withMedals.length > 0 && (
          <section aria-label="메달 기록" className="flex flex-col gap-2">
            <h3 className="font-medium">메달 기록</h3>
            <div className="flex flex-col gap-3">
              {withMedals.map((subject) => (
                <MedalList
                  key={subject}
                  subject={subject}
                  entries={medals[subject]}
                  currentEndedAt={current.endedAt}
                />
              ))}
            </div>
          </section>
        )}
        <section aria-label="최근 판" className="flex flex-col gap-2">
          <h3 className="font-medium">최근 {records.length}판</h3>
          <ol className="flex flex-col gap-1 text-muted-foreground">
            {records.map((record) => (
              <li key={record.endedAt} className="flex flex-wrap gap-x-3">
                <span>{formatDate(record.endedAt)}</span>
                {SUBJECTS.filter((subject) => record.averageMs[subject] != null).map(
                  (subject) => (
                    <span key={subject}>
                      {SUBJECT_NAMES[subject]} {formatSeconds(record.averageMs[subject])}
                    </span>
                  ),
                )}
              </li>
            ))}
          </ol>
        </section>
      </CollapsibleContent>
    </Collapsible>
  );
}

type MedalListProps = {
  subject: Subject;
  entries: MedalEntry[];
  currentEndedAt: number;
};

function MedalList({ subject, entries, currentEndedAt }: MedalListProps) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="font-medium">{SUBJECT_NAMES[subject]}</h4>
      <ol className="flex flex-col gap-1 text-muted-foreground">
        {entries.map((entry, index) => (
          <li key={entry.endedAt} className="flex flex-wrap items-center gap-x-2">
            <span role="img" aria-label={MEDAL_NAMES[index]} className="text-xl leading-none">
              {MEDAL_ICONS[index]}
            </span>
            <span className="text-foreground">{formatSeconds(entry.ms)}</span>
            <span>{formatDate(entry.endedAt)}</span>
            {entry.endedAt === currentEndedAt && (
              <span className="font-medium text-foreground">이번 판</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** 이번 판 앞에서 같은 과목을 푼 가장 가까운 판의 평균. */
function previousAverage(records: PlayRecord[], subject: Subject) {
  return records.slice(1).find((record) => record.averageMs[subject] != null)
    ?.averageMs[subject];
}

function describe(currentMs: number | null, previousMs: number | null | undefined) {
  if (currentMs == null) return "";
  const comparison = compareSubject(currentMs, previousMs);
  if (comparison.kind === "first") return "첫 기록이에요";
  if (comparison.kind === "faster") {
    return `지난 판보다 ${comparison.seconds.toFixed(1)}초 빨라졌어요`;
  }
  return `지난 판 ${formatSeconds(comparison.previousMs)}`;
}

function formatSeconds(ms: number | null) {
  return ms == null ? "기록 없음" : `${(ms / 1000).toFixed(1)}초`;
}

function formatDate(time: number) {
  return new Date(time).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
