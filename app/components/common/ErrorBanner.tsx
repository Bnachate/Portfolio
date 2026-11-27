import { AlertCircle, X } from "lucide-react";
import { IconButton } from "./IconButton";
import { cn } from "./utils";
import type { JSX } from "react";

/**
 * Error message (role="alert"), rendered only when `message` is not empty.
 * Errors use the danger color only (design system: red is reserved for deletion and errors).
 */
export function ErrorBanner({ message, onClose, className }: { message: string; onClose?: () => void; className?: string }): JSX.Element | null {
  if (!message) return null;
  return (
    <div role="alert" className={cn("flex items-center gap-2 rounded-lg border border-danger bg-danger-pale p-3 font-display text-base font-medium text-danger", className)}>
      <AlertCircle size={18} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <IconButton label="Fermer le message d'erreur" tone="ghostDanger" size="sm" onClick={onClose} className="hover:bg-white">
          <X size={16} aria-hidden="true" />
        </IconButton>
      )}
    </div>
  );
}
