import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { fieldClass, type FieldSize } from "./fieldStyles";
import { cn } from "./utils";

type InputProps = ComponentProps<"input"> & {
  fieldSize?: FieldSize;
  /** Decorative icon at the start of the field (hidden from assistive technologies). */
  icon?: LucideIcon;
  /** Element at the end of the field, such as a show / hide password `IconButton`. */
  end?: ReactNode;
};

/** Text field. With `icon` or `end`, it is wrapped in a relative box that holds them. */
function Input({ className, fieldSize = "md", icon: Icon, end, ...props }: InputProps) {
  const input = (
    <input
      data-slot="input"
      className={fieldClass(fieldSize, cn("flex w-full min-w-0", Icon && "pl-11", end && "pr-12", className))}
      {...props}
    />
  );
  if (!Icon && !end) return input;
  return (
    <div className="relative w-full">
      {Icon && <Icon size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate" />}
      {input}
      {end && <div className="absolute top-1/2 right-1 -translate-y-1/2">{end}</div>}
    </div>
  );
}

export { Input };
