"use client";

import { useState } from "react";

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

export function QuizDialog({ quiz, onSolved }: QuizDialogProps) {
  const [missed, setMissed] = useState(false);

  function choose(option: Choice) {
    if (isCorrect(quiz, option)) {
      onSolved();
      return;
    }
    setMissed(true);
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-3xl">
            {quiz.question}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {missed
              ? "다시 해볼까? 천천히 골라 봐!"
              : "버섯을 먹으려면 정답을 골라 봐!"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {quiz.options.map((option) => (
            <Button
              key={option}
              variant="outline"
              className="h-16 text-2xl"
              onClick={() => choose(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
