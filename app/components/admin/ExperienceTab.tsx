"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "../common/Button";
import { TagChip } from "../common/TagChip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { ExperienceDialog } from "./experience-tab/ExperienceDialog";
import { getExperiences, getTags } from "../../services/admin.service";
import { useAuth } from "../../config/useAuth.config";
import isEqual from 'lodash/isEqual';
import pickBy from 'lodash/pickBy';
import { createExperience, updateExperience, deleteExperience } from "../../services/admin.service";

interface Experience {
  id: number;
  job: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  tags: Partial<Tag>[];
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

const normalizeTagNames = (tagValues?: Partial<Tag>[] | undefined) => {
  if (!tagValues) return [];
  return tagValues.map((tag) => ({ id: tag.id, name: tag.name }));
  // .map((tag) => (typeof tag === "string" ? tag : tag?.name))
  // .filter((name): name is string => Boolean(name));
};

export function ExperienceTab() {
  const { isLoading, isAuthenticated } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Partial<Experience> | null>(null);
  const [formData, setFormData] = useState<Partial<Experience>>({
    job: "",
    company: "",
    description: "",
    startDate: "",
    endDate: "",
    tags: []
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchExperiences = async () => {
    const exp = await getExperiences();
    setExperiences(exp.data.data);
  };

  const fetchTags = async () => {
    const expTags = await getTags();
    setTags(expTags.data);
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const fetchData = async () => {
        try {
          await Promise.all([fetchExperiences(), fetchTags()]);
        } catch (error) {
          console.error('❌ Erreur lors du chargement des données:', error);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, isLoading]);

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({ ...experience, tags: experience.tags });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExperience && editingExperience.id) {
        const onlyEditedValues = pickBy(
          formData,
          (value, key) => !isEqual(value, editingExperience?.[key as keyof Experience])
        );

        if (Array.isArray(onlyEditedValues.tags)) {
          onlyEditedValues.tags = onlyEditedValues.tags.map((tag) => tag.id) as Partial<Tag>[];
        }

        await updateExperience({ id: editingExperience.id, ...onlyEditedValues });
      } else {
        const normalizedTags = formData.tags?.map((tag) => tag.id);
        await createExperience({ ...formData, tags: normalizedTags } as Experience);
      }

      await fetchExperiences();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("❌ Erreur lors de la soumission de l'expérience:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) {
      try {
        await deleteExperience({ id });
        await fetchExperiences();
      } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'expérience:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      job: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      tags: []
    });
    setEditingExperience(null);
    setIsDialogOpen(false);
  };

  const formatDate = (value: string | null) => {
    if (!value) return "Aujourd'hui";
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return value;

    const parsed = dayjs(value);
    if (!parsed.isValid()) return value;

    return parsed.format("DD-MM-YYYY");
  };

  const selectedTags = formData.tags ? normalizeTagNames(formData.tags) : [];

  const handleTagsChange = (nextTags: Partial<Tag>[]) => {
    setFormData({ ...formData, tags: nextTags });
  };

  const handleFormChange = (nextFormData: Partial<Experience>) => {
    setFormData(nextFormData);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Expériences</h2>
          <p className="text-sm text-gray-500 mt-1">
            {experiences.length} expérience{experiences.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <ExperienceDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isEditing={Boolean(editingExperience)}
          formData={formData}
          tags={tags}
          selectedTags={selectedTags}
          onFormChange={handleFormChange}
          onTagsChange={handleTagsChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      </div>
      <div className="flex justify-center w-full">
        <div className="flex w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ">
          <Table className="w-full">
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="py-5 px-6 font-semibold text-gray-900">Poste</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Entreprise</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Période</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Description</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Tags</TableHead>
                <TableHead className="py-5 text-right px-6 font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {experiences.map((experience) => (
                <TableRow
                  key={experience.id}
                  className="group transition-all hover:bg-cyan-50/20 border-b border-gray-50 last:border-0"
                >
                  {/* POSTE */}
                  <TableCell className="py-5 px-6">
                    <span className="font-bold text-gray-800 text-base block group-hover:text-cyan-700 transition-colors">
                      {experience.job}
                    </span>
                  </TableCell>

                  {/* ENTREPRISE */}
                  <TableCell>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {experience.company}
                    </div>
                  </TableCell>

                  {/* PÉRIODE */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar size={14} className="text-cyan-500" />
                      {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                    </div>
                  </TableCell>

                  {/* RÉALISATIONS */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {experience.description}
                      </span>
                    </div>
                  </TableCell>

                  {/* TAGS */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {normalizeTagNames(experience.tags).map((tag, index) => (
                        <TagChip key={`${experience.id}-${tag.id}-${index}`} label={tag.name ?? ''} />
                      ))}
                    </div>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        className="w-auto"
                        onClick={() => handleEdit(experience)}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-auto"
                        onClick={() => handleDelete(experience.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
