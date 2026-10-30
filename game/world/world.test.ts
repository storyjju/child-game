import { describe, expect, it } from "vitest";

import {
  createWorld,
  solveMushroom,
  startStage,
  stepWorld,
  STAGES,
  WORLD,
  type Input,
  type WorldState,
} from "@/game/world";

const idle: Input = { left: false, right: false, jump: false };
const right: Input = { ...idle, right: true };
const left: Input = { ...idle, left: true };
const jump: Input = { ...idle, jump: true };
const dt = 1 / 60;

function run(state: WorldState, input: Input, seconds: number) {
  let next = state;
  for (let t = 0; t < seconds; t += dt) next = stepWorld(next, input, dt);
  return next;
}

function stage(state: WorldState) {
  return STAGES[state.stageIndex];
}

function mushroomIds(index: number) {
  return STAGES[index].mushrooms.map((m) => m.id);
}

function at(state: WorldState, patch: Partial<WorldState>): WorldState {
  return { ...state, ...patch };
}

describe("산수 마을 월드", () => {
  it("오른쪽 입력이면 앞으로, 왼쪽 입력이면 뒤로 걷는다", () => {
    const start = createWorld();
    const forward = run(start, right, 0.5);
    expect(forward.x).toBeGreaterThan(start.x);
    expect(run(forward, left, 0.25).x).toBeLessThan(forward.x);
  });

  it("화면 왼쪽 끝 밖으로 나가지 않는다", () => {
    expect(run(createWorld(), left, 3).x).toBeGreaterThanOrEqual(0);
  });

  it("점프하면 떴다가 다시 땅에 내려오고, 공중에서는 다시 점프하지 못한다", () => {
    const rising = run(createWorld(), jump, 0.1);
    expect(rising.y).toBeGreaterThan(0);

    const apex = run(rising, jump, 0.2).y;
    expect(run(rising, jump, 0.2).y).toBeLessThanOrEqual(apex);

    const landed = run(rising, idle, 2);
    expect(landed.y).toBe(0);
    expect(landed.onGround).toBe(true);
  });

  it("시작은 첫 스테이지인 산수 마을이다", () => {
    const state = createWorld();
    expect(state.stageIndex).toBe(0);
    expect(stage(state).name).toBe("산수 마을");
    expect(stage(state).subject).toBe("math");
  });
});

describe("버섯과 퀴즈", () => {
  it("버섯에 닿으면 퀴즈 상태가 되고 그동안 캐릭터가 움직이지 않는다", () => {
    const first = stage(createWorld()).mushrooms[0];
    const state = at(createWorld(), { x: first.x - 80 });
    const quiz = run(state, right, 1);
    expect(quiz.status).toBe("quiz");
    expect(quiz.pendingMushroom).toBe(first.id);
    expect(run(quiz, right, 1).x).toBe(quiz.x);
  });

  it("점프로 버섯 위를 지나가려 해도 버섯에 걸린다", () => {
    const first = stage(createWorld()).mushrooms[0];
    const state = at(createWorld(), { x: first.x - 80 });
    const quiz = run(state, { ...right, jump: true }, 1);
    expect(quiz.status).toBe("quiz");
  });

  it("퀴즈를 풀면 버섯이 사라지고 한 단계 업그레이드되며 게임이 이어진다", () => {
    const first = stage(createWorld()).mushrooms[0];
    const quiz = run(at(createWorld(), { x: first.x - 80 }), right, 1);
    expect(quiz.upgrade).toBe(0);

    const solved = solveMushroom(quiz);
    expect(solved.status).toBe("running");
    expect(solved.upgrade).toBe(1);
    expect(solved.pendingMushroom).toBeNull();
    expect(solved.collected).toEqual([first.id]);
    expect(run(solved, right, 0.2).x).toBeGreaterThan(solved.x);
  });
});

