"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { Button } from "../common/Button";
import { TagChip } from "./common/TagChip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { getProjects, createProject, updateProject, deleteProject } from "@/app/services/admin/projects.service";
import { DeleteProjectDialog } from "./projects-tab/modal/DeleteProjectDialog";
import { getTags } from "@/app/services/admin/tags.service";
import { useAuth } from "@/app/config/useAuth.config";
import { ProjectDialog } from "./projects-tab/modal/ProjectDialog";
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  githubUrl: string;
  job: string;
  linkedinUrl: string;
  password: string;
  email: string;
  admin: number;
  title: string;
  description: string;
}
interface Project {
  id: number;
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string;
  owner: User;
  tags: Partial<Tag>[];
  position: number;

}

interface ProjectFormData {
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string;
  tags: Partial<Tag>[];
  position: number;
}

interface Tag {
  id: number;
  name: string;
  createDate: string;
  deletedDate: string | null;
  description: string | null;
  featuredImageUrl: string | null;
  schema: string | null;
  updateDate: string | null;
}

function TruncateWithTooltip({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkTruncate = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    };

    checkTruncate();

    const observer = new ResizeObserver(checkTruncate);
    observer.observe(element);

    return () => observer.disconnect();
  }, [text]);

  return (
    <span ref={textRef} className={className} title={isTruncated ? text : undefined}>
      {text}
    </span>
  );
}

export function ProjectsTab() {
  const { isLoading, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    title: '',
    description: '',
    projectImageUrl: '',
    githubUrl: '',
    tags: [],
    position: 0,
  });
  const [tags, setTags] = useState<Tag[]>([]);

  const normalizeTagNames = (tagValues?: Partial<Tag>[] | undefined) => {
    if (!tagValues) return [];
    return tagValues.map((tag) => ({ id: tag.id, name: tag.name }));
  };

  const fetchProjects = async () => {
    const res = await getProjects();
    setProjects(res.data.data);
  };

  const fetchTags = async () => {
    const res = await getTags();
    setTags(res.data);
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const fetchData = async () => {
        try {
          await Promise.all([fetchProjects(), fetchTags()]);
        } catch (error) {
          console.error('❌ Erreur lors du chargement des données:', error);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, isLoading]);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      projectImageUrl: project.projectImageUrl,
      githubUrl: project.githubUrl,
      tags: project.tags,
      position: project.position,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject({ id });
      await fetchProjects();
      setDeleteTargetId(null);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du projet:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject && editingProject.id) {
        const onlyEditedValues = pickBy(
          { ...formData },
          (value, key) => !isEqual(value, editingProject?.[key as keyof Project])
        );

        if (Array.isArray(onlyEditedValues.tags)) {
          onlyEditedValues.tags = onlyEditedValues.tags.map((tag) => tag.id) as Partial<Tag>[];
        }

        await updateProject({ id: editingProject.id, ...onlyEditedValues });
      } else {
        const normalizedTags = formData.tags?.map((tag) => tag.id);
        await createProject({
          ...formData,
          tags: normalizedTags,
        } as Partial<Project>);
      }

      await fetchProjects();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("❌ Erreur lors de la soumission du projet:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      projectImageUrl: "",
      githubUrl: "",
      tags: [],
      position: 0,
    });
    setEditingProject(null);
    setIsDialogOpen(false);
  };

  const handleTagsChange = (nextTags: Partial<Tag>[]) => {
    setFormData({ ...formData, tags: nextTags });
  };

  const handleFormChange = (nextFormData: Partial<ProjectFormData>) => {
    setFormData(nextFormData);
  };

  const selectedTags = formData.tags ? normalizeTagNames(formData.tags) : [];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Projets</h2>
          <p className="text-sm text-gray-500 mt-1">
            {projects.length} projet{projects.length > 1 ? "s" : ""} au total
          </p>
        </div>
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
      </div>
      <ProjectDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={Boolean(editingProject)}
        formData={formData}
        tags={tags}
        selectedTags={selectedTags}
        onFormChange={handleFormChange}
        onTagsChange={handleTagsChange}
        onSubmit={handleSubmit}
        onReset={resetForm}
      />
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
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {project.position}
                  </p>
                </TableCell>
                {/* TITRE DU PROJET */}
                <TableCell className="py-5 px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-base group-hover:text-cyan-700 transition-colors">
                      {project.title}
                    </span>
                    {project.githubUrl && (
                      <span className="text-[10px] uppercase tracking-wider text-cyan-600 font-bold">
                        GitHub Available
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* DESCRIPTION */}
                <TableCell className="max-w-md">
                  <TruncateWithTooltip
                    text={project.description}
                    className="block max-w-70 truncate text-sm text-gray-600"
                  />
                </TableCell>

                {/* GITHUB */}
                <TableCell className="max-w-md">
                  <TruncateWithTooltip
                    text={project.githubUrl}
                    className="block max-w-55 truncate text-sm text-gray-600"
                  />
                </TableCell>

                {/* IMAGE */}
                <TableCell className="max-w-md">
                  <TruncateWithTooltip
                    text={project.projectImageUrl}
                    className="block max-w-55 truncate text-sm text-gray-600"
                  />
                </TableCell>

                {/* TAGS */}
                <TableCell className="w-auto max-w-55">
                  <div className="inline-flex flex-wrap gap-2 overflow-x-auto max-h-24">
                    {normalizeTagNames(project.tags).map((tag, index) => (
                      <TagChip key={`${project.id}-${tag.id}-${index}`} label={tag.name ?? ''} />
                    ))}
                  </div>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right px-5">
                  <div className="flex justify-end gap-2">
                    {project.githubUrl && (
                      <Button
                        variant="ghost"
                        className="w-auto"
                      >
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={18} />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-auto"
                      onClick={() => handleEdit(project)}
                    >
                      <Pencil size={18} />
                    </Button>
                    <DeleteProjectDialog
                      isOpen={deleteTargetId === project.id}
                      onOpenChange={(open) => setDeleteTargetId(open ? project.id : null)}
                      projectId={project.id}
                      onSubmit={() => handleDelete(project.id)}
                      onReset={() => setDeleteTargetId(null)}
                    />
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
