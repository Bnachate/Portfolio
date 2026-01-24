"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "../common/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../common/dialog";
import { Input } from "../common/input";
import { Label } from "../common/label";
import { Textarea } from "../common/textarea";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  codeUrl: string;
  demoUrl: string;
}

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "Application E-commerce",
      description: "Une plateforme e-commerce complète avec panier d'achat, gestion des produits et système de paiement.",
      image: "ecommerce.jpg",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Stripe"],
      codeUrl: "#",
      demoUrl: "#",
    },
    {
      id: 2,
      title: "Dashboard Analytique",
      description: "Un tableau de bord pour visualiser et analyser des données en temps réel avec des graphiques dynamiques.",
      image: "dashboard.jpg",
      technologies: ["React", "Chart.js", "Redux", "REST API"],
      codeUrl: "#",
      demoUrl: "#",
    },
    {
      id: 3,
      title: "Application Mobile-First",
      description: "Une application responsive optimisée mobile avec une expérience utilisateur fluide et moderne.",
      image: "mobile.jpg",
      technologies: ["React", "PWA", "Service Workers", "CSS Grid"],
      codeUrl: "#",
      demoUrl: "#",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: "",
    description: "",
    image: "",
    technologies: [],
    codeUrl: "",
    demoUrl: "",
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      // Update existing project
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id ? { ...formData, id: editingProject.id } as Project : p
        )
      );
    } else {
      // Add new project
      const newProject = {
        ...formData,
        id: Math.max(...projects.map((p) => p.id), 0) + 1,
      } as Project;
      setProjects([...projects, newProject]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      technologies: [],
      codeUrl: "",
      demoUrl: "",
    });
    setEditingProject(null);
    setIsDialogOpen(false);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
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
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Modifier le projet" : "Nouveau projet"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du projet</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">URL de l&pos;image</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://exemple.com/image.jpg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technologies">Technologies (séparées par des virgules)</Label>
                <Input
                  id="technologies"
                  value={formData.technologies?.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      technologies: e.target.value.split(",").map((t) => t.trim()),
                    })
                  }
                  placeholder="React, TypeScript, Tailwind CSS"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeUrl">URL du code</Label>
                  <Input
                    id="codeUrl"
                    value={formData.codeUrl}
                    onChange={(e) => setFormData({ ...formData, codeUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demoUrl">URL de la démo</Label>
                  <Input
                    id="demoUrl"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    placeholder="https://demo.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                  {editingProject ? "Mettre à jour" : "Créer"}
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
              <TableHead className="py-5 px-6 font-semibold text-gray-900">Projet</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Description</TableHead>
              <TableHead className="py-5 font-semibold text-gray-900">Technologies</TableHead>
              <TableHead className="py-5 text-right px-6 font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className="group transition-all hover:bg-cyan-50/20 border-b border-gray-50 last:border-0"
              >
                {/* TITRE DU PROJET */}
                <TableCell className="py-5 px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-base group-hover:text-cyan-700 transition-colors">
                      {project.title}
                    </span>
                    {project.demoUrl && (
                      <span className="text-[10px] uppercase tracking-wider text-cyan-600 font-bold">
                        Live Demo Available
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* DESCRIPTION */}
                <TableCell className="max-w-md">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </TableCell>

                {/* TECHNOLOGIES */}
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 border border-cyan-100"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="flex items-center justify-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-400 border border-gray-100">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="text-right px-5">
                  <div className="flex justify-end gap-2">
                    {project.demoUrl && (
                      <Button
                        variant="ghost"
                        className="w-auto"
                      >
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
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
                    <Button
                      variant="ghost"
                      className="w-auto"
                      onClick={() => handleDelete(project.id)}
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
