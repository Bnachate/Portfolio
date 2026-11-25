"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { ErrorBanner } from "./common/ErrorBanner";
import { AdminPanel, DeleteButton, EditButton, InlineDeleteConfirm, StatusBadge } from "./common/AdminUi";
import { createTag, deleteTag, getTagsWithUsage, updateTag } from "@/app/services/admin/tags.service";
import { getErrorMessage } from "@/app/config/api.config";
import { getSkillDomains } from "@/app/services/admin/skill-domains.service";
import { OTHER_DOMAIN_LABEL } from "@/app/config/tag-domains";
import type { SkillDomain, TagWithUsage } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";

const MAX_LENGTH = 50;

const byName = (a: TagWithUsage, b: TagWithUsage) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" });

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

/** "2 expériences, 1 projet" or "" when unused */
function formatUsage(tag: TagWithUsage) {
  const parts = [];
  if (tag.experienceCount > 0) parts.push(plural(tag.experienceCount, "expérience"));
  if (tag.projectCount > 0) parts.push(plural(tag.projectCount, "projet"));
  return parts.join(", ");
}

const isUnused = (tag: TagWithUsage) => tag.experienceCount + tag.projectCount === 0;

const selectClass =
  "min-h-11 rounded-lg border-[1.5px] border-slate bg-white px-3 font-display text-[15px] text-ink transition-colors duration-150 focus:border-mint focus:shadow-[0_0_0_1px_var(--color-mint)] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-line disabled:bg-mist disabled:text-slate";

type DomainSelectProps = { id: string; domains: SkillDomain[]; value: number | null; onChange: (domainId: number | null) => void; label: string; disabled?: boolean };

/** Domains of the database, plus "Autres" (no domain). */
function DomainSelect({ id, domains, value, onChange, label, disabled }: DomainSelectProps) {
  return (
    <select id={id} aria-label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} disabled={disabled} className={selectClass}>
      <option value="">{OTHER_DOMAIN_LABEL}</option>
      {domains.map((domain) => (
        <option key={domain.id} value={domain.id}>
          {domain.name}
        </option>
      ))}
    </select>
  );
}

