"use client";

import { useCallback, useEffect, useState } from "react";
import isEqual from "lodash/isEqual";
import { ErrorBanner } from "./common/ErrorBanner";
import { AdminPanel, DeleteButton, EditButton, InlineDeleteConfirm, ReorderButtons, StatusBadge, movedIds, nextPosition } from "./common/AdminUi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { ExperienceDialog, type ExperienceFormData } from "./experiences-tab/modal/ExperienceDialog";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  getTags,
  createTag,
  type ExperiencePayload,
} from "@/app/services/admin/experiences.service";
import { getErrorMessage } from "@/app/config/api.config";
import { formatPeriod } from "@/app/components/experience/format";
import type { Experience, Tag } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";

const EMPTY_FORM: ExperienceFormData = {
  job: "",
  company: "",
  position: 0,
  description: "",
  startDate: "",
  endDate: null,
  tags: [],
};

const toPayload = (form: ExperienceFormData): ExperiencePayload => ({
  ...form,
  endDate: form.endDate || null,
  tags: form.tags.map((tag) => tag.id).sort((a, b) => a - b),
});

const VISIBLE_TAGS = 4;

/** Ids of the experiences whose period overlaps another one (shown as a warning badge). */
function overlappingIds(experiences: Experience[], today = new Date().toISOString().slice(0, 10)) {
  const ids = new Set<number>();
  for (const a of experiences) {
    for (const b of experiences) {
      if (a.id >= b.id) continue;
      const aEnd = a.endDate ?? today;
      const bEnd = b.endDate ?? today;
      if (a.startDate < bEnd && b.startDate < aEnd) {
        ids.add(a.id);
        ids.add(b.id);
      }
    }
  }
  return ids;
}

export function ExperienceTab() {
  const readOnly = useReadOnly();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const fetchExperiences = useCallback(async () => setExperiences(await getExperiences()), []);

  // Initial load: state is only set once the requests resolve
  useEffect(() => {
    Promise.all([getExperiences(), getTags()])
      .then(([loadedExperiences, loadedTags]) => {
        setExperiences(loadedExperiences);
        setTags(loadedTags);
      })
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger les expériences")));
  }, []);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingExperience(null);
    setFormError("");
    setIsDialogOpen(false);
  };

  const toForm = (experience: Experience): ExperienceFormData => ({
    job: experience.job,
    company: experience.company,
    position: experience.position,
    description: experience.description,
    startDate: experience.startDate,
    endDate: experience.endDate,
    tags: experience.tags,
  });

  const handleEdit = (experience: Experience) => {
    setDeleteTargetId(null);
    setEditingExperience(experience);
    setFormData(toForm(experience));
    setFormError("");
    setIsDialogOpen(true);
  };

  const isFormValid = Boolean(
    formData.job.trim() &&
      formData.company.trim() &&
      formData.description.trim() &&
      formData.startDate &&
      formData.tags.length > 0,
  );

  const hasEditChanges = editingExperience ? !isEqual(toPayload(formData), toPayload(toForm(editingExperience))) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // The submit button is already disabled; this also covers submitting with the Enter key
    if (!isFormValid) return;
    setIsSaving(true);
    setFormError("");
    try {
      const payload = toPayload(formData);
      if (editingExperience) {
        await updateExperience(editingExperience.id, payload);
      } else {
        // Computed on submit (the list may still be loading when the form opens)
        await createExperience({ ...payload, position: nextPosition(experiences) });
      }
      await fetchExperiences();
      resetForm();
    } catch (err) {
      setFormError(getErrorMessage(err, "Impossible d'enregistrer l'expérience"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsBusy(true);
    try {
      await deleteExperience(id);
      await fetchExperiences();
      setDeleteTargetId(null);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer l'expérience"));
    } finally {
      setIsBusy(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    setIsBusy(true);
    try {
      setExperiences(await reorderExperiences(movedIds(experiences, index, direction)));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de changer l'ordre"));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateTag = async (name: string) => {
    const tag = await createTag(name);
    setTags((current) => [...current, tag].sort((a, b) => a.name.localeCompare(b.name)));
    return tag;
  };

  const overlaps = overlappingIds(experiences);
  const count = experiences.length;

  return (
    <AdminPanel
      title="Expériences"
      summary={`${count} expérience${count > 1 ? "s" : ""} au total`}
      action={
        !readOnly && (
          <ExperienceDialog
            isOpen={isDialogOpen}
            onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetForm())}
            isEditing={Boolean(editingExperience)}
            submitDisabled={isSaving || !isFormValid || !hasEditChanges}
            isSaving={isSaving}
            error={formError}
            formData={formData}
            tags={tags}
            onFormChange={setFormData}
            onCreateTag={handleCreateTag}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
        )
      }
    >
      <ErrorBanner message={error} onClose={() => setError("")} />
      {count === 0 ? (
        <p className="p-6 font-display text-base text-slate">Aucune expérience. Ajoutez la première avec le bouton « Nouvelle expérience ».</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Ordre</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Tags</TableHead>
              {!readOnly && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((experience, index) => (
              <TableRow key={experience.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-mono text-sm text-slate">{index + 1}</span>
                    {!readOnly && (
                      <ReorderButtons
                        name={experience.job}
                        onUp={() => handleMove(index, -1)}
                        onDown={() => handleMove(index, 1)}
                        isFirst={index === 0}
                        isLast={index === count - 1}
                        disabled={isBusy}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="min-w-56">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="font-bold">{experience.job}</span>
                    <span className="flex flex-wrap gap-1.5">
                      {experience.endDate === null && <StatusBadge tone="current">En cours</StatusBadge>}
                      {overlaps.has(experience.id) && <StatusBadge tone="warning">Chevauchement</StatusBadge>}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{experience.company}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-[13px] text-slate">
                  {formatPeriod(experience.startDate, experience.endDate)}
                </TableCell>
                <TableCell>
                  <ul aria-label={`Tags de ${experience.job}`} className="flex flex-wrap gap-1.5">
                    {experience.tags.slice(0, VISIBLE_TAGS).map((tag) => (
                      <li key={tag.id} className="rounded bg-mist px-2 py-1 font-mono text-xs">
                        {tag.name}
                      </li>
                    ))}
                    {experience.tags.length > VISIBLE_TAGS && (
                      <li className="px-1 py-1 font-mono text-xs text-slate">
                        +{experience.tags.length - VISIBLE_TAGS}
                        {" "}<span className="sr-only">autres tags</span>
                      </li>
                    )}
                  </ul>
                </TableCell>
                {!readOnly && (
                  <TableCell className="text-right">
                    {deleteTargetId === experience.id ? (
                      <InlineDeleteConfirm
                        question={`Supprimer « ${experience.job} » ?`}
                        onConfirm={() => handleDelete(experience.id)}
                        onCancel={() => setDeleteTargetId(null)}
                        busy={isBusy}
                      />
                    ) : (
                      <div className="flex justify-end gap-2">
                        <EditButton label={`Modifier ${experience.job}`} onClick={() => handleEdit(experience)} />
                        <DeleteButton label={`Supprimer ${experience.job}`} onClick={() => setDeleteTargetId(experience.id)} />
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AdminPanel>
  );
}
