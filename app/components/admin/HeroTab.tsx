"use client";

import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { TextLink } from "../common/AppLink";
import { Field, FieldGroup } from "../common/Field";
import { Input } from "../common/input";
import { Switch } from "../common/Switch";
import { Textarea } from "../common/textarea";
import { ErrorBanner } from "../common/ErrorBanner";
import { AdminPanel } from "./common/AdminUi";
import { getHero, saveHero } from "@/app/services/admin/hero.service";
import { getErrorMessage } from "@/app/config/api.config";
import type { Hero } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";
import type { JSX } from "react";

type TextField = Exclude<keyof Hero, "availabilityEnabled">;

// Every text field is required (same labels as the form)
type RequiredField = { field: TextField; label: string };

const REQUIRED_FIELDS: RequiredField[] = [
  { field: "title", label: "Titre principal" },
  { field: "subtitle", label: "Sous-titre" },
  { field: "description", label: "Description" },
  { field: "primaryButtonText", label: "Texte du bouton principal" },
  { field: "primaryButtonUrl", label: "Lien du bouton principal" },
  { field: "secondaryButtonText", label: "Texte du bouton secondaire" },
  { field: "secondaryButtonUrl", label: "Lien du bouton secondaire" },
  { field: "availabilityText", label: "Texte du voyant" },
  { field: "githubUrl", label: "GitHub" },
  { field: "linkedinUrl", label: "LinkedIn" },
  { field: "email", label: "E-mail de contact" },
];