describe("장애물", () => {
  const obstacle = STAGES[0].obstacles[0];
  const before = at(createWorld(), {
    collected: mushroomIds(0).filter((id) => STAGES[0].mushrooms.find((m) => m.id === id)!.x < obstacle.x),
    upgrade: 1,
  });

  it("장애물에 닿으면 앞의 안전한 자리로 돌아오고 진행 상황은 그대로다", () => {
    const state = at(before, { x: obstacle.x - 120 });
    let next = state;
    let bumped: WorldState | null = null;
    for (let i = 0; i < 300 && !bumped; i++) {
      next = stepWorld(next, right, dt);
      if (next.hurt > 0) bumped = next;
    }
    expect(bumped).not.toBeNull();
    expect(bumped!.status).toBe("running");
    expect(bumped!.x).toBeLessThan(obstacle.x - WORLD.playerWidth / 2);
    expect(bumped!.y).toBe(0);
    expect(bumped!.upgrade).toBe(1);
    expect(bumped!.collected).toEqual(before.collected);
  });

  it("점프하면 장애물을 넘어갈 수 있다", () => {
    const state = at(before, { x: obstacle.x - 90 });
    const after = run(state, { ...right, jump: true }, 0.9);
    expect(after.hurt).toBe(0);
    expect(after.x).toBeGreaterThan(obstacle.x + (WORLD.playerWidth + obstacle.width) / 2);
  });

  it("점프하지 않고 걷기만 해서는 장애물을 지나갈 수 없다", () => {
    let next = at(before, { x: obstacle.x - 120 });
    let farthest = next.x;
    for (let i = 0; i < 1200; i++) {
      next = stepWorld(next, right, dt);
      farthest = Math.max(farthest, next.x);
    }
    expect(farthest).toBeLessThan(obstacle.x);
  });

  it("몇 번을 닿아도 게임 오버가 되지 않고 계속 시도할 수 있다", () => {
    let next = at(before, { x: obstacle.x - 120 });
    for (let i = 0; i < 1200; i++) next = stepWorld(next, right, dt);
    expect(next.status).not.toBe("finished");
    expect(next.upgrade).toBe(1);
    expect(next.collected).toEqual(before.collected);
  });
});

describe("적", () => {
  const first = STAGES[0];
  const enemy = first.enemies[0];
  const cleared = at(createWorld(), {
    x: enemy.minX - 100,
    collected: mushroomIds(0),
    upgrade: 3,
  });

  it("적은 정해진 구간을 오가며 움직인다", () => {
    const start = cleared.enemies[0].x;
    const later = run(at(cleared, { x: 40 }), idle, 3);
    const xs = [start];
    let next = at(cleared, { x: 40 });
    for (let i = 0; i < 600; i++) {
      next = stepWorld(next, idle, dt);
      xs.push(next.enemies[0].x);
    }
    expect(later.enemies[0].x).not.toBe(start);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(enemy.minX - 1);
    expect(Math.max(...xs)).toBeLessThanOrEqual(enemy.maxX + 1);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(20);
  });

  it("적에 닿으면 적에게서 멀어진 안전한 자리로 돌아오고 진행 상황은 그대로다", () => {
    let next = cleared;
    let bumped: WorldState | null = null;
    for (let i = 0; i < 900 && !bumped; i++) {
      next = stepWorld(next, right, dt);
      if (next.hurt > 0) bumped = next;
    }
    expect(bumped).not.toBeNull();
    expect(bumped!.status).toBe("running");
    expect(bumped!.y).toBe(0);
    expect(bumped!.upgrade).toBe(3);
    expect(bumped!.collected).toEqual(mushroomIds(0));
    const contact = bumped!.enemies[0].x;
    expect(Math.abs(bumped!.x - contact)).toBeGreaterThan(WORLD.playerWidth);
  });
});

