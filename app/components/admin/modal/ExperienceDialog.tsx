"use client";

import { Plus } from "lucide-react";
import { Button } from "../../common/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../common/dialog";
import { Input } from "../../common/input";
import { Label } from "../../common/label";
import { MultiSelectTags } from "../../common/MultiSelectTags";
import { Textarea } from "../../common/textarea";

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

interface ExperienceDialogFormData {
  job?: string;
  company?: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  tags: Partial<TagOption>[];
}

interface ExperienceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: Partial<ExperienceDialogFormData>;
  tags: TagOption[];
  selectedTags: Partial<TagOption>[];
  onFormChange: (nextFormData: Partial<ExperienceDialogFormData>) => void;
  onTagsChange: (nextTags: Partial<TagOption>[]) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export function ExperienceDialog({
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
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] roounded-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'expérience" : "Nouvelle expérience"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job">Titre du poste</Label>
            <Input
              id="job"
              value={formData.job ?? ""}
              onChange={(e) => onFormChange({ ...formData, job: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                value={formData.company ?? ""}
                onChange={(e) => onFormChange({ ...formData, company: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                value={formData.startDate ?? ""}
                onChange={(e) => onFormChange({ ...formData, startDate: e.target.value })}
                placeholder="2020 - 2022"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                value={formData.endDate ?? "Aujourd'hui"}
                onChange={(e) => onFormChange({ ...formData, endDate: e.target.value })}
                placeholder="2020 - 2022"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description ?? ""}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
