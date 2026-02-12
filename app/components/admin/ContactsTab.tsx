"use client";

import { useState } from "react";
import { Trash2, Mail, Clock, CheckCircle, Eye } from "lucide-react";
import { Button } from "../common/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../common/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../common/dialog";
import { Badge } from "../common/badge";

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "nouveau" | "lu" | "traité";
}

export function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "Marie Dubois",
      email: "marie.dubois@email.com",
      subject: "Opportunité de collaboration",
      message: "Bonjour, j'aimerais discuter d'une opportunité de collaboration pour un projet web innovant. Notre équipe recherche un développeur front-end expérimenté en React.",
      date: "2026-01-22",
      status: "nouveau",
    },
    {
      id: 2,
      name: "Pierre Martin",
      email: "pierre.martin@company.fr",
      subject: "Demande de devis",
      message: "Nous souhaitons obtenir un devis pour le développement d'une application e-commerce complète avec système de paiement intégré.",
      date: "2026-01-21",
      status: "lu",
    },
    {
      id: 3,
      name: "Sophie Laurent",
      email: "sophie.laurent@startup.io",
      subject: "Question technique",
      message: "J'ai vu votre portfolio et j'ai quelques questions sur les technologies que vous utilisez, notamment concernant l'optimisation des performances.",
      date: "2026-01-20",
      status: "traité",
    },
    {
      id: 4,
      name: "Thomas Bernard",
      email: "thomas.b@email.com",
      subject: "Proposition de mission freelance",
      message: "Nous cherchons un développeur freelance pour une mission de 3 mois. Le projet concerne le développement d'un dashboard analytique.",
      date: "2026-01-19",
      status: "lu",
    },
  ]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDialogOpen(true);
    // Mark as read when viewing
    if (contact.status === "nouveau") {
      setContacts(
        contacts.map((c) => (c.id === contact.id ? { ...c, status: "lu" as const } : c))
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  };

  const handleStatusChange = (id: number, status: Contact["status"]) => {
    setContacts(contacts.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const getStatusBadge = (status: Contact["status"]) => {
    switch (status) {
      case "nouveau":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock size={12} className="mr-1" />
            Nouveau
          </Badge>
        );
      case "lu":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Eye size={12} className="mr-1" />
            Lu
          </Badge>
        );
      case "traité":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle size={12} className="mr-1" />
            Traité
          </Badge>
        );
    }
  };

  const newCount = contacts.filter((c) => c.status === "nouveau").length;

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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statut</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow
                key={contact.id}
                className={contact.status === "nouveau" ? "bg-blue-50/50" : ""}
              >
                <TableCell>{getStatusBadge(contact.status)}</TableCell>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                  >
                    <Mail size={14} />
                    {contact.email}
                  </a>
                </TableCell>
                <TableCell className="max-w-xs truncate">{contact.subject}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(contact.date).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      title="Voir le message"
                      onClick={() => handleView(contact)}
                    >
                      <Eye size={18} />
                    </Button>
                    {contact.status !== "traité" && (
                      <Button
                        onClick={() => handleStatusChange(contact.id, "traité")}
                      >
                        <CheckCircle size={18} />
                      </Button>
                    )}
                    <Button
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
                <p className="font-medium">{selectedContact.subject}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Date</Label>
                <p className="text-gray-700">
                  {new Date(selectedContact.date).toLocaleDateString("fr-FR", {
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
                    handleStatusChange(selectedContact.id, "traité");
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