export function TagsTab() {
  const readOnly = useReadOnly();
  const [tags, setTags] = useState<TagWithUsage[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [domains, setDomains] = useState<SkillDomain[]>([]);
  const [newDomainId, setNewDomainId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getTagsWithUsage()
      .then(setTags)
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger les tags")));
    getSkillDomains()
      .then(setDomains)
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger les domaines")));
  }, []);

  const domainName = (domainId: number | null) => domains.find((domain) => domain.id === domainId)?.name ?? OTHER_DOMAIN_LABEL;

  const visibleTags = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return query ? tags.filter((tag) => tag.name.toLocaleLowerCase("fr").includes(query)) : tags;
  }, [tags, search]);

  const unusedCount = tags.filter(isUnused).length;

  const replaceTag = (updated: Partial<TagWithUsage> & { id: number }) =>
    setTags((current) => current.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)).sort(byName));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    setError("");
    try {
      const tag = await createTag(name, newDomainId);
      setTags((current) => [...current, { ...tag, experienceCount: 0, projectCount: 0 }].sort(byName));
      setNewName("");
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de créer le tag"));
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (tag: TagWithUsage) => {
    setDeleteTargetId(null);
    setEditingId(tag.id);
    setEditingName(tag.name);
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRename = async (tag: TagWithUsage) => {
    const name = editingName.trim();
    if (!name || name === tag.name) return cancelEditing();
    setIsRenaming(true);
    setError("");
    try {
      replaceTag(await updateTag(tag.id, { name }));
      cancelEditing();
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de renommer le tag"));
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDomainChange = async (tag: TagWithUsage, domainId: number | null) => {
    setError("");
    try {
      replaceTag(await updateTag(tag.id, { domainId }));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de changer le domaine"));
    }
  };

  const handleDelete = async (tag: TagWithUsage) => {
    setIsDeleting(true);
    try {
      await deleteTag(tag.id);
      setTags((current) => current.filter((t) => t.id !== tag.id));
      setDeleteTargetId(null);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le tag"));
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminPanel
      title="Tags"
      summary={
        <>
          {plural(tags.length, "tag")} au total
          {unusedCount > 0 && <> • {unusedCount} non utilisé{unusedCount > 1 ? "s" : ""}</>}
        </>
      }
      action={
        !readOnly && (
          <form onSubmit={handleCreate} className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Input
              aria-label="Nom du nouveau tag"
              placeholder="Nouveau tag (ex : Svelte)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={MAX_LENGTH}
              className="sm:w-56"
            />
            <DomainSelect id="new-tag-domain" label="Domaine du nouveau tag" domains={domains} value={newDomainId} onChange={setNewDomainId} />
            <Button type="submit" className="shrink-0" disabled={isCreating || !newName.trim()}>
              <Plus size={18} aria-hidden="true" />
              {isCreating ? "Ajout..." : "Ajouter"}
            </Button>
          </form>
        )
      }
    >
      <ErrorBanner message={error} onClose={() => setError("")} />

      <div className="px-6 pt-5">
        <div className="relative max-w-sm">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate" />
          <Input aria-label="Rechercher un tag" placeholder="Rechercher un tag..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="p-6 pt-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nom</TableHead>
              <TableHead>Domaine</TableHead>
              <TableHead>Utilisation</TableHead>
              {!readOnly && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTags.map((tag) => {
              const isEditing = editingId === tag.id;
              return (
                <TableRow key={tag.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        autoFocus
                        aria-label={`Nouveau nom pour ${tag.name}`}
                        value={editingName}
                        maxLength={MAX_LENGTH}
                        disabled={isRenaming}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(tag);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="max-w-xs"
                      />
                    ) : (
                      <span className="rounded bg-mist px-2.5 py-1 font-mono text-sm">{tag.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      <span className="text-slate">{domainName(tag.domainId)}</span>
                    ) : (
                      <DomainSelect id={`domain-${tag.id}`} label={`Domaine de ${tag.name}`} domains={domains} value={tag.domainId} onChange={(domainId) => handleDomainChange(tag, domainId)} />
                    )}
                  </TableCell>
                  <TableCell className="text-slate">{isUnused(tag) ? <StatusBadge tone="warning">Non utilisé</StatusBadge> : formatUsage(tag)}</TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" className="w-11 px-0" aria-label="Enregistrer" disabled={isRenaming || !editingName.trim()} onClick={() => handleRename(tag)}>
                            <Check size={20} aria-hidden="true" />
                          </Button>
                          <Button variant="ghost" color="secondary" className="w-11 px-0" aria-label="Annuler" disabled={isRenaming} onClick={cancelEditing}>
                            <X size={20} aria-hidden="true" />
                          </Button>
                        </div>
                      ) : deleteTargetId === tag.id ? (
                        <InlineDeleteConfirm
                          question={isUnused(tag) ? `Supprimer « ${tag.name} » ?` : `Supprimer « ${tag.name} » ? Il sera retiré de ${formatUsage(tag)}.`}
                          onConfirm={() => handleDelete(tag)}
                          onCancel={() => setDeleteTargetId(null)}
                          busy={isDeleting}
                        />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <EditButton label={`Renommer ${tag.name}`} onClick={() => startEditing(tag)} />
                          <DeleteButton label={`Supprimer ${tag.name}`} onClick={() => setDeleteTargetId(tag.id)} />
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {visibleTags.length === 0 && (
              <TableRow>
                <TableCell colSpan={readOnly ? 3 : 4} className="py-10 text-center text-slate">
                  {search ? `Aucun tag ne correspond à « ${search} »` : "Aucun tag pour le moment"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminPanel>
  );
}
