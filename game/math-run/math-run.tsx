"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhotoPicker } from "@/game/character";

import { ResultCard } from "./result-card";
import { Stage } from "./stage";

type Phase = "setup" | "playing" | "finished";

export function MathRun() {
  const [face, setFace] = useState<HTMLCanvasElement | null>(null);
  const [playerFace, setPlayerFace] = useState<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [run, setRun] = useState(0);
  const [finalUpgrade, setFinalUpgrade] = useState(0);

  const handleFinished = useCallback((upgrade: number) => {
    setFinalUpgrade(upgrade);
    setPhase("finished");
  }, []);

  /** 사진이 없으면(null) 기본 캐릭터로 시작한다. */
  function start(withFace: HTMLCanvasElement | null) {
    setPlayerFace(withFace);
    setRun((current) => current + 1);
    setPhase("playing");
  }

  if (phase === "playing") {
    return <Stage key={run} face={playerFace} onFinished={handleFinished} />;
  }

  if (phase === "finished") {
    return (
      <ResultCard
        face={playerFace}
        upgrade={finalUpgrade}
        onRetry={() => start(playerFace)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>얼굴 캐릭터 만들기</CardTitle>
        <CardDescription>
          내 얼굴 사진을 고르면 나만의 캐릭터가 모험을 떠나요. 사진은 이
          기기 안에서만 쓰이고 어디로도 보내지 않아요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PhotoPicker onFaceChange={setFace} />
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button
          size="lg"
          className="h-12 w-full text-base"
          disabled={!face}
          onClick={() => start(face)}
        >
          모험 시작!
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 w-full text-base"
          onClick={() => start(null)}
        >
          기본 캐릭터로 시작
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          사진을 올릴 수 없을 때는 기본 캐릭터로 바로 시작할 수 있어요.
        </p>
      </CardFooter>
    </Card>
  );
}
