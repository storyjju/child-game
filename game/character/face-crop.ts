export const FACE_SIZE = 256;

export type FaceFraming = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export const DEFAULT_FRAMING: FaceFraming = { zoom: 1, offsetX: 0, offsetY: 0 };

/** 사진의 한 부분을 둥글게 잘라 캔버스에 그린다. offset은 -1~1, zoom은 1 이상이다. */
export function drawFaceCrop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  framing: FaceFraming
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const side = Math.min(image.naturalWidth, image.naturalHeight) / framing.zoom;
  const slackX = (image.naturalWidth - side) / 2;
  const slackY = (image.naturalHeight - side) / 2;
  const sx = slackX + framing.offsetX * slackX;
  const sy = slackY + framing.offsetY * slackY;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, sx, sy, side, side, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}
