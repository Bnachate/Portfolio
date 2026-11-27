"use client";

import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../common/dialog";
import { ErrorBanner } from "../common/ErrorBanner";
import { Field } from "../common/Field";
import { Input } from "../common/input";
import { StatusBadge } from "../common/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { Textarea } from "../common/textarea";
import { AdminPanel, DeleteButton, DeleteConfirmDialog, EditButton, ViewLink } from "./common/AdminUi";
import { deleteCompany, getCompanies, updateCompany } from "@/app/services/admin/companies.service";
import { getErrorMessage } from "@/app/config/api.config";
import type { Company } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";
import type { JSX } from "react";

const CONTEXT_MAX_LENGTH = 5000;

type FormData = { name: string; sector: string; websiteUrl: string; context: string };

const toForm = (company: Company): FormData => ({
  name: company.name,
  sector: company.sector ?? "",
  websiteUrl: company.websiteUrl ?? "",
  context: company.context ?? "",
});

const plural = (count: number, word: string): string => `${count} ${word}${count > 1 ? "s" : ""}`;

/**
 * Employers shown on the "Expérience" page. A company is created by typing its name on a position;
 * here the admin writes its context (shown on /experience/[slug]) and deletes the unused ones.
 */
export function CompaniesTab(): JSX.Element {
  const readOnly = useReadOnly();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<FormData>({ name: "", sector: "", websiteUrl: "", context: "" });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch((err: unknown) => setError(getErrorMessage(err, "Impossible de charger les entreprises")));
  }, []);

  const openEditor = (company: Company): void => {
    setDeleteTargetId(null);
    setEditing(company);
    setForm(toForm(company));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editing) return;
    // `required` lets whitespace-only values through: check them before calling the API
    if (!form.name.trim()) {
      setFormError("Champ requis : Nom");
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const saved = await updateCompany(editing.id, {
        name: form.name.trim(),
        sector: form.sector.trim() || null,
        websiteUrl: form.websiteUrl.trim() || null,
        context: form.context.trim() || null,
      });
      setCompanies((current: Company[]) =>
        current
          .map((company: Company) => (company.id === saved.id ? { ...company, ...saved } : company))
          .sort((a: Company, b: Company) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" })),
      );
      setEditing(null);
    } catch (err) {
      setFormError(getErrorMessage(err, "Impossible d'enregistrer l'entreprise"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (company: Company): Promise<void> => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteCompany(company.id);
      setCompanies((current: Company[]) => current.filter((c: Company) => c.id !== company.id));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer l'entreprise"));
    } finally {
      setDeleteTargetId(null);
      setIsDeleting(false);
    }
  };

  const unused = companies.filter((company: Company) => company.experienceCount === 0).length;
  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <AdminPanel
      title="Entreprises"
      summary={
        <>
          {plural(companies.length, "entreprise")} • une entreprise est créée en saisissant son nom sur une expérience
          {unused > 0 && <> • {unused} sans poste</>}
        </>
      }
    >
      <ErrorBanner message={error} onClose={() => setError("")} className="m-4" />
      {companies.length === 0 ? (
        <p className="p-6 font-display text-base text-slate">Aucune entreprise. Ajoutez une expérience pour en créer une.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Entreprise</TableHead>
              <TableHead>Secteur</TableHead>
              <TableHead>Contexte</TableHead>
              <TableHead>Postes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company: Company) => (
              <TableRow key={company.id}>
                <TableCell className="font-bold">{company.name}</TableCell>
                <TableCell className="text-slate">{company.sector ?? "Non renseigné"}</TableCell>
                <TableCell className="max-w-md">
                  {company.context ? (
                    <span className="line-clamp-2 text-sm text-slate">{company.context}</span>
                  ) : (
                    <StatusBadge tone="warning">À rédiger</StatusBadge>
                  )}
                </TableCell>
                <TableCell>
                  {company.experienceCount === 0 ? <StatusBadge tone="muted">Aucun poste</StatusBadge> : plural(company.experienceCount, "poste")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {company.experienceCount > 0 && <ViewLink label={`Voir la page ${company.name} sur le site`} href={`/experience/${company.slug}`} />}
                    {!readOnly && (
                      <>
                        <EditButton label={`Modifier ${company.name}`} onClick={() => openEditor(company)} />
                        {company.experienceCount === 0 && (
                          <DeleteButton label={`Supprimer ${company.name}`} onClick={() => setDeleteTargetId(company.id)} />
                        )}
                      </>
                    )}
                  </div>
                  {deleteTargetId === company.id && (
                    <DeleteConfirmDialog
                      question={`Supprimer « ${company.name} » ?`}
                      detail="Aucun poste ne lui est rattaché. Cette action est définitive."
                      onConfirm={() => handleDelete(company)}
                      onCancel={() => setDeleteTargetId(null)}
                      busy={isDeleting}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!readOnly && (
        <Dialog open={editing !== null} onOpenChange={(open: boolean) => !open && !isSaving && setEditing(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier {editing?.name}</DialogTitle>
              <DialogDescription>Ces informations s&apos;affichent sur la carte de l&apos;entreprise et sur sa page.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <ErrorBanner message={formError} />
              <Field id="company-name" label="Nom" hint="Le renommer change l'adresse de sa page et le nom affiché sur ses postes.">
                <Input id="company-name" value={form.name} onChange={update("name")} maxLength={200} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="company-sector" label="Secteur">
                  <Input id="company-sector" value={form.sector} onChange={update("sector")} maxLength={100} placeholder="AdTech · Data marketing" />
                </Field>
                <Field id="company-website" label="Site web">
                  <Input id="company-website" type="url" value={form.websiteUrl} onChange={update("websiteUrl")} placeholder="https://..." />
                </Field>
              </div>
              <Field
                id="company-context"
                label="Contexte"
                hint="Une ligne vide sépare deux paragraphes ; une ligne commençant par « - » devient une puce."
                footer={
                  <p className="text-right font-mono text-xs text-slate">
                    {form.context.length}/{CONTEXT_MAX_LENGTH}
                  </p>
                }
              >
                <Textarea id="company-context" rows={10} value={form.context} onChange={update("context")} maxLength={CONTEXT_MAX_LENGTH} />
              </Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(null)} disabled={isSaving}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AdminPanel>
  );
}
