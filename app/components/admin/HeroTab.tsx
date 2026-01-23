"use client";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/input";
import { Label } from "../common/label";
import { Textarea } from "../common/textarea";

interface HeroData {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  emailUrl: string;
}

export function HeroTab() {
  const initialData: HeroData = {
    title: "Développeur Front-End",
    subtitle: "Création d'expériences web modernes et performantes",
    description:
      "Passionné par le développement web, je transforme des idées en applications élégantes et intuitives. Spécialisé en React, TypeScript et design moderne.",
    primaryButtonText: "Me contacter",
    primaryButtonUrl: "#contact",
    secondaryButtonText: "Voir mes projets",
    secondaryButtonUrl: "#projets",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    emailUrl: "mailto:contact@portfolio.com",
  };

  const [formData, setFormData] = useState<HeroData>(initialData);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save - in production, this would save to database
    console.log("Saving hero data:", formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les champs ?")) {
      setFormData(initialData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Configuration de la Section Hero</h2>
        <p className="text-sm text-gray-500 mt-1">
          Personnalisez les informations affichées dans la section principale de votre portfolio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Main Content Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Contenu Principal</h3>

          <div className="space-y-2">
            <Label htmlFor="title">Titre principal</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Développeur Front-End"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Sous-titre</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Ex: Création d'expériences web modernes"
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
              placeholder="Décrivez votre parcours et vos compétences..."
              required
            />
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Boutons d&apos;Action</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryButtonText">Texte bouton principal</Label>
              <Input
                id="primaryButtonText"
                value={formData.primaryButtonText}
                onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryButtonUrl">URL bouton principal</Label>
              <Input
                id="primaryButtonUrl"
                value={formData.primaryButtonUrl}
                onChange={(e) => setFormData({ ...formData, primaryButtonUrl: e.target.value })}
                placeholder="#contact"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secondaryButtonText">Texte bouton secondaire</Label>
              <Input
                id="secondaryButtonText"
                value={formData.secondaryButtonText}
                onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryButtonUrl">URL bouton secondaire</Label>
              <Input
                id="secondaryButtonUrl"
                value={formData.secondaryButtonUrl}
                onChange={(e) => setFormData({ ...formData, secondaryButtonUrl: e.target.value })}
                placeholder="#projets"
                required
              />
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Liens Sociaux</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailUrl">Email</Label>
              <Input
                id="emailUrl"
                type="email"
                value={formData.emailUrl.replace("mailto:", "")}
                onChange={(e) => setFormData({ ...formData, emailUrl: `mailto:${e.target.value}` })}
                placeholder="contact@email.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Aperçu</h3>
          <div className="bg-linear-to-br from-cyan-50 to-teal-50 rounded-lg p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
            <p className="text-xl text-gray-700 mb-6">{formData.subtitle}</p>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">{formData.description}</p>
            <div className="flex gap-4 justify-center">
              <Button type="button" className="bg-cyan-600 hover:bg-cyan-700">
                {formData.primaryButtonText}
              </Button>
              <Button type="button" variant="outline" className="border-cyan-600 text-cyan-600">
                {formData.secondaryButtonText}
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <RotateCcw size={18} className="mr-2" />
            Réinitialiser
          </Button>
          <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
            <Save size={18} className="mr-2" />
            {isSaved ? "✓ Sauvegardé" : "Sauvegarder les modifications"}
          </Button>
        </div>

        {isSaved && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center">
            Les modifications ont été sauvegardées avec succès !
          </div>
        )}
      </form>
    </div>
  );
}
