import type { ComponentProps } from "react";
import { fieldClass, type FieldSize } from "./fieldStyles";
import { cn } from "./utils";
import type { JSX } from "react";

function Textarea({ className, fieldSize = "md", ...props }: ComponentProps<"textarea"> & { fieldSize?: FieldSize }): JSX.Element {
  return <textarea data-slot="textarea" className={fieldClass(fieldSize, cn("flex min-h-24 w-full resize-y py-3 leading-normal", className))} {...props} />;
}

export { Textarea };
