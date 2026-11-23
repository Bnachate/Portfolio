"use client";

import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import { Pencil, Calendar } from "lucide-react";
import { Button } from "../common/Button";
import { TagChip } from "./common/TagChip";
import { TruncateWithTooltip } from "./common/TruncateWithTooltip";
import { ErrorBanner } from "./common/ErrorBanner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { ExperienceDialog, type ExperienceFormData } from "./experiences-tab/modal/ExperienceDialog";
import { DeleteExperienceDialog } from "./experiences-tab/modal/DeleteExperienceDialog";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getTags,
  createTag,
  type ExperiencePayload,
} from "@/app/services/admin/experiences.service";
import { getErrorMessage } from "@/app/config/api.config";
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

const formatDate = (value: string | null) => (value ? dayjs(value).format("DD-MM-YYYY") : "Aujourd'hui");

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

  const fetchExperiences = useCallback(async () => setExperiences(await getExperiences()), []);

  useEffect(() => {
    Promise.all([fetchExperiences(), getTags().then(setTags)]).catch((err) =>
      setError(getErrorMessage(err, "Impossible de charger les expériences")),
    );
  }, [fetchExperiences]);

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
    setEditingExperience(experience);
    setFormData(toForm(experience));
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");
    try {
      const payload = toPayload(formData);
      if (editingExperience) {
        await updateExperience(editingExperience.id, payload);
      } else {
        await createExperience(payload);
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
    try {
      await deleteExperience(id);
      await fetchExperiences();
      setDeleteTargetId(null);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer l'expérience"));
    }
  };

  const handleCreateTag = async (name: string) => {
    const tag = await createTag(name);
    setTags((current) => [...current, tag].sort((a, b) => a.name.localeCompare(b.name)));
    return tag;
  };

  const isFormValid = Boolean(
    formData.job.trim() &&
    formData.company.trim() &&
    formData.position >= 0 &&
    formData.description.trim() &&
    formData.startDate &&
    formData.tags.length > 0,
  );

  const hasEditChanges = editingExperience
    ? !isEqual(toPayload(formData), toPayload(toForm(editingExperience)))
    : true;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Expériences</h2>
          <p className="text-sm text-gray-500 mt-1">
            {experiences.length} expérience{experiences.length > 1 ? "s" : ""} au total
          </p>
        </div>
        {!readOnly && (
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
        )}
      </div>
      <ErrorBanner message={error} onClose={() => setError("")} />
      <div className="flex justify-center w-full">
        <div className="flex w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="py-5 font-semibold text-gray-900">Position</TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-900">Poste</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Entreprise</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Période</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Description</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Tags</TableHead>
                {!readOnly && <TableHead className="py-5 text-right px-6 font-semibold text-gray-900">Actions</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {experiences.map((experience) => (
                <TableRow
                  key={experience.id}
                  className="group transition-all hover:bg-cyan-50/20 border-b border-gray-50 last:border-0"
                >
                  {/* POSITION */}
                  <TableCell className="max-w-10">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                      {experience.position}
                    </span>
                  </TableCell>

                  {/* JOB TITLE */}
                  <TableCell className="py-5 px-6 max-w-45">
                    <TruncateWithTooltip
                      text={experience.job}
                      className="font-bold text-gray-800 text-base block truncate group-hover:text-cyan-700 transition-colors"
                    />
                  </TableCell>

                  {/* COMPANY */}
                  <TableCell>
                    <div className="inline-flex max-w-40 items-center truncate px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <TruncateWithTooltip text={experience.company} className="block truncate" />
                    </div>
                  </TableCell>

                  {/* PERIOD */}
                  <TableCell>
                    <div className="flex max-w-55 items-center gap-2 truncate text-sm text-gray-500 font-medium">
                      <Calendar size={14} className="text-cyan-500" />
                      <TruncateWithTooltip
                        text={`${formatDate(experience.startDate)} - ${formatDate(experience.endDate)}`}
                        className="block truncate"
                      />
                    </div>
                  </TableCell>

                  {/* DESCRIPTION */}
                  <TableCell>
                    <TruncateWithTooltip text={experience.description} className="block max-w-70 truncate text-sm text-gray-600" />
                  </TableCell>

                  {/* TAGS */}
                  <TableCell className="w-auto">
                    <div className="inline-flex flex-wrap gap-2 overflow-x-auto max-h-24">
                      {experience.tags.map((tag) => (
                        <TagChip key={tag.id} label={tag.name} />
                      ))}
                    </div>
                  </TableCell>

                  {/* ACTIONS */}
                  {!readOnly && (
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" className="w-auto" aria-label="Modifier" onClick={() => handleEdit(experience)}>
                          <Pencil size={18} />
                        </Button>
                        <DeleteExperienceDialog
                          isOpen={deleteTargetId === experience.id}
                          onOpenChange={(open) => setDeleteTargetId(open ? experience.id : null)}
                          experienceId={experience.id}
                          onSubmit={() => handleDelete(experience.id)}
                          onReset={() => setDeleteTargetId(null)}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
