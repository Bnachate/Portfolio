"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "../common/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../common/dialog";
import { Input } from "../common/input";
import { Label } from "../common/label";
import { Textarea } from "../common/textarea";

interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
}

export function ExperienceTab() {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      title: "Développeur Front-End Senior",
      company: "Tech Innovation",
      period: "2022 - Présent",
      description: "Développement d'applications web modernes avec React et TypeScript",
      achievements: [
        "Migration complète vers React 18",
        "Amélioration des performances de 40%",
        "Mise en place de tests E2E",
      ],
    },
    {
      id: 2,
      title: "Développeur Full-Stack",
      company: "Digital Solutions",
      period: "2020 - 2022",
      description: "Développement full-stack d'applications web et mobiles",
      achievements: [
        "Développement de 5+ applications",
        "Formation d'équipe junior",
        "Mise en place CI/CD",
      ],
    },
    {
      id: 3,
      title: "Développeur Junior",
      company: "StartUp Web",
      period: "2018 - 2020",
      description: "Développement front-end et apprentissage des meilleures pratiques",
      achievements: [
        "Développement UI/UX",
        "Intégration API REST",
        "Collaboration agile",
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<Partial<Experience>>({
    title: "",
    company: "",
    period: "",
    description: "",
    achievements: [],
  });

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData(experience);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) {
      setExperiences(experiences.filter((e) => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExperience) {
      // Update existing experience
      setExperiences(
        experiences.map((exp) =>
          exp.id === editingExperience.id ? { ...formData, id: editingExperience.id } as Experience : exp
        )
      );
    } else {
      // Add new experience
      const newExperience = {
        ...formData,
        id: Math.max(...experiences.map((e) => e.id), 0) + 1,
      } as Experience;
      setExperiences([...experiences, newExperience]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      period: "",
      description: "",
      achievements: [],
    });
    setEditingExperience(null);
    setIsDialogOpen(false);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-auto px-5"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus size={20} className="mr-2" />
              Nouvelle expérience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? "Modifier l'expérience" : "Nouvelle expérience"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du poste</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Période</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="2020 - 2022"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievements">Réalisations (une par ligne)</Label>
                <Textarea
                  id="achievements"
                  rows={5}
                  value={formData.achievements?.join("\n")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      achievements: e.target.value.split("\n").filter((a) => a.trim()),
                    })
                  }
                  placeholder="Chaque réalisation sur une nouvelle ligne"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                  {editingExperience ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Table className="w-full">
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="py-5 px-6 font-semibold text-gray-900">Poste</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Entreprise</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Période</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Réalisations</TableHead>
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
                    {experience.title}
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
                    {experience.period}
                  </div>
                </TableCell>

                {/* RÉALISATIONS */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-100 text-cyan-700 text-xs font-bold">
                      {experience.achievements.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      réalisation{experience.achievements.length > 1 ? "s" : ""}
                    </span>
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
  );
}
