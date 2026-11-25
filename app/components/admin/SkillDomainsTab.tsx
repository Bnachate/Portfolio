"use client";

import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { ErrorBanner } from "./common/ErrorBanner";
import { AdminPanel, DeleteButton, EditButton, InlineDeleteConfirm, ReorderButtons, movedIds } from "./common/AdminUi";
import {
  createSkillDomain,
  deleteSkillDomain,
  getSkillDomains,
  renameSkillDomain,
  reorderSkillDomains,
} from "@/app/services/admin/skill-domains.service";
import { getErrorMessage } from "@/app/config/api.config";
import { OTHER_DOMAIN_LABEL } from "@/app/config/tag-domains";
import type { SkillDomain } from "@/app/types/api";
import { useReadOnly } from "@/app/admin/ReadOnlyContext";

const MAX_LENGTH = 60;

/** Sections of the "Compétences" page: name and display order. Tags are assigned in the Tags tab. */
export function SkillDomainsTab() {
  const readOnly = useReadOnly();
  const [domains, setDomains] = useState<SkillDomain[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSkillDomains()
      .then(setDomains)
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger les domaines")));
  }, []);

  // Runs one write at a time and shows its error, if any
  const run = async (action: () => Promise<void>, fallback: string) => {
    setIsBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, fallback));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    return run(async () => {
      const domain = await createSkillDomain(name);
      setDomains((current) => [...current, domain]);
      setNewName("");
    }, "Impossible de créer le domaine");
  };

  const startEditing = (domain: SkillDomain) => {
    setDeleteTargetId(null);
    setEditingId(domain.id);
    setEditingName(domain.name);
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleRename = (domain: SkillDomain) => {
    const name = editingName.trim();
    if (!name || name === domain.name) return cancelEditing();
    return run(async () => {
      const renamed = await renameSkillDomain(domain.id, name);
      setDomains((current) => current.map((d) => (d.id === renamed.id ? renamed : d)));
      cancelEditing();
    }, "Impossible de renommer le domaine");
  };

  const handleDelete = (domain: SkillDomain) =>
    run(async () => {
      // The question stays until the server answers (E2E tests wait for it to disappear)
      try {
        await deleteSkillDomain(domain.id);
        setDomains((current) => current.filter((d) => d.id !== domain.id));
      } finally {
        setDeleteTargetId(null);
      }
    }, "Impossible de supprimer le domaine");

  const handleMove = (index: number, direction: -1 | 1) =>
    run(async () => setDomains(await reorderSkillDomains(movedIds(domains, index, direction))), "Impossible de changer l'ordre");

  const count = domains.length;

  return (
    <AdminPanel
      title="Domaines"
      summary={
        <>
          {count} domaine{count > 1 ? "s" : ""} sur la page Compétences • les tags sans domaine vont dans « {OTHER_DOMAIN_LABEL} »
        </>
      }
      action={
        !readOnly && (
          <form onSubmit={handleCreate} className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Input
              aria-label="Nom du nouveau domaine"
              placeholder="Nouveau domaine (ex : Mobile)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={MAX_LENGTH}
              className="sm:w-64"
            />
            <Button type="submit" className="shrink-0" disabled={isBusy || !newName.trim()}>
              <Plus size={18} aria-hidden="true" />
              Ajouter
            </Button>
          </form>
        )
      }
    >
      <ErrorBanner message={error} onClose={() => setError("")} />

      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-40">Ordre</TableHead>
              <TableHead>Nom</TableHead>
              {!readOnly && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((domain, index) => {
              const isEditing = editingId === domain.id;
              return (
                <TableRow key={domain.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono text-sm text-slate">{index + 1}</span>
                      {!readOnly && (
                        <ReorderButtons
                          name={domain.name}
                          onUp={() => handleMove(index, -1)}
                          onDown={() => handleMove(index, 1)}
                          isFirst={index === 0}
                          isLast={index === count - 1}
                          disabled={isBusy}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        autoFocus
                        aria-label={`Nouveau nom pour ${domain.name}`}
                        value={editingName}
                        maxLength={MAX_LENGTH}
                        disabled={isBusy}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(domain);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="max-w-sm"
                      />
                    ) : (
                      <span className="font-display font-semibold">{domain.name}</span>
                    )}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" className="w-11 px-0" aria-label="Enregistrer" disabled={isBusy || !editingName.trim()} onClick={() => handleRename(domain)}>
                            <Check size={20} aria-hidden="true" />
                          </Button>
                          <Button variant="ghost" color="secondary" className="w-11 px-0" aria-label="Annuler" disabled={isBusy} onClick={cancelEditing}>
                            <X size={20} aria-hidden="true" />
                          </Button>
                        </div>
                      ) : deleteTargetId === domain.id ? (
                        <InlineDeleteConfirm
                          question={`Supprimer « ${domain.name} » ? Ses tags iront dans « ${OTHER_DOMAIN_LABEL} ».`}
                          onConfirm={() => handleDelete(domain)}
                          onCancel={() => setDeleteTargetId(null)}
                          busy={isBusy}
                        />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <EditButton label={`Renommer ${domain.name}`} onClick={() => startEditing(domain)} />
                          <DeleteButton label={`Supprimer ${domain.name}`} onClick={() => setDeleteTargetId(domain.id)} />
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {count === 0 && (
              <TableRow>
                <TableCell colSpan={readOnly ? 2 : 3} className="py-10 text-center text-slate">
                  Aucun domaine pour le moment
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminPanel>
  );
}