export function HeroTab(): JSX.Element {
  const readOnly = useReadOnly();
  // Last saved version, used by "Annuler les modifications"
  const [savedData, setSavedData] = useState<Hero | null>(null);
  const [formData, setFormData] = useState<Hero | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getHero()
      .then((hero: Hero) => {
        setSavedData(hero);
        setFormData(hero);
      })
      .catch((err: unknown) => setError(getErrorMessage(err, "Impossible de charger la section Hero")));
  }, []);

  if (!formData) {
    return (
      <AdminPanel title="Section Hero">
        {error ? <ErrorBanner message={error} className="m-4" /> : <p className="p-6 font-display text-slate">Chargement...</p>}
      </AdminPanel>
    );
  }

  const update = (field: TextField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setIsSaved(false);
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (readOnly) return;
    // `required` lets whitespace-only values through: check them before calling the API
    const blank = REQUIRED_FIELDS.find(({ field }: RequiredField) => !formData[field]?.trim());
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
    } catch (err) {
      setError(getErrorMessage(err, "Impossible d'enregistrer la section Hero"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (): void => {
    if (savedData && confirm("Annuler les modifications non enregistrées ?")) {
      setFormData(savedData);
    }
  };

  return (
    <AdminPanel title="Section Hero" summary="Le premier écran de la page d'accueil. L'aperçu suit vos modifications.">
      <ErrorBanner message={error} onClose={() => setError("")} className="m-4" />
      <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-8">
          {/* A disabled fieldset makes every field read-only for visitors */}
          <fieldset disabled={readOnly} className="flex min-w-0 flex-col gap-8">
            <FieldGroup title="Contenu principal">
              <Field id="title" label="Titre principal">
                <Input id="title" value={formData.title} onChange={update("title")} placeholder="Ex : Développeur Full-Stack" maxLength={200} required />
              </Field>
              <Field id="subtitle" label="Sous-titre">
                <Input id="subtitle" value={formData.subtitle} onChange={update("subtitle")} maxLength={300} required />
              </Field>
              <Field id="description" label="Description">
                <Textarea id="description" rows={4} value={formData.description} onChange={update("description")} maxLength={2000} required />
              </Field>
            </FieldGroup>

            <FieldGroup title="Boutons d'action">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="primaryButtonText" label="Texte du bouton principal">
                  <Input id="primaryButtonText" value={formData.primaryButtonText} onChange={update("primaryButtonText")} maxLength={50} required />
                </Field>
                <Field id="primaryButtonUrl" label="Lien du bouton principal">
                  <Input id="primaryButtonUrl" value={formData.primaryButtonUrl} onChange={update("primaryButtonUrl")} placeholder="/contact" required />
                </Field>
                <Field id="secondaryButtonText" label="Texte du bouton secondaire">
                  <Input id="secondaryButtonText" value={formData.secondaryButtonText} onChange={update("secondaryButtonText")} maxLength={50} required />
                </Field>
                <Field id="secondaryButtonUrl" label="Lien du bouton secondaire">
                  <Input id="secondaryButtonUrl" value={formData.secondaryButtonUrl} onChange={update("secondaryButtonUrl")} placeholder="/projets" required />
                </Field>
              </div>
              <p className="font-display text-sm text-slate">Chaque section a sa propre page : utilisez /projets, /experience, /competences ou /contact.</p>
            </FieldGroup>

            <FieldGroup title="Disponibilité">
              <Switch
                id="availabilityEnabled"
                label="Afficher le voyant de disponibilité"
                description="Un point ambre et une courte phrase au-dessus du titre."
                checked={formData.availabilityEnabled}
                onChange={(checked: boolean) => {
                  setIsSaved(false);
                  setFormData({ ...formData, availabilityEnabled: checked });
                }}
                disabled={readOnly}
              />
              <Field id="availabilityText" label="Texte du voyant">
                <Input id="availabilityText" value={formData.availabilityText} onChange={update("availabilityText")} maxLength={120} required />
              </Field>
            </FieldGroup>

            <FieldGroup title="Liens sociaux">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="githubUrl" label="GitHub">
                  <Input id="githubUrl" type="url" value={formData.githubUrl} onChange={update("githubUrl")} placeholder="https://github.com/username" required />
                </Field>
                <Field id="linkedinUrl" label="LinkedIn">
                  <Input id="linkedinUrl" type="url" value={formData.linkedinUrl} onChange={update("linkedinUrl")} placeholder="https://linkedin.com/in/username" required />
                </Field>
              </div>
              {/* Never published: it receives the contact form notifications. Visitors don't get it from the API. */}
              <Field id="email" label="E-mail de contact" hint={!readOnly && "Jamais affiché sur le site : il reçoit les notifications de messages."}>
                <Input
                  id="email"
                  type="email"
                  value={formData.email ?? ""}
                  onChange={update("email")}
                  placeholder={readOnly ? "Masqué en lecture seule" : "contact@email.com"}
                  required
                />
              </Field>
            </FieldGroup>
          </fieldset>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Annuler les modifications
              </Button>
              <TextLink href="/" className="font-display text-base font-semibold text-ink underline-offset-4">
                Voir l&apos;accueil
              </TextLink>
              {isSaved && (
                <p role="status" className="font-display text-base font-semibold text-mint">
                  Enregistré : les modifications sont en ligne.
                </p>
              )}
            </div>
          )}
        </form>

        {/* Live preview of the home page hero */}
        <aside aria-label="Aperçu" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 font-display text-sm font-semibold text-slate">Aperçu</p>
          <div className="flex flex-col gap-4 rounded-2xl bg-ink p-7 text-on-ink">
            {formData.availabilityEnabled && (
              <p className="flex items-center gap-2 font-display text-sm text-line">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber" />
                {formData.availabilityText}
              </p>
            )}
            <p className="font-display text-4xl font-bold leading-none tracking-[-0.03em]">{formData.title}</p>
            <p className="font-display text-lg font-medium text-mint-light">{formData.subtitle}</p>
            <p className="whitespace-pre-line text-base leading-relaxed text-on-ink-soft">{formData.description}</p>
            <div className="flex flex-wrap gap-2 pt-1 font-display text-sm font-semibold">
              <span className="rounded-lg bg-mint-light px-4 py-2.5 text-ink">{formData.primaryButtonText}</span>
              <span className="rounded-lg border-[1.5px] border-line px-4 py-2 text-on-ink">{formData.secondaryButtonText}</span>
            </div>
          </div>
        </aside>
      </div>
    </AdminPanel>
  );
}
