"use client";

import { Plus } from "lucide-react";
import { Button } from "@/app/components/common/Button";
import { DatePicker } from "@/app/components/common/DatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/common/dialog";
import { Input } from "@/app/components/common/input";
import { Label } from "@/app/components/common/label";
import { MultiSelectTags } from "@/app/components/admin/common/MultiSelectTags";
import { ErrorBanner } from "@/app/components/admin/common/ErrorBanner";
import { Textarea } from "@/app/components/common/textarea";
import type { Tag } from "@/app/types/api";

const DESCRIPTION_MAX_LENGTH = 2000;

export interface ExperienceFormData {
  job: string;
  company: string;
  position: number;
  startDate: string;
  endDate: string | null;
  description: string;
  tags: Tag[];
}

interface ExperienceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  submitDisabled: boolean;
  isSaving: boolean;
  error: string;
  formData: ExperienceFormData;
  tags: Tag[];
  onFormChange: (nextFormData: ExperienceFormData) => void;
  onCreateTag: (name: string) => Promise<Tag>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export function ExperienceDialog({
  isOpen,
  onOpenChange,
  isEditing,
  submitDisabled,
  isSaving,
  error,
  formData,
  tags,
  onFormChange,
  onCreateTag,
  onSubmit,
  onReset,
}: ExperienceDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-auto px-5"
          onClick={() => {
            onReset();
            onOpenChange(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Nouvelle expérience
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'expérience" : "Nouvelle expérience"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <div className="space-y-2">
            <Label htmlFor="job">Titre du poste</Label>
            <Input
              id="job"
              value={formData.job}
              onChange={(e) => onFormChange({ ...formData, job: e.target.value })}
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => onFormChange({ ...formData, company: e.target.value })}
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                min={0}
                value={formData.position}
                onChange={(e) => onFormChange({ ...formData, position: Number(e.target.value) })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <DatePicker
                id="startDate"
                value={formData.startDate}
                onChange={(value) => onFormChange({ ...formData, startDate: value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <DatePicker
                id="endDate"
                value={formData.endDate ?? ""}
                min={formData.startDate || undefined}
                onChange={(value) => onFormChange({ ...formData, endDate: value || null })}
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <MultiSelectTags
              id="tags"
              options={tags}
              selectedValues={formData.tags}
              onChange={(nextTags) => onFormChange({ ...formData, tags: nextTags })}
              onCreate={onCreateTag}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              className="field-sizing-fixed resize-y whitespace-pre-wrap wrap-break-word"
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              maxLength={DESCRIPTION_MAX_LENGTH}
              required
            />
            <p className="text-right text-xs text-gray-500">
              {formData.description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={submitDisabled}>
              {isSaving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
