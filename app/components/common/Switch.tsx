import type { ReactNode } from "react";

/**
 * Accessible on / off switch (role="switch", mint when on, slate when off),
 * with its visible label and an optional description next to it.
 */
export function Switch({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-[34px] w-[60px] shrink-0 cursor-pointer rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "bg-mint" : "bg-slate"}`}
      >
        <span aria-hidden="true" className={`absolute top-1 h-[26px] w-[26px] rounded-full bg-white transition-[left] duration-150 ${checked ? "left-[30px]" : "left-1"}`} />
      </button>
      <div className="flex flex-col">
        <label htmlFor={id} className="font-display text-base font-semibold">
          {label}
        </label>
        {description && <span className="font-display text-sm text-slate">{description}</span>}
      </div>
    </div>
  );
}
