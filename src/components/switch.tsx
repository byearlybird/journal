import { Switch as HeadlessSwitch } from "@headlessui/react";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      {label && (
        <span
          className={`text-sm transition-colors ${checked ? "text-white/70" : "text-white/30"}`}
        >
          {label}
        </span>
      )}
      <HeadlessSwitch
        checked={checked}
        onChange={onChange}
        className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent outline outline-white/10 bg-white/5 transition-colors duration-200 ease-in-out data-checked:outline-black/10 data-checked:bg-black"
      >
        <span className="pointer-events-none inline-block size-5 transform rounded-full bg-white/90 shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-5" />
      </HeadlessSwitch>
    </label>
  );
}
