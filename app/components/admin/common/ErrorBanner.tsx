import { AlertCircle, X } from "lucide-react";

// Errors use the danger color only (design system: red is reserved for deletion and errors)
export function ErrorBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div role="alert" className="m-4 flex items-center gap-2 rounded-lg border border-danger bg-danger-pale p-3 font-display text-base font-medium text-danger">
      <AlertCircle size={18} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
