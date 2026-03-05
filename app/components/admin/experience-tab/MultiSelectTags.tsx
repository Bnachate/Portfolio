"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { TagChip } from "./TagChip";

interface MultiSelectTagOption {
  id: number;
  name: string;
  createDate: string;
  deletedDate: string | null;
  description: string | null;
  featuredImageUrl: string | null;
  schema: string | null;
  updateDate: string | null;
}

interface MultiSelectTagsProps {
  id: string;
  options: MultiSelectTagOption[];
  selectedValues: Partial<MultiSelectTagOption>[];
  onChange: (nextValues: Partial<MultiSelectTagOption>[]) => void;
  placeholder?: string;
}

export function MultiSelectTags({
  id,
  options,
  selectedValues,
  onChange,
  placeholder = "Sélectionner des tags",
}: MultiSelectTagsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isTagMatched = (option: MultiSelectTagOption) => {
    return selectedValues.some(value => value.name?.includes(option.name))
  }

  const toggleTag = (tag: Partial<MultiSelectTagOption>) => {
    const selectedValuesIds = selectedValues.map((value) => value.id)
    const nextValues = selectedValuesIds.includes(tag.id)
      ? selectedValues.filter((value) => value.id !== tag.id)
      : [...selectedValues, tag];
    onChange(nextValues);
  };

  const removeTag = (tag: Partial<MultiSelectTagOption>) => {
    if (!tag || !tag.id) return;
    if (!selectedValues || selectedValues.length === 0) return;
    onChange(selectedValues.filter((value) => value.id !== tag.id));
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
              selectedValues.map((value, index) => (
                <TagChip
                  key={index
                  }
                  label={value.name ?? ''}
                  onRemove={() => removeTag(value)}
                />
              ))
            ) : (
              <span className="text-gray-500 px-1 py-1">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="z-50 max-h-60 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-md"
        >
          {options.map((option) => (
            <DropdownMenu.CheckboxItem
              key={option.id}
              checked={isTagMatched(option)}
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
