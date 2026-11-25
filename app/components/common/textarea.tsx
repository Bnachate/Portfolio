import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full resize-y rounded-lg border-[1.5px] border-slate bg-white px-3.5 py-3 font-display text-base leading-normal text-ink transition-colors duration-150 focus:border-mint focus:shadow-[0_0_0_1px_var(--color-mint)] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-line disabled:bg-mist disabled:text-slate aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
