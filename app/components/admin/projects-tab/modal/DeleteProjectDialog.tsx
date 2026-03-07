"use client";

import { Button } from "@/app/components/common/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/common/dialog";
import { Trash2 } from "lucide-react";

interface ProjectDialogProps {
  isOpen: boolean;
  projectId?: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id?: number) => void;
  onReset: () => void;
}

export function DeleteProjectDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  onReset,
  projectId,
}: ProjectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => onOpenChange(true)}
        >
          <Trash2 size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] roounded-lg">
        <DialogHeader>
          <DialogTitle>
            {"Delete Project"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-sm text-gray-500">
            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onReset}>
              Annuler
            </Button>
            <Button variant="plain" color="secondary" onClick={() => onSubmit(projectId)}>
              Supprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
