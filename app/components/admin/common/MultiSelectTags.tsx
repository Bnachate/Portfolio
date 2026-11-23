"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Plus } from "lucide-react";
import { TagChip } from "./TagChip";
import { getErrorMessage } from "@/app/config/api.config";
import type { Tag } from "@/app/types/api";

interface MultiSelectTagsProps {
  id: string;
  options: Tag[];
  selectedValues: Tag[];
  onChange: (nextValues: Tag[]) => void;
  /** When provided, shows a field to create a tag that does not exist yet. */
  onCreate?: (name: string) => Promise<Tag>;
  placeholder?: string;
}

export function MultiSelectTags({
  id,
  options,
  selectedValues,
  onChange,
  onCreate,
  placeholder = "Sélectionner des tags",
}: MultiSelectTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedIds = new Set(selectedValues.map((value) => value.id));

  const toggleTag = (tag: Tag) => {
    onChange(selectedIds.has(tag.id)
      ? selectedValues.filter((value) => value.id !== tag.id)
      : [...selectedValues, tag]);
  };

  const removeTag = (tag: Tag) => onChange(selectedValues.filter((value) => value.id !== tag.id));

  const handleCreate = async () => {
    const name = newTagName.trim();
    if (!name || !onCreate) return;

    // Reuse an existing tag with the same name instead of failing
    const existing = options.find((option) => option.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selectedIds.has(existing.id)) onChange([...selectedValues, existing]);
      setNewTagName("");
      return;
    }

    setIsCreating(true);
    setCreateError("");
    try {
      const tag = await onCreate(name);
      onChange([...selectedValues, tag]);
      setNewTagName("");
    } catch (err) {
      setCreateError(getErrorMessage(err, "Impossible de créer le tag"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          id={id}
          className="w-full min-h-10 h-full max-h-50 rounded-md border border-input bg-(--input-background) px-2 py-1.5 text-sm shadow-xs flex items-center justify-between overflow-y-auto resize-none"
        >
          <span className="flex flex-1 flex-wrap gap-1.5 text-left pr-2">
            {selectedValues.length > 0 ? (
              selectedValues.map((value) => (
                <TagChip key={value.id} label={value.name} onRemove={() => removeTag(value)} />
              ))
            ) : (
              <span className="text-gray-500 px-1 py-1">{placeholder}</span>
            )}
          </span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="z-50 max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-md"
        >
          {onCreate && (
            <div className="p-2 border-b border-gray-100 mb-1">
              <div className="flex gap-2">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  // Keep Radix typeahead/navigation from stealing keystrokes
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                  placeholder="Nouveau tag"
                  maxLength={50}
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-cyan-600"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isCreating || !newTagName.trim()}
                  aria-label="Créer le tag"
                  className="inline-flex items-center rounded-md bg-cyan-600 px-2 text-white disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
              {createError && <p className="mt-1 text-xs text-red-600">{createError}</p>}
            </div>
          )}
          {options.map((option) => (
            <DropdownMenu.CheckboxItem
              key={option.id}
              checked={selectedIds.has(option.id)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => toggleTag(option)}
              className="relative flex cursor-pointer select-none items-center rounded-sm py-2 pr-8 pl-3 text-sm font-semibold text-blue-500 outline-none data-highlighted:bg-gray-100"
            >
              <DropdownMenu.ItemIndicator className="absolute right-2 inline-flex items-center">
                <Check size={14} className="text-blue-500" />
              </DropdownMenu.ItemIndicator>
              {option.name}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
