"use client";

import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/input";
import { Label } from "../common/label";
import { Textarea } from "../common/textarea";
import { ErrorBanner } from "./common/ErrorBanner";
import { getHero, saveHero } from "@/app/services/admin/hero.service";
import { getErrorMessage } from "@/app/config/api.config";
import type { Hero } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";

// Every hero field is required (same labels as the form)
const REQUIRED_FIELDS: { field: keyof Hero; label: string }[] = [
  { field: "title", label: "Titre principal" },
  { field: "subtitle", label: "Sous-titre" },
  { field: "description", label: "Description" },
  { field: "primaryButtonText", label: "Texte bouton principal" },
  { field: "primaryButtonUrl", label: "Lien bouton principal" },
  { field: "secondaryButtonText", label: "Texte bouton secondaire" },
  { field: "secondaryButtonUrl", label: "Lien bouton secondaire" },
  { field: "githubUrl", label: "GitHub URL" },
  { field: "linkedinUrl", label: "LinkedIn URL" },
  { field: "email", label: "Email de contact" },
];

export function HeroTab() {
  const readOnly = useReadOnly();
  // Last saved version, used by "Reset"
  const [savedData, setSavedData] = useState<Hero | null>(null);
  const [formData, setFormData] = useState<Hero | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getHero()
      .then((hero) => {
        setSavedData(hero);
        setFormData(hero);
      })
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger la section Hero")));
  }, []);

  if (!formData) {
    return (
      <div className="bg-white rounded-lg shadow w-full p-6">
        {error ? <ErrorBanner message={error} /> : <p className="text-gray-500">Chargement...</p>}
      </div>
    );
  }

  const update = (field: keyof Hero) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    // `required` lets whitespace-only values through: check them before calling the API
    const blank = REQUIRED_FIELDS.find(({ field }) => !formData[field]?.trim());
    if (blank) {
      setError(`Champ requis : ${blank.label}`);
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const saved = await saveHero(formData);
      setSavedData(saved);
      setFormData(saved);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible d'enregistrer la section Hero"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (savedData && confirm("Annuler les modifications non enregistrées ?")) {
      setFormData(savedData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow w-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Configuration de la Section Hero</h2>
        <p className="text-sm text-gray-500 mt-1">
          Personnalisez les informations affichées dans la section principale de votre portfolio
        </p>
      </div>
      <ErrorBanner message={error} onClose={() => setError("")} />
      <div className="w-full flex justify-center">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* A disabled fieldset makes every field read-only for visitors */}
          <fieldset disabled={readOnly} className="space-y-6 min-w-0">
            {/* Main Content Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Contenu Principal</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Titre principal</Label>
                <Input id="title" value={formData.title} onChange={update("title")} placeholder="Ex: Développeur Full-Stack" maxLength={200} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Sous-titre</Label>
                <Input id="subtitle" value={formData.subtitle} onChange={update("subtitle")} placeholder="Ex: Création d'expériences web modernes" maxLength={300} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={formData.description} onChange={update("description")} placeholder="Décrivez votre parcours et vos compétences..." maxLength={2000} required />
              </div>
            </div>

            {/* Buttons Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Boutons d&apos;Action</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryButtonText">Texte bouton principal</Label>
                  <Input id="primaryButtonText" value={formData.primaryButtonText} onChange={update("primaryButtonText")} maxLength={50} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryButtonUrl">Lien bouton principal</Label>
                  <Input id="primaryButtonUrl" value={formData.primaryButtonUrl} onChange={update("primaryButtonUrl")} placeholder="#contact" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryButtonText">Texte bouton secondaire</Label>
                  <Input id="secondaryButtonText" value={formData.secondaryButtonText} onChange={update("secondaryButtonText")} maxLength={50} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryButtonUrl">Lien bouton secondaire</Label>
                  <Input id="secondaryButtonUrl" value={formData.secondaryButtonUrl} onChange={update("secondaryButtonUrl")} placeholder="#projets" required />
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Liens Sociaux</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input id="githubUrl" type="url" value={formData.githubUrl} onChange={update("githubUrl")} placeholder="https://github.com/username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input id="linkedinUrl" type="url" value={formData.linkedinUrl} onChange={update("linkedinUrl")} placeholder="https://linkedin.com/in/username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de contact</Label>
                  {/* Never published: it receives the contact form notifications. Visitors don't get it from the API. */}
                  <Input
                    id="email"
                    type="email"
                    value={formData.email ?? ""}
                    onChange={update("email")}
                    placeholder={readOnly ? "Masqué en lecture seule" : "contact@email.com"}
                    required
                  />
                  {!readOnly && <p className="text-xs text-gray-500">Jamais affiché sur le site : reçoit les notifications de messages.</p>}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b">Aperçu</h3>
            <div className="bg-linear-to-br from-cyan-50 to-teal-50 rounded-lg p-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
              <p className="text-xl text-gray-700 mb-6">{formData.subtitle}</p>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8 whitespace-pre-line">{formData.description}</p>
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
          {!readOnly && <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw size={18} className="mr-2" />
              Annuler
            </Button>
            <Button type="submit" variant="plain" color="primary" className="w-64" disabled={isSaving}>
              <Save size={18} className="mr-2" />
              {isSaving ? "Enregistrement..." : isSaved ? "✓ Sauvegardé" : "Sauvegarder les modifications"}
            </Button>
          </div>}

          {isSaved && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center">
              Les modifications ont été sauvegardées avec succès !
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
