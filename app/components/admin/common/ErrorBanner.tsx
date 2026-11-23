import { AlertCircle, X } from "lucide-react";

export function ErrorBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  return (
    <div role="alert" className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
      <AlertCircle size={18} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fermer" className="text-red-500 hover:text-red-700">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
