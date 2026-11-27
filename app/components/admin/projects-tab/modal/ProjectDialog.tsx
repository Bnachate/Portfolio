"use client";

import type { FormEvent } from "react";
import { Button } from "@/app/components/common/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/common/dialog";
import { Input } from "@/app/components/common/input";
import { Field, FieldGroup } from "@/app/components/common/Field";
import { MultiSelectTags } from "@/app/components/admin/common/MultiSelectTags";
import { ErrorBanner } from "@/app/components/common/ErrorBanner";
import { Textarea } from "@/app/components/common/textarea";
import type { Tag } from "@/app/types/api";
import type { JSX } from "react";

export interface ProjectFormData {
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string;
  demoUrl: string;
  position: number;
  tags: Tag[];
  // Case study (optional)
  kind: string;
  scope: string;
  role: string;
  context: string;
  achievements: string;
  results: string;
}

interface ProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  isSaving: boolean;
  submitDisabled: boolean;
  error: string;
  formData: ProjectFormData;
  tags: Tag[];
  onFormChange: (nextFormData: ProjectFormData) => void;
  onCreateTag: (name: string) => Promise<Tag>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export function ProjectDialog({
  isOpen,
  onOpenChange,
  isEditing,
  isSaving,
  submitDisabled,
  error,
  formData,
  tags,
  onFormChange,
  onCreateTag,
  onSubmit,
  onReset,
}: ProjectDialogProps): JSX.Element {
  const field = (key: keyof ProjectFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
    onFormChange({ ...formData, [key]: e.target.value });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le projet" : "Nouveau projet"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <ErrorBanner message={error} />

          <FieldGroup title="Présentation">
            <Field id="title" label="Titre du projet">
              <Input id="title" value={formData.title} onChange={field("title")} maxLength={200} required />
            </Field>
            <Field id="description" label="Description">
              <Textarea id="description" rows={3} value={formData.description} onChange={field("description")} maxLength={5000} required />
            </Field>
            <Field id="tags" label="Tags">
              <MultiSelectTags
                id="tags"
                options={tags}
                selectedValues={formData.tags}
                onChange={(nextTags: Tag[]) => onFormChange({ ...formData, tags: nextTags })}
                onCreate={onCreateTag}
              />
            </Field>
          </FieldGroup>

          <FieldGroup title="Liens et image">
            <Field id="projectImageUrl" label="URL de l'image">
              <Input
                id="projectImageUrl"
                type="url"
                value={formData.projectImageUrl}
                onChange={field("projectImageUrl")}
                placeholder="https://exemple.com/capture.png (1120 × 560 px idéalement)"
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="githubUrl" label="URL GitHub">
                <Input id="githubUrl" type="url" value={formData.githubUrl} onChange={field("githubUrl")} placeholder="https://github.com/..." />
              </Field>
              <Field id="demoUrl" label="URL de démo">
                <Input id="demoUrl" type="url" value={formData.demoUrl} onChange={field("demoUrl")} placeholder="https://..." />
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup title="Étude de cas">
            <DialogDescription>Facultatif : un champ laissé vide n&apos;est pas affiché sur le site.</DialogDescription>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="kind" label="Type">
                <Input id="kind" value={formData.kind} onChange={field("kind")} maxLength={100} placeholder="Projet personnel" />
              </Field>
              <Field id="scope" label="Périmètre">
                <Input id="scope" value={formData.scope} onChange={field("scope")} maxLength={100} placeholder="Full-stack" />
              </Field>
              <Field id="role" label="Rôle">
                <Input id="role" value={formData.role} onChange={field("role")} maxLength={200} placeholder="Conception et développement" />
              </Field>
            </div>
            <Field id="context" label="Contexte">
              <Textarea id="context" rows={3} value={formData.context} onChange={field("context")} maxLength={5000} />
            </Field>
            <Field id="achievements" label="Ce que j'ai fait (une réalisation par ligne)">
              <Textarea id="achievements" rows={4} value={formData.achievements} onChange={field("achievements")} maxLength={5000} />
            </Field>
            <Field id="results" label="Résultats">
              <Textarea id="results" rows={3} value={formData.results} onChange={field("results")} maxLength={5000} />
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {isSaving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
