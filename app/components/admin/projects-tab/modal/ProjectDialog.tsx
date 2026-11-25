"use client";

import type { FormEvent } from "react";
import { Button } from "@/app/components/common/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/common/dialog";
import { Input } from "@/app/components/common/input";
import { Label } from "@/app/components/common/label";
import { MultiSelectTags } from "@/app/components/admin/common/MultiSelectTags";
import { ErrorBanner } from "@/app/components/admin/common/ErrorBanner";
import { Textarea } from "@/app/components/common/textarea";
import type { Tag } from "@/app/types/api";

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

const sectionTitle = "font-display text-lg font-bold border-b border-line pb-2";

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
}: ProjectDialogProps) {
  const field = (key: keyof ProjectFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onFormChange({ ...formData, [key]: e.target.value });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le projet" : "Nouveau projet"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <ErrorBanner message={error} />

          <fieldset className="space-y-4">
            <legend className={sectionTitle}>Présentation</legend>
            <div className="space-y-2">
              <Label htmlFor="title">Titre du projet</Label>
              <Input id="title" value={formData.title} onChange={field("title")} maxLength={200} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={formData.description} onChange={field("description")} maxLength={5000} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <MultiSelectTags
                id="tags"
                options={tags}
                selectedValues={formData.tags}
                onChange={(nextTags) => onFormChange({ ...formData, tags: nextTags })}
                onCreate={onCreateTag}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className={sectionTitle}>Liens et image</legend>
            <div className="space-y-2">
              <Label htmlFor="projectImageUrl">URL de l&apos;image</Label>
              <Input
                id="projectImageUrl"
                type="url"
                value={formData.projectImageUrl}
                onChange={field("projectImageUrl")}
                placeholder="https://exemple.com/capture.png (1120 × 560 px idéalement)"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">URL GitHub</Label>
                <Input id="githubUrl" type="url" value={formData.githubUrl} onChange={field("githubUrl")} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoUrl">URL de démo</Label>
                <Input id="demoUrl" type="url" value={formData.demoUrl} onChange={field("demoUrl")} placeholder="https://..." />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className={sectionTitle}>Étude de cas</legend>
            <DialogDescription>Facultatif : tant qu&apos;un champ est vide, la page du projet affiche un texte provisoire.</DialogDescription>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="kind">Type</Label>
                <Input id="kind" value={formData.kind} onChange={field("kind")} maxLength={100} placeholder="Projet personnel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Périmètre</Label>
                <Input id="scope" value={formData.scope} onChange={field("scope")} maxLength={100} placeholder="Full-stack" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Input id="role" value={formData.role} onChange={field("role")} maxLength={200} placeholder="Conception et développement" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Contexte</Label>
              <Textarea id="context" rows={3} value={formData.context} onChange={field("context")} maxLength={5000} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievements">Ce que j&apos;ai fait (une réalisation par ligne)</Label>
              <Textarea id="achievements" rows={4} value={formData.achievements} onChange={field("achievements")} maxLength={5000} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="results">Résultats</Label>
              <Textarea id="results" rows={3} value={formData.results} onChange={field("results")} maxLength={5000} />
            </div>
          </fieldset>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onReset}>
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
