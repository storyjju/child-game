"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createQuiz, createWordQuiz, QuizDialog, type Quiz } from "@/game/quiz";
import {
  createWorld,
  solveMushroom,
  STAGES,
  stepWorld,
  WORLD,
  type Input,
  type WorldState,
} from "@/game/world";

import { drawScene } from "./draw-scene";

type StageProps = {
  face: HTMLCanvasElement;
  onFinished: (upgrade: number) => void;
};

const KEYS: Record<string, keyof Input> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "jump",
  KeyW: "jump",
  Space: "jump",
};

export function Stage({ face, onFinished }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef(createWorld());
  const inputRef = useRef<Input>({ left: false, right: false, jump: false });
  const onFinishedRef = useRef(onFinished);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [hud, setHud] = useState({ stageIndex: 0, collected: 0 });

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  function syncHud(world: WorldState) {
    setHud({ stageIndex: world.stageIndex, collected: world.collected.length });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let last = performance.now();

    function tick(now: number) {
      const before = worldRef.current;
      const after = stepWorld(before, inputRef.current, (now - last) / 1000);
      last = now;
      worldRef.current = after;
      drawScene(ctx!, after, face);

      if (after.stageIndex !== before.stageIndex) syncHud(after);
      if (after.status === "quiz" && before.status !== "quiz") {
        inputRef.current = { left: false, right: false, jump: false };
        const subject = STAGES[after.stageIndex].subject;
        setQuiz(subject === "english" ? createWordQuiz() : createQuiz());
      }
      if (after.status === "finished") {
        onFinishedRef.current(after.upgrade);
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    function onKey(pressed: boolean) {
      return (event: KeyboardEvent) => {
        const action = KEYS[event.code];
        if (!action || worldRef.current.status !== "running") return;
        event.preventDefault();
        inputRef.current = { ...inputRef.current, [action]: pressed };
      };
    }
    const onKeyDown = onKey(true);
    const onKeyUp = onKey(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [face]);

  function hold(action: keyof Input, pressed: boolean) {
    inputRef.current = { ...inputRef.current, [action]: pressed };
  }

  function handleSolved() {
    worldRef.current = solveMushroom(worldRef.current);
    syncHud(worldRef.current);
    setQuiz(null);
  }

  const stage = STAGES[hud.stageIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1">
        <h2 className="font-heading text-xl font-semibold">{stage.name}</h2>
        <p className="text-center text-sm text-muted-foreground">
          버섯 {hud.collected} / {stage.mushrooms.length} · 방향키로 걷고 위쪽
          키나 스페이스로 점프해요. 적과 블록은 점프로 피해요
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={WORLD.width}
        height={WORLD.height}
        aria-label="산수 마을 게임 화면"
        className="mx-auto h-auto max-h-[55vh] w-auto max-w-full rounded-xl border bg-sky-100"
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <ControlButton label="왼쪽으로 걷기" action="left" hold={hold}>
            <ArrowLeftIcon />
          </ControlButton>
          <ControlButton label="오른쪽으로 걷기" action="right" hold={hold}>
            <ArrowRightIcon />
          </ControlButton>
        </div>
        <ControlButton label="점프" action="jump" hold={hold}>
          <ArrowUpIcon />
        </ControlButton>
      </div>
      {quiz && <QuizDialog quiz={quiz} onSolved={handleSolved} />}
    </div>
  );
}

type ControlButtonProps = {
  label: string;
  action: keyof Input;
  hold: (action: keyof Input, pressed: boolean) => void;
  children: React.ReactNode;
};

function ControlButton({ label, action, hold, children }: ControlButtonProps) {
  return (
    <Button
      variant="secondary"
      aria-label={label}
      className="size-16 touch-none rounded-2xl [&_svg:not([class*='size-'])]:size-8"
      onPointerDown={() => hold(action, true)}
      onPointerUp={() => hold(action, false)}
      onPointerLeave={() => hold(action, false)}
      onPointerCancel={() => hold(action, false)}
    >
      {children}
    </Button>
  );
}
