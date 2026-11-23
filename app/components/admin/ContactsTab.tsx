"use client";

import { useEffect, useState } from "react";
import { Trash2, Mail, Clock, CheckCircle, Eye } from "lucide-react";
import { Button } from "../common/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../common/dialog";
import { Badge } from "../common/badge";
import { cn } from "../common/utils";
import { ErrorBanner } from "./common/ErrorBanner";
import { getContacts, updateContactStatus, deleteContact } from "@/app/services/admin/contacts.service";
import { getErrorMessage } from "@/app/config/api.config";
import type { ContactMessage, ContactStatus } from "@/app/types/api";

type Contact = ContactMessage;

export function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getContacts()
      .then(setContacts)
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger les messages")));
  }, []);

  const replaceContact = (updated: Contact) =>
    setContacts((current) => current.map((c) => (c.id === updated.id ? updated : c)));

  const handleStatusChange = async (id: number, status: ContactStatus) => {
    try {
      replaceContact(await updateContactStatus(id, status));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de modifier le statut"));
    }
  };

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
    // Mark as read when viewing
    if (contact.status === "new") handleStatusChange(contact.id, "read");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
    try {
      await deleteContact(id);
      setContacts((current) => current.filter((c) => c.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le message"));
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock size={12} className="mr-1" />
            Nouveau
          </Badge>
        );
      case "read":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Eye size={12} className="mr-1" />
            Lu
          </Badge>
        );
      case "done":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle size={12} className="mr-1" />
            Traité
          </Badge>
        );
    }
  };

  const newCount = contacts.filter((c) => c.status === "new").length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Messages de Contact</h2>
            <p className="text-sm text-gray-500 mt-1">
              {contacts.length} message{contacts.length > 1 ? "s" : ""} total
              {newCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {newCount} nouveau{newCount > 1 ? "x" : ""}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <ErrorBanner message={error} onClose={() => setError("")} />
      <div className="overflow-x-auto">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="py-5 px-5 font-semibold text-gray-900">Nom</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Email</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Message</TableHead>
                <TableHead className="py-5 font-semibold text-gray-900">Date</TableHead>
                <TableHead className="py-5 text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className={cn(
                    "group transition-colors border-b border-gray-50 last:border-0",
                    contact.status === "new" ? "bg-cyan-50/30 hover:bg-cyan-50/50" : "hover:bg-gray-50/50"
                  )}
                >
                  <TableCell className="">
                    <div className="flex items-center gap-3">
                      {/* Small visual indicator for new messages */}
                      {contact.status === "new" && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                      )}
                      <span className="font-semibold text-gray-800">{contact.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-gray-600 hover:text-cyan-600 transition-colors flex items-center gap-2 w-fit decoration-cyan-200 underline-offset-4 hover:underline"
                    >
                      <Mail size={14} className="opacity-70" />
                      {contact.email}
                    </a>
                  </TableCell>

                  <TableCell className="max-w-xs">
                    <p className="truncate text-gray-600 italic">{contact.subject ?? contact.message}</p>
                  </TableCell>

                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">
                        {new Date(contact.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(contact.createdAt).getFullYear()}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        className=" w-auto"
                        onClick={() => handleView(contact)}
                      >
                        <Eye size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-auto"
                        onClick={() => handleDelete(contact.id)}
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

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du message</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Nom</Label>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-cyan-600 hover:text-cyan-700"
                  >
                    {selectedContact.email}
                  </a>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Sujet</Label>
                <p className="font-medium">{selectedContact.subject ?? "—"}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Date</Label>
                <p className="text-gray-700">
                  {new Date(selectedContact.createdAt).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Message</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    handleStatusChange(selectedContact.id, "done");
                    setIsDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Marquer comme traité
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = `mailto:${selectedContact.email}`)}
                >
                  <Mail size={18} className="mr-2" />
                  Répondre par email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm font-medium ${className || ""}`}>{children}</div>;
}
