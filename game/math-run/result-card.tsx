"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { drawCharacter } from "@/game/character";
import { ParentRecord, type Medals, type PlayRecord } from "@/game/record";

type ResultCardProps = {
  face: HTMLCanvasElement | null;
  upgrade: number;
  records: PlayRecord[];
  medals: Medals;
  onRetry: () => void;
  onHome: () => void;
};

export function ResultCard({
  face,
  upgrade,
  records,
  medals,
  onRetry,
  onHome,
}: ResultCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacter(ctx, face, canvas.width / 2, canvas.height - 24, upgrade);
  }, [face, upgrade]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>모험 끝! 모두 해냈어요</CardTitle>
        <CardDescription>
          버섯을 {upgrade}개 먹고 이만큼 멋진 캐릭터가 됐어요.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={300}
          aria-label="업그레이드된 내 캐릭터"
          className="mx-auto h-auto w-full max-w-xs rounded-xl bg-sky-100"
        />
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button size="lg" className="h-12 w-full text-base" onClick={onRetry}>
          다시 하기
        </Button>
        <Button variant="outline" size="lg" className="h-12 w-full text-base" onClick={onHome}>
          처음으로
        </Button>
        <ParentRecord records={records} medals={medals} />
      </CardFooter>
    </Card>
  );
}
