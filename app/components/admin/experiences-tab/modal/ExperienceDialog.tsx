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
import type { ChangeEvent, JSX } from "react";

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
  /** Existing employers, suggested in the company field so a typo does not create a duplicate */
  companyNames?: string[];
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
  companyNames = [],
  onFormChange,
  onCreateTag,
  onSubmit,
  onReset,
}: ExperienceDialogProps): JSX.Element {
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange({ ...formData, job: e.target.value })}
              maxLength={200}
              required
            />
          </Field>

          <Field id="company" label="Entreprise" hint="Une entreprise existante, ou un nouveau nom : son contexte se rédige ensuite dans l'onglet Entreprises.">
            <Input
              id="company"
              list="company-names"
              autoComplete="off"
              value={formData.company}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onFormChange({ ...formData, company: e.target.value })}
              maxLength={200}
              required
            />
          </Field>
          <datalist id="company-names">
            {companyNames.map((name: string) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="startDate" label="Date de début">
              <DatePicker
                id="startDate"
                value={formData.startDate}
                onChange={(value: string) => onFormChange({ ...formData, startDate: value })}
                required
              />
            </Field>

            <Field id="endDate" label="Date de fin (vide = poste actuel)">
              <DatePicker
                id="endDate"
                value={formData.endDate ?? ""}
                min={formData.startDate || undefined}
                onChange={(value: string) => onFormChange({ ...formData, endDate: value || null })}
              />
            </Field>
          </div>

          <Field id="tags" label="Tags">
            <MultiSelectTags
              id="tags"
              options={tags}
              selectedValues={formData.tags}
              onChange={(nextTags: Tag[]) => onFormChange({ ...formData, tags: nextTags })}
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
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onFormChange({ ...formData, description: e.target.value })}
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
