/** 업그레이드 단계가 오를수록 조금씩 커지고, 6단계부터는 더 커지지 않는다. */
export function characterScale(upgrade: number) {
  return 1 + 0.12 * Math.min(upgrade, 6);
}

/**
 * 발 위치(footX, footY)를 기준으로 캐릭터를 그린다.
 * 단계마다 장식이 하나씩 늘어난다: 1 망토, 2 별, 3 왕관, 4 황금 신발, 5 날개, 6 빛무리,
 * 7단계부터는 머리 주위의 반짝이는 별이 하나씩 늘어난다(최대 6개).
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  face: CanvasImageSource | null,
  footX: number,
  footY: number,
  upgrade: number
) {
  const s = characterScale(upgrade);
  const legH = 14 * s;
  const bodyH = 26 * s;
  const bodyW = 34 * s;
  const faceD = 52 * s;

  const bodyTop = footY - legH - bodyH;
  const faceTop = bodyTop - faceD + 6 * s;
  const faceCy = faceTop + faceD / 2;

  ctx.save();

  if (upgrade >= 6) {
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(footX, (faceTop + footY) / 2, (footY - faceTop) / 2 + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  if (upgrade >= 5) {
    ctx.fillStyle = "#f8fafc";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(footX + side * (bodyW / 2 - 2 * s), bodyTop + 4 * s);
      ctx.lineTo(footX + side * (bodyW / 2 + 22 * s), bodyTop - 14 * s);
      ctx.lineTo(footX + side * (bodyW / 2 + 16 * s), bodyTop + 18 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (upgrade >= 1) {
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(footX - bodyW / 2, bodyTop + 2 * s);
    ctx.lineTo(footX - bodyW / 2 - 16 * s, footY - legH + 4 * s);
    ctx.lineTo(footX + bodyW / 2 - 4 * s, footY - legH - 4 * s);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = upgrade >= 4 ? "#eab308" : "#1e40af";
  ctx.fillRect(footX - bodyW / 2 + 4 * s, footY - legH, 8 * s, legH);
  ctx.fillRect(footX + bodyW / 2 - 12 * s, footY - legH, 8 * s, legH);

  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.roundRect(footX - bodyW / 2, bodyTop, bodyW, bodyH, 8 * s);
  ctx.fill();

  if (upgrade >= 2) {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = (i % 2 === 0 ? 8 : 3.5) * s;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = footX + Math.cos(a) * r;
      const py = bodyTop + bodyH / 2 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  if (face) {
    ctx.drawImage(face, footX - faceD / 2, faceTop, faceD, faceD);
  } else {
    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.arc(footX, faceCy, faceD / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1f2937";
    for (const dx of [-9, 9]) {
      ctx.beginPath();
      ctx.arc(footX + dx * s, faceCy - 5 * s, 3.2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(footX, faceCy + 3 * s, 11 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(footX, faceCy, faceD / 2, 0, Math.PI * 2);
  ctx.stroke();

  if (upgrade > 6) {
    const count = Math.min(upgrade - 6, 6);
    const radius = faceD * 0.85;
    ctx.fillStyle = "#fde047";
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.55;
      sparkle(
        ctx,
        footX + Math.cos(angle) * radius,
        faceCy + Math.sin(angle) * radius,
        6 * s
      );
    }
  }

  if (upgrade >= 3) {
    const crownBase = faceTop + 4 * s;
    const w = 34 * s;
    const h = 18 * s;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(footX - w / 2, crownBase);
    ctx.lineTo(footX - w / 2, crownBase - h);
    ctx.lineTo(footX - w / 4, crownBase - h / 2);
    ctx.lineTo(footX, crownBase - h);
    ctx.lineTo(footX + w / 4, crownBase - h / 2);
    ctx.lineTo(footX + w / 2, crownBase - h);
    ctx.lineTo(footX + w / 2, crownBase);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/** 네 갈래로 뾰족한 작은 별을 현재 채우기 색으로 그린다. */
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? r : r * 0.35;
    const angle = -Math.PI / 2 + (i * Math.PI) / 4;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}
