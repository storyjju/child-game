import { MathRun } from "@/game/math-run";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          산수 마을의 모험
        </h1>
        <p className="text-muted-foreground">
          내 얼굴 캐릭터로 버섯을 찾고, 퀴즈를 풀어서 더 멋지게 변신해요.
        </p>
      </header>
      <MathRun />
    </main>
  );
}
