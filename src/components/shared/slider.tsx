import { Slider as BaseSlider } from "@base-ui/react";
import { clsx } from "clsx";
import { moodColor } from "@/utils/mood-color";

type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  const thumbColor = moodColor((value - min) / (max - min));

  return (
    <BaseSlider.Root
      value={value}
      onValueChange={(next) => onValueChange(Array.isArray(next) ? next[0] : next)}
      min={min}
      max={max}
      step={step}
      thumbAlignment="edge"
      className={clsx("relative flex w-full items-center select-none", className)}
    >
      <BaseSlider.Control className="flex w-full items-center cursor-default">
        <BaseSlider.Track className="relative h-10 w-full rounded-2xl bg-surface-tint outline outline-border -outline-offset-1">
          <BaseSlider.Thumb
            style={{ backgroundColor: thumbColor }}
            className="size-10 border border-border rounded-2xl shadow transition-transform active:scale-110 focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-2"
          />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
