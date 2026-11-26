import type { ComponentProps } from "react";
import { fieldClass, type FieldSize } from "./fieldStyles";
import { cn } from "./utils";

/** Native select with the field look. Its width follows its content unless `className` sets one. */
export function Select({ className, fieldSize = "md", ...props }: ComponentProps<"select"> & { fieldSize?: FieldSize }) {
  return <select data-slot="select" className={fieldClass(fieldSize, cn("px-3", className))} {...props} />;
}
