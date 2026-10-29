"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { compareSubject, type PlayRecord, type Subject } from "./record";

const SUBJECT_NAMES: Record<Subject, string> = {
  math: "산수",
  english: "영어",
};

type ParentRecordProps = {
  /** Newest first; the first entry is the play that just finished. */
  records: PlayRecord[];
};

export function ParentRecord({ records }: ParentRecordProps) {
  const [current, previous] = records;
  if (!current) return null;

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
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">이번 판 한 문제 평균 풀이 시간</h3>
          <ul className="flex flex-col gap-1">
            {(Object.keys(SUBJECT_NAMES) as Subject[]).map((subject) => (
              <li key={subject} className="flex flex-wrap gap-x-2">
                <span className="font-medium">
                  {SUBJECT_NAMES[subject]} {formatSeconds(current.averageMs[subject])}
                </span>
                <span className="text-muted-foreground">
                  {describe(current.averageMs[subject], previous?.averageMs[subject])}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="font-medium">최근 {records.length}판</h3>
          <ol className="flex flex-col gap-1 text-muted-foreground">
            {records.map((record) => (
              <li key={record.endedAt} className="flex flex-wrap gap-x-3">
                <span>{formatDate(record.endedAt)}</span>
                <span>산수 {formatSeconds(record.averageMs.math)}</span>
                <span>영어 {formatSeconds(record.averageMs.english)}</span>
              </li>
            ))}
          </ol>
        </section>
      </CollapsibleContent>
    </Collapsible>
  );
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
