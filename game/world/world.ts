import { STAGES, type StageDef } from "./stages";

export const WORLD = {
  width: 960,
  height: 400,
  groundHeight: 60,
  playerWidth: 56,
  mushroomWidth: 40,
  enemyWidth: 36,
  enemyHeight: 36,
  speed: 220,
  jumpSpeed: 640,
  gravity: 1500,
  maxStep: 1 / 30,
  hurtSeconds: 0.8,
  bounceGap: 60,
  startX: 40,
} as const;

export type Input = { left: boolean; right: boolean; jump: boolean };

export type EnemyState = { id: string; x: number; dir: 1 | -1 };

/** hurt는 부딪친 뒤 깜빡이는 시간일 뿐이고 충돌을 막아 주지 않는다. */
export type WorldState = {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  status: "running" | "quiz" | "finished";
  stageIndex: number;
  pendingMushroom: string | null;
  collected: string[];
  upgrade: number;
  enemies: EnemyState[];
  hurt: number;
};

function enemiesOf(stage: StageDef): EnemyState[] {
  return stage.enemies.map((e) => ({ id: e.id, x: e.minX, dir: 1 }));
}

export function createWorld(): WorldState {
  return {
    x: WORLD.startX,
    y: 0,
    vy: 0,
    onGround: true,
    status: "running",
    stageIndex: 0,
    pendingMushroom: null,
    collected: [],
    upgrade: 0,
    enemies: enemiesOf(STAGES[0]),
    hurt: 0,
  };
}

/** 업그레이드는 그대로 두고 지정한 스테이지의 처음 상태로 옮긴다. */
export function startStage(state: WorldState, stageIndex: number): WorldState {
  return {
    ...state,
    x: WORLD.startX,
    y: 0,
    vy: 0,
    onGround: true,
    status: "running",
    stageIndex,
    pendingMushroom: null,
    collected: [],
    enemies: enemiesOf(STAGES[stageIndex]),
    hurt: 0,
  };
}

function overlaps(x: number, otherX: number, otherWidth: number) {
  return Math.abs(x - otherX) < (WORLD.playerWidth + otherWidth) / 2;
}

function moveEnemies(stage: StageDef, enemies: EnemyState[], step: number) {
  return enemies.map((enemy) => {
    const def = stage.enemies.find((e) => e.id === enemy.id)!;
    let x = enemy.x + enemy.dir * def.speed * step;
    let dir = enemy.dir;
    if (x >= def.maxX) {
      x = def.maxX;
      dir = -1;
    } else if (x <= def.minX) {
      x = def.minX;
      dir = 1;
    }
    return { ...enemy, x, dir };
  });
}

/** 부딪친 대상의 반대편, 조금 떨어진 안전한 자리로 돌려보낸다. */
function bounceX(stage: StageDef, x: number, hazardX: number, hazardWidth: number) {
  const half = WORLD.playerWidth / 2;
  const distance = hazardWidth / 2 + half + WORLD.bounceGap;
  const bounced = x < hazardX ? hazardX - distance : hazardX + distance;
  return Math.min(stage.width - half, Math.max(half, bounced));
}

export function stepWorld(state: WorldState, input: Input, dt: number): WorldState {
  if (state.status !== "running") return state;

  const stage = STAGES[state.stageIndex];
  const step = Math.min(dt, WORLD.maxStep);
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const half = WORLD.playerWidth / 2;

  let x = Math.min(
    stage.width - half,
    Math.max(half, state.x + direction * WORLD.speed * step)
  );

  let vy = state.vy;
  if (state.onGround && input.jump) vy = WORLD.jumpSpeed;
  vy -= WORLD.gravity * step;
  let y = state.y + vy * step;
  let onGround = false;
  if (y <= 0) {
    y = 0;
    vy = 0;
    onGround = true;
  }

  const enemies = moveEnemies(stage, state.enemies, step);
  let hurt = Math.max(0, state.hurt - step);

  const obstacle = stage.obstacles.find(
    (o) => y < o.height && overlaps(x, o.x, o.width)
  );
  const enemy = enemies.find(
    (e) => y < WORLD.enemyHeight && overlaps(x, e.x, WORLD.enemyWidth)
  );
  const hit = obstacle
    ? { x: obstacle.x, width: obstacle.width }
    : enemy
      ? { x: enemy.x, width: WORLD.enemyWidth }
      : null;
  if (hit) {
    x = bounceX(stage, x, hit.x, hit.width);
    y = 0;
    vy = 0;
    onGround = true;
    hurt = WORLD.hurtSeconds;
  }

  const next: WorldState = { ...state, x, y, vy, onGround, enemies, hurt };

  const mushroom = stage.mushrooms.find(
    (m) => !state.collected.includes(m.id) && overlaps(x, m.x, WORLD.mushroomWidth)
  );
  if (mushroom) return { ...next, status: "quiz", pendingMushroom: mushroom.id };

  if (x >= stage.flagX) {
    return state.stageIndex < STAGES.length - 1
      ? startStage(next, state.stageIndex + 1)
      : { ...next, status: "finished" };
  }

  return next;
}

export function solveMushroom(state: WorldState): WorldState {
  if (state.status !== "quiz" || state.pendingMushroom === null) return state;
  return {
    ...state,
    status: "running",
    collected: [...state.collected, state.pendingMushroom],
    pendingMushroom: null,
    upgrade: state.upgrade + 1,
  };
}
