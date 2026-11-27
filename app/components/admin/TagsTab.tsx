"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/input";
import { Select } from "../common/Select";
import { Tag } from "../common/Tag";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { ErrorBanner } from "../common/ErrorBanner";
import { StatusBadge } from "../common/StatusBadge";
import { AdminPanel, DeleteButton, DeleteConfirmDialog, EditButton, InlineEditActions } from "./common/AdminUi";
import { createTag, deleteTag, getTagsWithUsage, updateTag } from "@/app/services/admin/tags.service";
import { getErrorMessage } from "@/app/config/api.config";
import { getSkillDomains } from "@/app/services/admin/skill-domains.service";
import { OTHER_DOMAIN_LABEL } from "@/app/config/tag-domains";
import type { SkillDomain, TagWithUsage } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";
import type { ChangeEvent, JSX, KeyboardEvent as ReactKeyboardEvent } from "react";

const MAX_LENGTH = 50;

const byName = (a: TagWithUsage, b: TagWithUsage): number => a.name.localeCompare(b.name, "fr", { sensitivity: "base" });

const plural = (count: number, word: string): string => `${count} ${word}${count > 1 ? "s" : ""}`;

/** "2 expériences, 1 projet" or "" when unused */
function formatUsage(tag: TagWithUsage): string {
  const parts = [];
  if (tag.experienceCount > 0) parts.push(plural(tag.experienceCount, "expérience"));
  if (tag.projectCount > 0) parts.push(plural(tag.projectCount, "projet"));
  return parts.join(", ");
}

const isUnused = (tag: TagWithUsage): boolean => tag.experienceCount + tag.projectCount === 0;

type DomainSelectProps = { id: string; domains: SkillDomain[]; value: number | null; onChange: (domainId: number | null) => void; label: string; disabled?: boolean };

/** Domains of the database, plus "Autres" (no domain). */
function DomainSelect({ id, domains, value, onChange, label, disabled }: DomainSelectProps): JSX.Element {
  return (
    <Select id={id} aria-label={label} value={value ?? ""} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value ? Number(e.target.value) : null)} disabled={disabled} className="text-[15px]">
      <option value="">{OTHER_DOMAIN_LABEL}</option>
      {domains.map((domain: SkillDomain) => (
        <option key={domain.id} value={domain.id}>
          {domain.name}
        </option>
      ))}
    </Select>
  );
}

export function TagsTab(): JSX.Element {
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
      .catch((err: unknown) => setError(getErrorMessage(err, "Impossible de charger les tags")));
    getSkillDomains()
      .then(setDomains)
      .catch((err: unknown) => setError(getErrorMessage(err, "Impossible de charger les domaines")));
  }, []);

  const domainName = (domainId: number | null): string => domains.find((domain: SkillDomain) => domain.id === domainId)?.name ?? OTHER_DOMAIN_LABEL;

  const visibleTags = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return query ? tags.filter((tag: TagWithUsage) => tag.name.toLocaleLowerCase("fr").includes(query)) : tags;
  }, [tags, search]);

  const unusedCount = tags.filter(isUnused).length;

  const replaceTag = (updated: Partial<TagWithUsage> & { id: number }): void =>
    setTags((current: TagWithUsage[]) => current.map((t: TagWithUsage) => (t.id === updated.id ? { ...t, ...updated } : t)).sort(byName));

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    setError("");
    try {
      const tag = await createTag(name, newDomainId);
      setTags((current: TagWithUsage[]) => [...current, { ...tag, experienceCount: 0, projectCount: 0 }].sort(byName));
      setNewName("");
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de créer le tag"));
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (tag: TagWithUsage): void => {
    setDeleteTargetId(null);
    setEditingId(tag.id);
    setEditingName(tag.name);
    setError("");
  };

  const cancelEditing = (): void => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRename = async (tag: TagWithUsage): Promise<void> => {
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

  const handleDomainChange = async (tag: TagWithUsage, domainId: number | null): Promise<void> => {
    setError("");
    try {
      replaceTag(await updateTag(tag.id, { domainId }));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de changer le domaine"));
    }
  };

  const handleDelete = async (tag: TagWithUsage): Promise<void> => {
    setIsDeleting(true);
    try {
      await deleteTag(tag.id);
      setTags((current: TagWithUsage[]) => current.filter((t: TagWithUsage) => t.id !== tag.id));
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
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
      <ErrorBanner message={error} onClose={() => setError("")} className="m-4" />

      <div className="px-6 pt-5">
        <div className="max-w-sm">
          <Input aria-label="Rechercher un tag" placeholder="Rechercher un tag..." value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} icon={Search} />
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
            {visibleTags.map((tag: TagWithUsage) => {
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                        onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") handleRename(tag);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="max-w-xs"
                      />
                    ) : (
                      <Tag name={tag.name} />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      <span className="text-slate">{domainName(tag.domainId)}</span>
                    ) : (
                      <DomainSelect id={`domain-${tag.id}`} label={`Domaine de ${tag.name}`} domains={domains} value={tag.domainId} onChange={(domainId: number | null) => handleDomainChange(tag, domainId)} />
                    )}
                  </TableCell>
                  <TableCell className="text-slate">{isUnused(tag) ? <StatusBadge tone="warning">Non utilisé</StatusBadge> : formatUsage(tag)}</TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      {isEditing ? (
                        <InlineEditActions name={tag.name} onSave={() => handleRename(tag)} onCancel={cancelEditing} canSave={Boolean(editingName.trim())} busy={isRenaming} />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <EditButton label={`Renommer ${tag.name}`} onClick={() => startEditing(tag)} />
                          <DeleteButton label={`Supprimer ${tag.name}`} onClick={() => setDeleteTargetId(tag.id)} />
                        </div>
                      )}
                      {deleteTargetId === tag.id && (
                        <DeleteConfirmDialog
                          question={`Supprimer « ${tag.name} » ?`}
                          detail={isUnused(tag) ? "Ce tag n'est utilisé nulle part." : `Il sera retiré de ${formatUsage(tag)}.`}
                          onConfirm={() => handleDelete(tag)}
                          onCancel={() => setDeleteTargetId(null)}
                          busy={isDeleting}
                        />
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
