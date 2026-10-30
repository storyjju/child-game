"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { isCorrect, type Choice, type Quiz } from "./quiz";

type QuizDialogProps = {
  quiz: Quiz;
  onSolved: () => void;
};

const COLUMNS = 2;

/** 방향키가 옮기는 칸 수. 보기는 2열로 놓인다. */
const MOVES: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -COLUMNS,
  ArrowDown: COLUMNS,
};

export function QuizDialog({ quiz, onSolved }: QuizDialogProps) {
  const [missed, setMissed] = useState(false);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function choose(option: Choice) {
    if (isCorrect(quiz, option)) {
      onSolved();
      return;
    }
    setMissed(true);
  }

  /** 방향키로 보기 사이를 옮긴다. 가장자리에서는 그 자리에 머문다. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const move = MOVES[event.key];
    if (move === undefined) return;
    event.preventDefault();
    const current = optionRefs.current.findIndex((el) => el === document.activeElement);
    const next = current + move;
    if (current < 0 || next < 0 || next >= quiz.options.length) return;
    optionRefs.current[next]?.focus();
  }

  const prompt = quiz.pictures
    ? "버섯을 먹으려면 맞는 그림을 골라 봐!"
    : "버섯을 먹으려면 정답을 골라 봐!";

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} initialFocus={() => optionRefs.current[0]}>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl">
            {quiz.question}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {missed ? "다시 해볼까? 천천히 골라 봐!" : prompt}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3" onKeyDown={handleKeyDown}>
          {quiz.options.map((option, index) => (
            <Button
              key={option}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              variant="outline"
              aria-label={quiz.labels?.[String(option)]}
              className={quiz.pictures ? "h-24 text-5xl" : "h-16 text-2xl"}
              onClick={() => choose(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          키보드는 방향키로 옮기고 Enter로 골라요
        </p>
      </DialogContent>
    </Dialog>
  );
}
