import type { ComponentProps } from "react";
import { fieldClass, type FieldSize } from "./fieldStyles";
import { cn } from "./utils";
import type { JSX } from "react";

/** Native select with the field look. Its width follows its content unless `className` sets one. */
export function Select({ className, fieldSize = "md", ...props }: ComponentProps<"select"> & { fieldSize?: FieldSize }): JSX.Element {
  return <select data-slot="select" className={fieldClass(fieldSize, cn("px-3", className))} {...props} />;
}
