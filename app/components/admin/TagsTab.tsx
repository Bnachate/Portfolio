"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../common/dialog";
import { ErrorBanner } from "./common/ErrorBanner";
import { createTag, deleteTag, getTagsWithUsage, updateTag } from "@/app/services/admin/tags.service";
import { getErrorMessage } from "@/app/config/api.config";
import type { TagWithUsage } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";

const MAX_LENGTH = 50;

const byName = (a: TagWithUsage, b: TagWithUsage) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" });

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

/** "2 expériences, 1 projet" or "Non utilisé" */
function formatUsage(tag: TagWithUsage) {
  const parts = [];
  if (tag.experienceCount > 0) parts.push(plural(tag.experienceCount, "expérience"));
  if (tag.projectCount > 0) parts.push(plural(tag.projectCount, "projet"));
  return parts.length > 0 ? parts.join(", ") : "Non utilisé";
}

export function TagsTab() {
  const readOnly = useReadOnly();
  const [tags, setTags] = useState<TagWithUsage[]>([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TagWithUsage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchTags = useCallback(async () => setTags(await getTagsWithUsage()), []);

  useEffect(() => {
    fetchTags().catch((err) => setError(getErrorMessage(err, "Impossible de charger les tags")));
  }, [fetchTags]);

  const visibleTags = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    return query ? tags.filter((tag) => tag.name.toLocaleLowerCase("fr").includes(query)) : tags;
  }, [tags, search]);

  const unusedCount = tags.filter((tag) => tag.experienceCount + tag.projectCount === 0).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsCreating(true);
    setError("");
    try {
      const tag = await createTag(name);
      setTags((current) => [...current, { ...tag, experienceCount: 0, projectCount: 0 }].sort(byName));
      setNewName("");
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de créer le tag"));
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (tag: TagWithUsage) => {
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
      const updated = await updateTag(tag.id, name);
      setTags((current) => current.map((t) => (t.id === tag.id ? { ...t, name: updated.name } : t)).sort(byName));
      cancelEditing();
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de renommer le tag"));
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTag(deleteTarget.id);
      setTags((current) => current.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le tag"));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteMessage =
    deleteTarget && deleteTarget.experienceCount + deleteTarget.projectCount > 0
      ? `Il sera aussi retiré de ${formatUsage(deleteTarget)}. Cette action est irréversible.`
      : "Ce tag n'est utilisé nulle part. Cette action est irréversible.";

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Tags</h2>
          <p className="text-sm text-gray-500 mt-1">
            {plural(tags.length, "tag")} au total
            {unusedCount > 0 && <span className="ml-2 text-gray-400">• {unusedCount} non utilisé{unusedCount > 1 ? "s" : ""}</span>}
          </p>
        </div>

        {/* Create */}
        {!readOnly && <form onSubmit={handleCreate} className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            aria-label="Nom du nouveau tag"
            placeholder="Nouveau tag (ex : Svelte)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={MAX_LENGTH}
            className="h-11 sm:w-64"
          />
          <Button type="submit" className="w-auto px-5 shrink-0" disabled={isCreating || !newName.trim()}>
            <Plus size={18} />
            {isCreating ? "Ajout..." : "Ajouter"}
          </Button>
        </form>}
      </div>

      <ErrorBanner message={error} onClose={() => setError("")} />

      {/* Search */}
      <div className="px-6 pt-4">
        <div className="relative max-w-sm">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            aria-label="Rechercher un tag"
            placeholder="Rechercher un tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="py-5 px-6 font-semibold text-gray-900">Nom</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Utilisation</TableHead>
                {!readOnly && <TableHead className="py-5 text-right px-6 font-semibold text-gray-900">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTags.map((tag) => {
                const isEditing = editingId === tag.id;
                const isUnused = tag.experienceCount + tag.projectCount === 0;
                return (
                  <TableRow key={tag.id} className="group transition-colors hover:bg-cyan-50/20 border-b border-gray-50 last:border-0">
                    <TableCell className="px-6 py-3">
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
                          className="h-10 max-w-xs"
                        />
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-800">
                          {tag.name}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className={isUnused ? "text-sm text-gray-400 italic" : "text-sm text-gray-600"}>
                      {formatUsage(tag)}
                    </TableCell>

                    {!readOnly && <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button variant="ghost" className="w-auto" aria-label="Enregistrer" disabled={isRenaming || !editingName.trim()} onClick={() => handleRename(tag)}>
                              <Check size={18} />
                            </Button>
                            <Button variant="ghost" color="secondary" className="w-auto" aria-label="Annuler" disabled={isRenaming} onClick={cancelEditing}>
                              <X size={18} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" className="w-auto" aria-label={`Renommer ${tag.name}`} onClick={() => startEditing(tag)}>
                              <Pencil size={18} />
                            </Button>
                            <Button variant="ghost" color="secondary" className="w-auto" aria-label={`Supprimer ${tag.name}`} onClick={() => setDeleteTarget(tag)}>
                              <Trash2 size={18} />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>}
                  </TableRow>
                );
              })}
              {visibleTags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={readOnly ? 2 : 3} className="py-10 text-center text-gray-500">
                    {search ? `Aucun tag ne correspond à « ${search} »` : "Aucun tag pour le moment"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Supprimer le tag « {deleteTarget?.name} » ?</DialogTitle>
            <DialogDescription>{deleteMessage}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" className="w-auto px-5" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button color="secondary" className="w-auto px-5" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
