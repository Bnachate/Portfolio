"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Plus } from "lucide-react";
import { fieldClass } from "@/app/components/common/fieldStyles";
import { IconButton } from "@/app/components/common/IconButton";
import { Input } from "@/app/components/common/input";
import { Tag as TagLabel } from "@/app/components/common/Tag";
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

  const count = selectedValues.length;

  // Three separate parts, as ARIA requires: removable chips (buttons cannot sit inside the menu trigger),
  // a menu holding only checkbox items, and the creation field outside the menu.
  return (
    <div className="space-y-2">
      {count > 0 && (
        <ul aria-label="Tags sélectionnés" className="flex flex-wrap gap-1.5">
          {selectedValues.map((value) => (
            <li key={value.id}>
              <TagLabel name={value.name} onRemove={() => removeTag(value)} />
            </li>
          ))}
        </ul>
      )}

      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button type="button" id={id} className={fieldClass("md", "flex w-full cursor-pointer items-center justify-between text-left")}>
            <span className={count > 0 ? "text-ink" : "text-slate"}>
              {count > 0 ? `${count} tag${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}` : placeholder}
            </span>
            <ChevronDown size={18} aria-hidden="true" className={`text-slate transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="start"
            className="z-50 max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto rounded-lg border border-line bg-white p-1 font-display shadow-md"
          >
            {options.map((option) => (
              <DropdownMenu.CheckboxItem
                key={option.id}
                checked={selectedIds.has(option.id)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => toggleTag(option)}
                className="relative flex min-h-10 cursor-pointer select-none items-center rounded py-2 pr-8 pl-3 text-base text-ink outline-none data-highlighted:bg-mist data-[state=checked]:font-semibold"
              >
                <DropdownMenu.ItemIndicator className="absolute right-2 inline-flex items-center">
                  <Check size={16} aria-hidden="true" className="text-mint" />
                </DropdownMenu.ItemIndicator>
                {option.name}
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {onCreate && (
        <div>
          <div className="flex gap-2">
            <Input
              aria-label="Nom du nouveau tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                // Enter creates the tag instead of submitting the surrounding form
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="Nouveau tag"
              maxLength={50}
            />
            <IconButton label="Créer le tag" tone="neutral" onClick={handleCreate} disabled={isCreating || !newTagName.trim()}>
              <Plus size={20} aria-hidden="true" />
            </IconButton>
          </div>
          {createError && (
            <p role="alert" className="mt-1 font-display text-sm text-danger">
              {createError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
