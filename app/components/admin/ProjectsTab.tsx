"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { Button } from "../common/Button";
import { TagChip } from "./common/TagChip";
import { TruncateWithTooltip } from "./common/TruncateWithTooltip";
import { ErrorBanner } from "./common/ErrorBanner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { getProjects, createProject, updateProject, deleteProject, type ProjectPayload } from "@/app/services/admin/projects.service";
import { createTag, getTags } from "@/app/services/admin/experiences.service";
import { getErrorMessage } from "@/app/config/api.config";
import { DeleteProjectDialog } from "./projects-tab/modal/DeleteProjectDialog";
import { ProjectDialog, type ProjectFormData } from "./projects-tab/modal/ProjectDialog";
import type { Project, Tag } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";

const EMPTY_FORM: ProjectFormData = {
  title: "",
  description: "",
  projectImageUrl: "",
  githubUrl: "",
  demoUrl: "",
  tags: [],
  position: 0,
};

const toPayload = (form: ProjectFormData): ProjectPayload => ({
  ...form,
  githubUrl: form.githubUrl || null,
  demoUrl: form.demoUrl || null,
  tags: form.tags.map((tag) => tag.id),
});

export function ProjectsTab() {
  const readOnly = useReadOnly();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = useCallback(async () => setProjects(await getProjects()), []);

  // Initial load: state is only set once the requests resolve
  useEffect(() => {
    Promise.all([getProjects(), getTags()])
      .then(([loadedProjects, loadedTags]) => {
        setProjects(loadedProjects);
        setTags(loadedTags);
      })
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger les projets")));
  }, []);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingProject(null);
    setFormError("");
    setIsDialogOpen(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      projectImageUrl: project.projectImageUrl,
      githubUrl: project.githubUrl ?? "",
      demoUrl: project.demoUrl ?? "",
      tags: project.tags,
      position: project.position,
    });
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      await fetchProjects();
      setDeleteTargetId(null);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le projet"));
    }
  };

  // Required fields must contain more than whitespace (`required` alone accepts "   ")
  const isFormValid = Boolean(formData.title.trim() && formData.description.trim() && formData.projectImageUrl.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSaving(true);
    setFormError("");
    try {
      const payload = toPayload(formData);
      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }
      await fetchProjects();
      resetForm();
    } catch (err) {
      setFormError(getErrorMessage(err, "Impossible d'enregistrer le projet"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTag = async (name: string) => {
    const tag = await createTag(name);
    setTags((current) => [...current, tag].sort((a, b) => a.name.localeCompare(b.name)));
    return tag;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Projets</h2>
          <p className="text-sm text-gray-500 mt-1">
            {projects.length} projet{projects.length > 1 ? "s" : ""} au total
          </p>
        </div>
        {!readOnly && (
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="w-auto px-5"
          >
            <Plus size={20} className="mr-2" />
            Nouveau projet
          </Button>
        )}
      </div>
      <ErrorBanner message={error} onClose={() => setError("")} />
      {!readOnly && (
        <ProjectDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetForm())}
          isEditing={Boolean(editingProject)}
          isSaving={isSaving}
          submitDisabled={isSaving || !isFormValid}
          error={formError}
          formData={formData}
          tags={tags}
          onFormChange={setFormData}
          onCreateTag={handleCreateTag}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Table className="w-full">
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="py-5 font-semibold text-gray-900">Position</TableHead>
              <TableHead className="py-5 px-6 font-semibold text-gray-900">Projet</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Description</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">GitHub</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Image</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Tags</TableHead>
              <TableHead className="py-5 text-right px-6 font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className="group transition-all hover:bg-cyan-50/20 border-b border-gray-50 last:border-0"
              >
                <TableCell className="max-w-10">
                  <p className="text-sm text-gray-600">{project.position}</p>
                </TableCell>

                {/* PROJECT TITLE */}
                <TableCell className="py-5 px-6">
                  <span className="font-bold text-gray-800 text-base group-hover:text-cyan-700 transition-colors">
                    {project.title}
                  </span>
                </TableCell>

                {/* DESCRIPTION */}
                <TableCell className="max-w-md">
                  <TruncateWithTooltip text={project.description} className="block max-w-70 truncate text-sm text-gray-600" />
                </TableCell>

                {/* GITHUB */}
                <TableCell className="max-w-md">
                  <TruncateWithTooltip text={project.githubUrl ?? "—"} className="block max-w-55 truncate text-sm text-gray-600" />
                </TableCell>

                {/* IMAGE */}
                <TableCell className="max-w-md">
                  <TruncateWithTooltip text={project.projectImageUrl} className="block max-w-55 truncate text-sm text-gray-600" />
                </TableCell>

                {/* TAGS */}
                <TableCell className="w-auto max-w-55">
                  <div className="inline-flex flex-wrap gap-2 overflow-x-auto max-h-24">
                    {project.tags.map((tag) => (
                      <TagChip key={tag.id} label={tag.name} />
                    ))}
                  </div>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right px-5">
                  <div className="flex justify-end gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Ouvrir sur GitHub"
                        className="inline-flex items-center justify-center h-12 px-3 text-gray-700 hover:text-cyan-600"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {!readOnly && (
                      <>
                        <Button variant="ghost" className="w-auto" aria-label="Modifier" onClick={() => handleEdit(project)}>
                          <Pencil size={18} />
                        </Button>
                        <DeleteProjectDialog
                          isOpen={deleteTargetId === project.id}
                          onOpenChange={(open) => setDeleteTargetId(open ? project.id : null)}
                          projectId={project.id}
                          onSubmit={() => handleDelete(project.id)}
                          onReset={() => setDeleteTargetId(null)}
                        />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
