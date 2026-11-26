import type { ComponentProps } from "react";
import { fieldClass, type FieldSize } from "./fieldStyles";
import { cn } from "./utils";

function Textarea({ className, fieldSize = "md", ...props }: ComponentProps<"textarea"> & { fieldSize?: FieldSize }) {
  return <textarea data-slot="textarea" className={fieldClass(fieldSize, cn("flex min-h-24 w-full resize-y py-3 leading-normal", className))} {...props} />;
}

export { Textarea };
