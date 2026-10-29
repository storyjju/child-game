import { drawCharacter } from "@/game/character";
import { STAGES, WORLD, type WorldState } from "@/game/world";

export const GROUND_Y = WORLD.height - WORLD.groundHeight;

/** 캐릭터가 화면 왼쪽 가까이에 오도록 카메라를 따라 움직인다. */
export function cameraX(playerX: number, stageWidth: number) {
  return Math.min(
    Math.max(0, playerX - WORLD.width * 0.4),
    stageWidth - WORLD.width
  );
}

function drawMushroom(ctx: CanvasRenderingContext2D, x: number) {
  const baseY = GROUND_Y - 18;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 7, baseY - 16, 14, 16);
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 7, baseY - 16, 14, 16);
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(x, baseY - 16, 22, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (const dx of [-11, 0, 11]) {
    ctx.beginPath();
    ctx.arc(x + dx, baseY - 26 + Math.abs(dx) / 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  height: number
) {
  const left = x - width / 2;
  const top = GROUND_Y - height;
  ctx.fillStyle = "#b45309";
  ctx.fillRect(left, top, width, height);
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 3;
  ctx.strokeRect(left + 1.5, top + 1.5, width - 3, height - 3);
  ctx.beginPath();
  ctx.moveTo(left, top + height / 2);
  ctx.lineTo(left + width, top + height / 2);
  ctx.stroke();
}

function drawEnemy(ctx: CanvasRenderingContext2D, x: number, dir: number) {
  const w = WORLD.enemyWidth;
  const h = WORLD.enemyHeight;
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.moveTo(x - w / 2, GROUND_Y);
  ctx.quadraticCurveTo(x - w / 2, GROUND_Y - h * 1.3, x, GROUND_Y - h * 1.3);
  ctx.quadraticCurveTo(x + w / 2, GROUND_Y - h * 1.3, x + w / 2, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (const dx of [-7, 7]) {
    ctx.beginPath();
    ctx.arc(x + dx + dir * 2, GROUND_Y - h * 0.65, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#1f2937";
  for (const dx of [-7, 7]) {
    ctx.beginPath();
    ctx.arc(x + dx + dir * 3.5, GROUND_Y - h * 0.65, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number) {
  ctx.fillStyle = "#6b7280";
  ctx.fillRect(x - 3, GROUND_Y - 130, 6, 130);
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.moveTo(x + 3, GROUND_Y - 130);
  ctx.lineTo(x + 53, GROUND_Y - 110);
  ctx.lineTo(x + 3, GROUND_Y - 90);
  ctx.closePath();
  ctx.fill();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  state: WorldState,
  face: CanvasImageSource | null
) {
  const stage = STAGES[state.stageIndex];
  const camera = cameraX(state.x, stage.width);

  ctx.clearRect(0, 0, WORLD.width, WORLD.height);

  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.theme.skyTop);
  sky.addColorStop(1, stage.theme.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.width, GROUND_Y);

  ctx.save();
  ctx.translate(-camera, 0);

  ctx.fillStyle = "#ffffffcc";
  for (let cx = 150; cx < stage.width; cx += 370) {
    const cy = 60 + ((cx * 7) % 40);
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.arc(cx + 26, cy + 6, 20, 0, Math.PI * 2);
    ctx.arc(cx - 26, cy + 6, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = stage.theme.ground;
  ctx.fillRect(0, GROUND_Y, stage.width, WORLD.groundHeight);
  ctx.fillStyle = stage.theme.groundTop;
  ctx.fillRect(0, GROUND_Y, stage.width, 8);

  for (const mushroom of stage.mushrooms) {
    if (!state.collected.includes(mushroom.id)) drawMushroom(ctx, mushroom.x);
  }
  for (const obstacle of stage.obstacles) {
    drawObstacle(ctx, obstacle.x, obstacle.width, obstacle.height);
  }
  for (const enemy of state.enemies) drawEnemy(ctx, enemy.x, enemy.dir);
  drawFlag(ctx, stage.flagX);

  const blinkOff = state.hurt > 0 && Math.floor(state.hurt * 10) % 2 === 0;
  if (!blinkOff) {
    drawCharacter(ctx, face, state.x, GROUND_Y - state.y, state.upgrade);
  }

  ctx.restore();
}
