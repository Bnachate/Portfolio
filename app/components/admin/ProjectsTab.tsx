"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../common/Button";
import { ErrorBanner } from "./common/ErrorBanner";
import { AdminPanel, DeleteButton, EditButton, DeleteConfirmDialog, ReorderButtons, ViewLink, movedIds, nextPosition } from "./common/AdminUi";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  type ProjectPayload,
} from "@/app/services/admin/projects.service";
import { createTag, getTags } from "@/app/services/admin/experiences.service";
import { getErrorMessage } from "@/app/config/api.config";
import { CASE_STUDIES_ENABLED } from "@/app/config/content";
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
  kind: "",
  scope: "",
  role: "",
  context: "",
  achievements: "",
  results: "",
};

// Empty optional fields are stored as null (the case study then shows its placeholders)
const orNull = (value: string) => value.trim() || null;

const toPayload = (form: ProjectFormData): ProjectPayload => ({
  ...form,
  githubUrl: orNull(form.githubUrl),
  demoUrl: orNull(form.demoUrl),
  kind: orNull(form.kind),
  scope: orNull(form.scope),
  role: orNull(form.role),
  context: orNull(form.context),
  achievements: orNull(form.achievements),
  results: orNull(form.results),
  tags: form.tags.map((tag) => tag.id),
});

const VISIBLE_TAGS = 4;

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
  const [isBusy, setIsBusy] = useState(false);

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
    setDeleteTargetId(null);
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      projectImageUrl: project.projectImageUrl,
      githubUrl: project.githubUrl ?? "",
      demoUrl: project.demoUrl ?? "",
      tags: project.tags,
      position: project.position,
      kind: project.kind ?? "",
      scope: project.scope ?? "",
      role: project.role ?? "",
      context: project.context ?? "",
      achievements: project.achievements ?? "",
      results: project.results ?? "",
    });
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    setIsBusy(true);
    try {
      await deleteProject(id);
      await fetchProjects();
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le projet"));
    } finally {
      // Closed once the server has answered, also on error so the message is visible
      setDeleteTargetId(null);
      setIsBusy(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    setIsBusy(true);
    try {
      setProjects(await reorderProjects(movedIds(projects, index, direction)));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de changer l'ordre"));
    } finally {
      setIsBusy(false);
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
        // Computed on submit (the list may still be loading when the form opens)
        await createProject({ ...payload, position: nextPosition(projects) });
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

  const count = projects.length;

  return (
    <AdminPanel
      title="Projets"
      summary={`${count} projet${count > 1 ? "s" : ""} au total`}
      action={
        !readOnly && (
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
          >
            <Plus size={20} aria-hidden="true" />
            Nouveau projet
          </Button>
        )
      }
    >
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
      {count === 0 ? (
        <p className="p-6 font-display text-base text-slate">Aucun projet. Ajoutez le premier avec le bouton « Nouveau projet ».</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Ordre</TableHead>
              <TableHead>Projet</TableHead>
              <TableHead>GitHub</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-mono text-sm text-slate">{index + 1}</span>
                    {!readOnly && (
                      <ReorderButtons
                        name={project.title}
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
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">{project.title}</span>
                    <span className="line-clamp-2 max-w-md text-sm text-slate">{project.description}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-48 truncate font-mono text-[13px]">
                  {project.githubUrl ? (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-mint">
                      {project.githubUrl.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  ) : (
                    <span className="text-slate">Aucun</span>
                  )}
                </TableCell>
                <TableCell>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a URL typed by the admin */}
                  <img src={project.projectImageUrl} alt={`Capture de ${project.title}`} className="h-12 w-20 rounded border border-line bg-mist object-cover" />
                </TableCell>
                <TableCell>
                  <ul aria-label={`Tags de ${project.title}`} className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, VISIBLE_TAGS).map((tag) => (
                      <li key={tag.id} className="rounded bg-mist px-2 py-1 font-mono text-xs">
                        {tag.name}
                      </li>
                    ))}
                    {project.tags.length > VISIBLE_TAGS && (
                      <li className="px-1 py-1 font-mono text-xs text-slate">
                        +{project.tags.length - VISIBLE_TAGS}
                        {" "}<span className="sr-only">autres tags</span>
                      </li>
                    )}
                  </ul>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* The case study page redirects to the home page while CASE_STUDIES_ENABLED is false */}
                    {CASE_STUDIES_ENABLED && <ViewLink label={`Voir ${project.title} sur le site`} href={`/projets/${project.id}`} />}
                    {!readOnly && (
                      <>
                        <EditButton label={`Modifier ${project.title}`} onClick={() => handleEdit(project)} />
                        <DeleteButton label={`Supprimer ${project.title}`} onClick={() => setDeleteTargetId(project.id)} />
                      </>
                    )}
                  </div>
                  {deleteTargetId === project.id && (
                    <DeleteConfirmDialog
                      question={`Supprimer « ${project.title} » ?`}
                      detail="Le projet et son étude de cas seront retirés du site. Cette action est définitive."
                      onConfirm={() => handleDelete(project.id)}
                      onCancel={() => setDeleteTargetId(null)}
                      busy={isBusy}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AdminPanel>
  );
}
