import * as React from "react";

import { cn } from "./utils";

// Design system field: slate border, 8 px radius, 44 px high; disabled = mist background (read-only admin)
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-11 w-full min-w-0 rounded-lg border-[1.5px] border-slate bg-white px-3.5 font-display text-base text-ink transition-colors duration-150 focus:border-mint focus:shadow-[0_0_0_1px_var(--color-mint)] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-line disabled:bg-mist disabled:text-slate aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
