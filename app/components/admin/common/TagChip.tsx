import { X } from "lucide-react";

interface TagChipProps {
  label: string;
  /** Shows a remove button (a real <button>, so it must not be placed inside another button). */
  onRemove?: () => void;
}

export function TagChip({ label, onRemove }: TagChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-1 text-xs text-gray-700">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Retirer ${label}`}
          className="inline-flex rounded-full p-0.5 text-gray-600 hover:bg-cyan-200 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-cyan-700"
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