describe("위험 요소 배치", () => {
  const reach = (width: number) => (WORLD.playerWidth + width) / 2;

  function landing(
    index: number,
    hazardX: number,
    fromLeft: boolean,
    enemyId?: string
  ) {
    const start = startStage(createWorld(), index);
    const enemies = start.enemies.map((e) => ({
      ...e,
      x: e.id === enemyId ? hazardX : -500,
    }));
    const x = hazardX + (fromLeft ? -10 : 10);
    return stepWorld({ ...start, x, enemies }, idle, dt).x;
  }

  it("튕겨 돌아온 자리는 다른 위험 요소와 겹치지 않아 끝없이 오가지 않는다", () => {
    for (const [index, def] of STAGES.entries()) {
      const hazards: { x: number; width: number; enemyId?: string }[] = [
        ...def.obstacles.map((o) => ({ x: o.x, width: o.width })),
        ...def.enemies.flatMap((e) => [
          { x: e.minX, width: WORLD.enemyWidth, enemyId: e.id },
          { x: e.maxX, width: WORLD.enemyWidth, enemyId: e.id },
        ]),
      ];
      for (const hazard of hazards) {
        for (const fromLeft of [true, false]) {
          const spot = landing(index, hazard.x, fromLeft, hazard.enemyId);
          const blockedBy = def.obstacles.find(
            (o) => Math.abs(spot - o.x) < reach(o.width)
          );
          const enemyHit = def.enemies.find(
            (e) =>
              e.id !== hazard.enemyId &&
              spot > e.minX - reach(WORLD.enemyWidth) &&
              spot < e.maxX + reach(WORLD.enemyWidth)
          );
          expect(
            blockedBy ?? enemyHit,
            `${def.name} x=${hazard.x} 에서 ${fromLeft ? "왼쪽" : "오른쪽"}으로 돌아온 자리 ${spot}`
          ).toBeUndefined();
        }
      }
    }
  });
});

describe("스테이지 이어짐", () => {
  const names = ["산수 마을", "곱셈 마을", "국어 마을", "영어 마을"];
  const subjects = ["math", "multiplication", "korean", "english"];

  function nearFlag(index: number, patch: Partial<WorldState> = {}) {
    const start = startStage(createWorld(), index);
    return at(start, {
      x: STAGES[index].flagX - 5,
      collected: mushroomIds(index),
      upgrade: 3,
      enemies: start.enemies.map((e) => ({ ...e, x: -500 })),
      ...patch,
    });
  }

  it("마을은 산수, 곱셈, 국어, 영어 순서로 네 개다", () => {
    expect(STAGES.map((s) => s.name)).toEqual(names);
    expect(STAGES.map((s) => s.subject)).toEqual(subjects);
  });

  it("모든 마을 모험은 첫 마을에서 시작하고 깃발마다 다음 마을로 이어지며 업그레이드는 유지된다", () => {
    expect(createWorld().stageIndex).toBe(0);
    for (let index = 0; index < 3; index++) {
      const next = run(nearFlag(index), right, 0.3);
      expect(next.status).toBe("running");
      expect(next.stageIndex).toBe(index + 1);
      expect(stage(next).name).toBe(names[index + 1]);
      expect(next.upgrade).toBe(3);
      expect(next.collected).toEqual([]);
      expect(next.x).toBeLessThan(STAGES[index + 1].flagX);
    }
  });

  it("마지막인 영어 마을의 깃발에 닿으면 한 판이 끝난다", () => {
    const next = run(nearFlag(3, { upgrade: 12 }), right, 0.3);
    expect(next.status).toBe("finished");
    expect(next.upgrade).toBe(12);
  });

  it("마을 하나만 고르면 그 마을에서 시작하고 그 마을의 깃발에서 끝난다", () => {
    for (let index = 0; index < STAGES.length; index++) {
      const picked = createWorld([index]);
      expect(picked.stageIndex).toBe(index);
      expect(picked.enemies.map((e) => e.id)).toEqual(
        STAGES[index].enemies.map((e) => e.id)
      );
      const flagNear = at(picked, {
        x: STAGES[index].flagX - 5,
        collected: mushroomIds(index),
        enemies: picked.enemies.map((e) => ({ ...e, x: -500 })),
      });
      expect(run(flagNear, right, 0.3).status).toBe("finished");
    }
  });

  it("네 마을 모두 움직이는 적과 점프로 넘는 블록이 있고, 마을마다 버섯이 세 개다", () => {
    for (const def of STAGES) {
      expect(def.enemies.length).toBeGreaterThan(0);
      expect(def.obstacles.length).toBeGreaterThan(0);
      expect(def.mushrooms).toHaveLength(3);
    }
  });

  it("영어 마을은 가장 길고 적과 블록이 가장 많다", () => {
    const english = STAGES[3];
    for (const def of STAGES.slice(0, 3)) {
      expect(english.width).toBeGreaterThan(def.width);
      expect(english.enemies.length).toBeGreaterThanOrEqual(def.enemies.length);
      expect(english.obstacles.length).toBeGreaterThanOrEqual(def.obstacles.length);
    }
  });
});
