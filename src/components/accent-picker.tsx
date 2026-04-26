import { clsx } from "clsx";
import { useStore } from "@nanostores/react";
import { $userSettings, ACCENT_COLORS, type AccentColor } from "@/stores/user-settings";

const LABEL: Record<AccentColor, string> = {
  yellow: "Yellow",
  orange: "Orange",
  rose: "Rose",
  violet: "Violet",
  sky: "Sky",
  emerald: "Emerald",
};

const SWATCH_CLASS: Record<AccentColor, string> = {
  yellow: "bg-(--accent-yellow)",
  orange: "bg-(--accent-orange)",
  rose: "bg-(--accent-rose)",
  violet: "bg-(--accent-violet)",
  sky: "bg-(--accent-sky)",
  emerald: "bg-(--accent-emerald)",
};

export function AccentPicker() {
  const settings = useStore($userSettings);
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACCENT_COLORS.map((color) => {
        const selected = settings.accent === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => $userSettings.set({ ...settings, accent: color })}
            aria-pressed={selected}
            className={clsx(
              "flex flex-col items-center gap-2 rounded-xl px-3 py-3 transition-colors cursor-default",
              "outline hover:bg-surface-tint",
              selected ? "outline-2 outline-foreground-muted" : "outline-border",
            )}
          >
            <span
              className={clsx("size-8 rounded-full ring-2 ring-background", SWATCH_CLASS[color])}
            />
            <span className="text-xs text-foreground">{LABEL[color]}</span>
          </button>
        );
      })}
    </div>
  );
}
