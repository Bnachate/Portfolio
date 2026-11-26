"use client";

import { Plus } from "lucide-react";
import { Button } from "@/app/components/common/Button";
import { DatePicker } from "@/app/components/common/DatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/common/dialog";
import { Input } from "@/app/components/common/input";
import { Field } from "@/app/components/common/Field";
import { MultiSelectTags } from "@/app/components/admin/common/MultiSelectTags";
import { ErrorBanner } from "@/app/components/common/ErrorBanner";
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
          onClick={() => {
            onReset();
            onOpenChange(true);
          }}
        >
          <Plus size={20} aria-hidden="true" />
          Nouvelle expérience
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'expérience" : "Nouvelle expérience"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <Field id="job" label="Titre du poste">
            <Input
              id="job"
              value={formData.job}
              onChange={(e) => onFormChange({ ...formData, job: e.target.value })}
              maxLength={200}
              required
            />
          </Field>

          <Field id="company" label="Entreprise">
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => onFormChange({ ...formData, company: e.target.value })}
              maxLength={200}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="startDate" label="Date de début">
              <DatePicker
                id="startDate"
                value={formData.startDate}
                onChange={(value) => onFormChange({ ...formData, startDate: value })}
                required
              />
            </Field>

            <Field id="endDate" label="Date de fin (vide = poste actuel)">
              <DatePicker
                id="endDate"
                value={formData.endDate ?? ""}
                min={formData.startDate || undefined}
                onChange={(value) => onFormChange({ ...formData, endDate: value || null })}
              />
            </Field>
          </div>

          <Field id="tags" label="Tags">
            <MultiSelectTags
              id="tags"
              options={tags}
              selectedValues={formData.tags}
              onChange={(nextTags) => onFormChange({ ...formData, tags: nextTags })}
              onCreate={onCreateTag}
            />
          </Field>

          <Field
            id="description"
            label="Description"
            hint="Une ligne par point : chaque ligne devient une puce sur la page Expérience."
            footer={
              <p className="text-right font-mono text-xs text-slate">
                {formData.description.length}/{DESCRIPTION_MAX_LENGTH}
              </p>
            }
          >
            <Textarea
              id="description"
              rows={4}
              className="field-sizing-fixed whitespace-pre-wrap wrap-break-word"
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              maxLength={DESCRIPTION_MAX_LENGTH}
              required
            />
          </Field>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {isSaving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
