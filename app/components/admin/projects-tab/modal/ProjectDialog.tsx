"use client";

import type { FormEvent } from "react";
import { Button } from "@/app/components/common/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/common/dialog";
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
}: ProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le projet" : "Nouveau projet"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <ErrorBanner message={error} />
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectImageUrl">URL de l&apos;image</Label>
            <Input
              id="projectImageUrl"
              type="url"
              value={formData.projectImageUrl}
              onChange={(e) => onFormChange({ ...formData, projectImageUrl: e.target.value })}
              placeholder="https://exemple.com/image.jpg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">URL GitHub</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => onFormChange({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demoUrl">URL de démo</Label>
              <Input
                id="demoUrl"
                type="url"
                value={formData.demoUrl}
                onChange={(e) => onFormChange({ ...formData, demoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
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
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              maxLength={5000}
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={submitDisabled}>
              {isSaving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
