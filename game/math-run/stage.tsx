"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createQuiz, createWordQuiz, QuizDialog, type Quiz } from "@/game/quiz";
import type { SolveTime } from "@/game/record";
import {
  createWorld,
  solveMushroom,
  STAGES,
  stepWorld,
  WORLD,
  type WorldState,
} from "@/game/world";

import { createControls, type Action } from "./controls";
import { drawScene } from "./draw-scene";

type StageProps = {
  face: HTMLCanvasElement | null;
  onFinished: (upgrade: number, solveTimes: SolveTime[]) => void;
};

const KEYS: Record<string, Action> = {
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
  const controlsRef = useRef(createControls());
  const onFinishedRef = useRef(onFinished);
  const quizOpenedRef = useRef<{ subject: SolveTime["subject"]; at: number }>(
    null,
  );
  const solveTimesRef = useRef<SolveTime[]>([]);
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
      const after = stepWorld(
        before,
        controlsRef.current.consume(),
        (now - last) / 1000
      );
      last = now;
      worldRef.current = after;
      drawScene(ctx!, after, face);

      if (after.stageIndex !== before.stageIndex) syncHud(after);
      if (after.status === "quiz" && before.status !== "quiz") {
        controlsRef.current.releaseAll();
        const subject = STAGES[after.stageIndex].subject;
        quizOpenedRef.current = { subject, at: now };
        setQuiz(subject === "english" ? createWordQuiz() : createQuiz());
      }
      if (after.status === "finished") {
        onFinishedRef.current(after.upgrade, solveTimesRef.current);
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
        if (pressed && !event.repeat) controlsRef.current.press(action);
        if (!pressed) controlsRef.current.release(action);
      };
    }
    const onKeyDown = onKey(true);
    const onKeyUp = onKey(false);
    // 창이 포커스를 잃으면 keyup이 오지 않으므로 누르던 입력을 모두 놓는다.
    const releaseAll = () => controlsRef.current.releaseAll();
    const onVisibility = () => {
      if (document.hidden) releaseAll();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [face]);

  function hold(action: Action, pressed: boolean) {
    if (pressed) controlsRef.current.press(action);
    else controlsRef.current.release(action);
  }

  function handleSolved() {
    const opened = quizOpenedRef.current;
    if (opened) {
      solveTimesRef.current.push({
        subject: opened.subject,
        ms: performance.now() - opened.at,
      });
      quizOpenedRef.current = null;
    }
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
          버섯 {hud.collected} / {stage.mushrooms.length} · ← → 버튼으로 걷고 ↑
          버튼으로 점프해요. 키보드의 방향키와 스페이스도 돼요. 적과 블록은
          점프로 넘어요
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
  action: Action;
  hold: (action: Action, pressed: boolean) => void;
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
