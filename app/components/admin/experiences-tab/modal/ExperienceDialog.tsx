"use client";

import { Plus } from "lucide-react";
import { Button } from "@/app/components/common/Button";
import { DatePicker } from "@/app/components/common/DatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/common/dialog";
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

interface ExperienceDialogFormData {
  job?: string;
  company?: string;
  position?: number;
  startDate?: string;
  endDate?: string | null;
  description?: string;
  tags: Partial<TagOption>[];
}

interface ExperienceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  submitDisabled: boolean;
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
  submitDisabled,
  formData,
  tags,
  selectedTags,
  onFormChange,
  onTagsChange,
  onSubmit,
  onReset,
}: ExperienceDialogProps) {
  const descriptionLength = (formData.description ?? "").length;

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
              maxLength={100}
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
                maxLength={50}
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début</Label>
              <DatePicker
                id="startDate"
                value={formData.startDate ?? ""}
                onChange={(value) => onFormChange({ ...formData, startDate: value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin</Label>
              <DatePicker
                id="endDate"
                value={formData.endDate ?? ""}
                min={formData.startDate ?? undefined}
                onChange={(value) => onFormChange({ ...formData, endDate: value || null })}
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <MultiSelectTags
              id="tags"
              options={tags}
              selectedValues={selectedTags}
              onChange={onTagsChange}
              placeholder="Sélectionner des tags"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              className="field-sizing-fixed resize-y whitespace-pre-wrap break-words"
              value={formData.description ?? ""}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              maxLength={512}
              required
            />
            <p className="text-right text-xs text-gray-500">{descriptionLength}/512</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={submitDisabled}
            >
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
