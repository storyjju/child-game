"use client";

import { Button } from "@/components/ui/button";

import { ANIMALS } from "./animal";

type AnimalPickerProps = {
  value: string;
  onChange: (id: string) => void;
};

export function AnimalPicker({ value, onChange }: AnimalPickerProps) {
  return (
    <div role="radiogroup" aria-label="내 표시" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ANIMALS.map((animal) => (
        <Button
          key={animal.id}
          role="radio"
          aria-checked={animal.id === value}
          aria-label={animal.name}
          variant={animal.id === value ? "default" : "outline"}
          className="h-16 flex-col gap-0 text-xs"
          onClick={() => onChange(animal.id)}
        >
          <span aria-hidden className="text-2xl leading-none">
            {animal.emoji}
          </span>
          {animal.name}
        </Button>
      ))}
    </div>
  );
}
