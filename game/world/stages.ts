import type { Subject } from "@/game/subject";

export type MushroomDef = { id: string; x: number };
export type ObstacleDef = { id: string; x: number; width: number; height: number };
export type EnemyDef = { id: string; minX: number; maxX: number; speed: number };

export type StageDef = {
  id: string;
  name: string;
  subject: Subject;
  width: number;
  flagX: number;
  mushrooms: MushroomDef[];
  obstacles: ObstacleDef[];
  enemies: EnemyDef[];
  theme: { skyTop: string; skyBottom: string; ground: string; groundTop: string };
};

const OBSTACLE = { width: 32, height: 40 };

export const STAGES: StageDef[] = [
  {
    id: "math-village",
    name: "산수 마을",
    subject: "math",
    width: 960,
    flagX: 890,
    mushrooms: [
      { id: "mushroom-1", x: 300 },
      { id: "mushroom-2", x: 520 },
      { id: "mushroom-3", x: 740 },
    ],
    obstacles: [
      { id: "block-1", x: 410, ...OBSTACLE },
      { id: "block-2", x: 630, ...OBSTACLE },
    ],
    enemies: [{ id: "enemy-1", minX: 800, maxX: 860, speed: 50 }],
    theme: {
      skyTop: "#7dd3fc",
      skyBottom: "#e0f2fe",
      ground: "#4ade80",
      groundTop: "#86efac",
    },
  },
  {
    id: "multiplication-village",
    name: "곱셈 마을",
    subject: "multiplication",
    width: 1280,
    flagX: 1210,
    mushrooms: [
      { id: "mushroom-1", x: 330 },
      { id: "mushroom-2", x: 840 },
      { id: "mushroom-3", x: 1110 },
    ],
    obstacles: [
      { id: "block-1", x: 200, ...OBSTACLE },
      { id: "block-2", x: 700, ...OBSTACLE },
    ],
    enemies: [
      { id: "enemy-1", minX: 450, maxX: 510, speed: 55 },
      { id: "enemy-2", minX: 960, maxX: 1020, speed: 60 },
    ],
    theme: {
      skyTop: "#a5b4fc",
      skyBottom: "#e0e7ff",
      ground: "#fbbf24",
      groundTop: "#fde68a",
    },
  },
  {
    id: "korean-village",
    name: "국어 마을",
    subject: "korean",
    width: 1240,
    flagX: 1170,
    mushrooms: [
      { id: "mushroom-1", x: 370 },
      { id: "mushroom-2", x: 850 },
      { id: "mushroom-3", x: 1090 },
    ],
    obstacles: [
      { id: "block-1", x: 230, ...OBSTACLE },
      { id: "block-2", x: 720, ...OBSTACLE },
    ],
    enemies: [
      { id: "enemy-1", minX: 480, maxX: 540, speed: 55 },
      { id: "enemy-2", minX: 960, maxX: 1020, speed: 60 },
    ],
    theme: {
      skyTop: "#f9a8d4",
      skyBottom: "#fce7f3",
      ground: "#fb7185",
      groundTop: "#fda4af",
    },
  },
  {
    id: "english-village",
    name: "영어 마을",
    subject: "english",
    width: 1440,
    flagX: 1370,
    mushrooms: [
      { id: "mushroom-1", x: 360 },
      { id: "mushroom-2", x: 760 },
      { id: "mushroom-3", x: 1160 },
    ],
    obstacles: [
      { id: "block-1", x: 220, ...OBSTACLE },
      { id: "block-2", x: 640, ...OBSTACLE },
      { id: "block-3", x: 1040, ...OBSTACLE },
    ],
    enemies: [
      { id: "enemy-1", minX: 420, maxX: 480, speed: 55 },
      { id: "enemy-2", minX: 820, maxX: 880, speed: 60 },
      { id: "enemy-3", minX: 1230, maxX: 1300, speed: 60 },
    ],
    theme: {
      skyTop: "#fdba74",
      skyBottom: "#fef3c7",
      ground: "#c4b5fd",
      groundTop: "#ddd6fe",
    },
  },
];
