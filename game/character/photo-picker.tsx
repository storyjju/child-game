"use client";

import { useEffect, useRef, useState } from "react";

import { Slider } from "@/components/ui/slider";

import {
  DEFAULT_FRAMING,
  drawFaceCrop,
  FACE_SIZE,
  type FaceFraming,
} from "./face-crop";

type PhotoPickerProps = {
  onFaceChange: (face: HTMLCanvasElement | null) => void;
};

export function PhotoPicker({ onFaceChange }: PhotoPickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [framing, setFraming] = useState<FaceFraming>(DEFAULT_FRAMING);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawFaceCrop(canvasRef.current, image, framing);
    }
  }, [image, framing]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const loaded = new Image();
    loaded.onload = () => {
      URL.revokeObjectURL(url);
      setFailed(false);
      setFraming(DEFAULT_FRAMING);
      setImage(loaded);
      if (canvasRef.current) {
        drawFaceCrop(canvasRef.current, loaded, DEFAULT_FRAMING);
        onFaceChange(canvasRef.current);
      }
    };
    loaded.onerror = () => {
      URL.revokeObjectURL(url);
      setFailed(true);
      setImage(null);
      onFaceChange(null);
    };
    loaded.src = url;
  }

  function adjust(patch: Partial<FaceFraming>) {
    setFraming((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div className="relative size-48 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10">
        <canvas
          ref={canvasRef}
          width={FACE_SIZE}
          height={FACE_SIZE}
          aria-label="얼굴 미리보기"
          className="size-full"
        />
        {!image && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
            사진을 고르면 여기에 얼굴이 보여요
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          얼굴 사진
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
          />
        </label>
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            사진을 열 수 없어요. 다른 사진을 골라 주세요.
          </p>
        )}

        <div className="flex flex-col gap-3" aria-disabled={!image}>
          <FramingSlider
            label="확대"
            min={1}
            max={3}
            step={0.05}
            value={framing.zoom}
            disabled={!image}
            onChange={(zoom) => adjust({ zoom })}
          />
          <FramingSlider
            label="좌우 위치"
            min={-1}
            max={1}
            step={0.05}
            value={framing.offsetX}
            disabled={!image}
            onChange={(offsetX) => adjust({ offsetX })}
          />
          <FramingSlider
            label="상하 위치"
            min={-1}
            max={1}
            step={0.05}
            value={framing.offsetY}
            disabled={!image}
            onChange={(offsetY) => adjust({ offsetY })}
          />
        </div>
      </div>
    </div>
  );
}

type FramingSliderProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

function FramingSlider({
  label,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
}: FramingSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={disabled}
        onValueChange={(next) =>
          onChange(Array.isArray(next) ? next[0] : next)
        }
      />
    </div>
  );
}
