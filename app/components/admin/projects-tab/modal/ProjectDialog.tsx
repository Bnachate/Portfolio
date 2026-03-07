"use client";

import type { FormEvent } from "react";
import { Button } from "@/app/components/common/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/common/dialog";
import { Input } from "@/app/components/common/input";
import { Label } from "@/app/components/common/label";
import { MultiSelectTags } from "@/app/components/admin/common/MultiSelectTags";
import { Textarea } from "@/app/components/common/textarea";

interface TagOption {
  id: number;
  name: string;
  createDate: string;
  deletedDate: string | null;
  description: string | null;
  featuredImageUrl: string | null;
  schema: string | null;
  updateDate: string | null;
}

interface ProjectDialogFormData {
  title?: string;
  description?: string;
  projectImageUrl?: string;
  githubUrl?: string;
  position?: number;
}

interface ProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: Partial<ProjectDialogFormData>;
  tags: TagOption[];
  selectedTags: Partial<TagOption>[];
  onFormChange: (nextFormData: Partial<ProjectDialogFormData>) => void;
  onTagsChange: (nextTags: Partial<TagOption>[]) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export function ProjectDialog({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  tags,
  selectedTags,
  onFormChange,
  onTagsChange,
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
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet</Label>
            <Input
              id="title"
              value={formData.title ?? ""}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              min={0}
              value={formData.position ?? 0}
              onChange={(e) => onFormChange({ ...formData, position: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectImageUrl">URL de l&apos;image</Label>
            <Input
              id="projectImageUrl"
              value={formData.projectImageUrl ?? ""}
              onChange={(e) => onFormChange({ ...formData, projectImageUrl: e.target.value })}
              placeholder="https://exemple.com/image.jpg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="githubUrl">URL GitHub</Label>
            <Input
              id="githubUrl"
              value={formData.githubUrl ?? ""}
              onChange={(e) => onFormChange({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <MultiSelectTags
              id="tags"
              options={tags}
              selectedValues={selectedTags}
              onChange={onTagsChange}
              placeholder="Sélectionner des tags"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description ?? ""}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
