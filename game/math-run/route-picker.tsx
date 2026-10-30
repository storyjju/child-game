"use client";

import { Button } from "@/components/ui/button";
import { ALL_STAGES, STAGES } from "@/game/world";

export type RouteMode = "all" | "pick";

/** 모든 마을 모험이면 전체 경로, 마을 하나를 골랐으면 그 마을 하나뿐인 경로. */
export function routeFor(mode: RouteMode, picked: number): number[] {
  return mode === "all" ? ALL_STAGES : [picked];
}

type RoutePickerProps = {
  mode: RouteMode;
  onModeChange: (mode: RouteMode) => void;
  picked: number;
  onPick: (stageIndex: number) => void;
};

export function RoutePicker({ mode, onModeChange, picked, onPick }: RoutePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="모험 방식" className="grid grid-cols-2 gap-2">
        <Button
          role="radio"
          aria-checked={mode === "all"}
          variant={mode === "all" ? "default" : "outline"}
          className="h-12 text-base"
          onClick={() => onModeChange("all")}
        >
          모든 마을 모험
        </Button>
        <Button
          role="radio"
          aria-checked={mode === "pick"}
          variant={mode === "pick" ? "default" : "outline"}
          className="h-12 text-base"
          onClick={() => onModeChange("pick")}
        >
          마을 골라서 하기
        </Button>
      </div>
      {mode === "pick" && (
        <div role="radiogroup" aria-label="마을" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STAGES.map((stage, index) => (
            <Button
              key={stage.id}
              role="radio"
              aria-checked={index === picked}
              variant={index === picked ? "default" : "outline"}
              className="h-12"
              onClick={() => onPick(index)}
            >
              {stage.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
