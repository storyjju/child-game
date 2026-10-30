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
import { AnimalPicker, useAnimal } from "@/game/animal";
import { PhotoPicker } from "@/game/character";
import {
  emptyMedals,
  saveRecord,
  summarizePlay,
  type Medals,
  type PlayRecord,
  type SolveTime,
} from "@/game/record";

import { ResultCard } from "./result-card";
import { routeFor, RoutePicker, type RouteMode } from "./route-picker";
import { Stage } from "./stage";

type Phase = "setup" | "playing" | "finished";

export function MathRun() {
  const [face, setFace] = useState<HTMLCanvasElement | null>(null);
  const [animal, setAnimal] = useAnimal();
  const [mode, setMode] = useState<RouteMode>("all");
  const [picked, setPicked] = useState(0);

  // 이번 판을 시작할 때 정한 값. 끝난 뒤 다시 하기도 같은 값으로 한다.
  const [playerFace, setPlayerFace] = useState<HTMLCanvasElement | null>(null);
  const [playerAnimal, setPlayerAnimal] = useState(animal);
  const [route, setRoute] = useState<number[]>([]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [run, setRun] = useState(0);
  const [finalUpgrade, setFinalUpgrade] = useState(0);
  const [records, setRecords] = useState<PlayRecord[]>([]);
  const [medals, setMedals] = useState<Medals>(emptyMedals);

  const handleFinished = useCallback(
    (upgrade: number, solveTimes: SolveTime[]) => {
      setFinalUpgrade(upgrade);
      const saved = saveRecord(playerAnimal, summarizePlay(solveTimes, Date.now()));
      setRecords(saved.records);
      setMedals(saved.medals);
      setPhase("finished");
    },
    [playerAnimal],
  );

  /** 사진이 없으면(null) 기본 캐릭터로 시작한다. */
  function start(withFace: HTMLCanvasElement | null) {
    setPlayerFace(withFace);
    setPlayerAnimal(animal);
    setRoute(routeFor(mode, picked));
    setRun((current) => current + 1);
    setPhase("playing");
  }

  function retry() {
    setRun((current) => current + 1);
    setPhase("playing");
  }

  function goHome() {
    setFace(null);
    setPhase("setup");
  }

  if (phase === "playing") {
    return <Stage key={run} face={playerFace} route={route} onFinished={handleFinished} />;
  }

  if (phase === "finished") {
    return (
      <ResultCard
        face={playerFace}
        upgrade={finalUpgrade}
        records={records}
        medals={medals}
        onRetry={retry}
        onHome={goHome}
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
      <CardContent className="flex flex-col gap-6">
        <PhotoPicker onFaceChange={setFace} />
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">내 표시</h3>
          <AnimalPicker value={animal} onChange={setAnimal} />
          <p className="text-sm text-muted-foreground">
            같이 쓰는 친구와 기록이 섞이지 않게 나눠 줘요. 이름은 받지 않아요.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">어느 마을로 갈까요?</h3>
          <RoutePicker
            mode={mode}
            onModeChange={setMode}
            picked={picked}
            onPick={setPicked}
          />
        </section>
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
