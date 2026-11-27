"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LogIn, FolderKanban, Briefcase, Building2, Mail, Home, Tags, Eye, Layers } from "lucide-react";
import { Button, ButtonLink } from "../components/common/Button";
import { LogoMark } from "../components/common/LogoMark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/tabs";
import { ProjectsTab } from "../components/admin/ProjectsTab";
import { ExperienceTab } from "../components/admin/ExperienceTab";
import { CompaniesTab } from "../components/admin/CompaniesTab";
import { ContactsTab } from "../components/admin/ContactsTab";
import { HeroTab } from "../components/admin/HeroTab";
import { TagsTab } from "../components/admin/TagsTab";
import { SkillDomainsTab } from "../components/admin/SkillDomainsTab";
import { logout } from "../services/auth.service";
import { getContacts } from "../services/admin/contacts.service";
import { ReadOnlyProvider } from "./ReadOnlyContext";

// Side margins of the admin bands: 16 to 48 px
const adminGutter = "px-[clamp(16px,4vw,48px)]";

export function AdminDashboard({ readOnly }: { readOnly: boolean }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Unread messages badge on the Messages tab (admin only: messages are private)
  useEffect(() => {
    if (readOnly) return;
    getContacts()
      .then((contacts) => setUnreadCount(contacts.filter((c) => c.status === "new").length))
      .catch(() => {});
  }, [readOnly]);
  const handleUnreadCount = useCallback((count: number) => setUnreadCount(count), []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <ReadOnlyProvider value={readOnly}>
      <div className="min-h-screen bg-paper">
        <header className={`bg-ink ${adminGutter} text-on-ink`}>
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <LogoMark onInk />
              <div>
                <h1 className="font-display text-xl font-bold">Panneau d&apos;administration</h1>
                <p className="font-display text-sm text-on-ink-muted">{readOnly ? "Consultation en lecture seule" : "Gérez votre portfolio"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ButtonLink href="/" variant="ghostOnInk" className="px-4">
                <Home size={20} aria-hidden="true" />
                Voir le site
              </ButtonLink>
              {readOnly ? (
                <ButtonLink href="/auth/login" variant="outlineOnInk" className="px-4">
                  <LogIn size={20} aria-hidden="true" />
                  Connexion
                </ButtonLink>
              ) : (
                <Button variant="outlineOnInk" onClick={handleLogout} disabled={isLoggingOut} className="px-4">
                  <LogOut size={20} aria-hidden="true" />
                  {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
                </Button>
              )}
            </div>
          </div>
        </header>

        {readOnly && (
          <div className={`border-b border-line bg-mint-pale ${adminGutter} font-display text-base text-ink`}>
            <p className="mx-auto flex max-w-[1280px] items-center gap-2 py-3">
              <Eye size={18} aria-hidden="true" className="shrink-0" />
              Mode lecture seule : vous pouvez parcourir le panneau d&apos;administration, mais aucune modification n&apos;est possible.
            </p>
          </div>
        )}

        <main className={`mx-auto max-w-[1280px] ${adminGutter} py-8`}>
          <Tabs defaultValue="experiences" className="gap-6">
            <TabsList className="rounded-2xl border">
              <TabsTrigger value="experiences">
                <Briefcase aria-hidden="true" />
                Expériences
              </TabsTrigger>
              <TabsTrigger value="companies">
                <Building2 aria-hidden="true" />
                Entreprises
              </TabsTrigger>
              {/* Contact messages hold visitors' personal data: admin only */}
              {!readOnly && (
                <TabsTrigger value="contacts">
                  <Mail aria-hidden="true" />
                  Messages
                  {unreadCount > 0 && " "}
                  {unreadCount > 0 && (
                    <span className="min-w-5 rounded-full bg-amber px-1.5 text-center text-xs font-bold text-ink">
                      {unreadCount}{" "}
                      <span className="sr-only">non lu{unreadCount > 1 ? "s" : ""}</span>
                    </span>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger value="projects">
                <FolderKanban aria-hidden="true" />
                Projets
              </TabsTrigger>
              <TabsTrigger value="tags">
                <Tags aria-hidden="true" />
                Tags
              </TabsTrigger>
              <TabsTrigger value="domains">
                <Layers aria-hidden="true" />
                Domaines
              </TabsTrigger>
              <TabsTrigger value="hero">
                <Home aria-hidden="true" />
                Hero
              </TabsTrigger>
            </TabsList>

            <TabsContent value="experiences">
              <ExperienceTab />
            </TabsContent>
            <TabsContent value="companies">
              <CompaniesTab />
            </TabsContent>
            {!readOnly && (
              <TabsContent value="contacts">
                <ContactsTab onUnreadCountChange={handleUnreadCount} />
              </TabsContent>
            )}
            <TabsContent value="projects">
              <ProjectsTab />
            </TabsContent>
            <TabsContent value="tags">
              <TagsTab />
            </TabsContent>
            <TabsContent value="domains">
              <SkillDomainsTab />
            </TabsContent>
            <TabsContent value="hero">
              <HeroTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ReadOnlyProvider>
  );
}
