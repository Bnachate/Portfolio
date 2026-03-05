interface TagChipProps {
  label: string;
  onRemove?: () => void;
}

export function TagChip({ label, onRemove }: TagChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-gray-600">
      {label}
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }
          }}
          className="inline-flex cursor-pointer"
          aria-label={`Retirer ${label}`}
        >
        </span>
      )}
    </span>
  );
}
