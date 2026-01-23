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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Poste</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Réalisations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((experience) => (
              <TableRow key={experience.id}>
                <TableCell className="font-medium">{experience.title}</TableCell>
                <TableCell>{experience.company}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    {experience.period}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {experience.achievements.length} réalisation
                    {experience.achievements.length > 1 ? "s" : ""}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(experience)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(experience.id)}
                    >
                      <Trash2 size={18} />
                    </button>
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
