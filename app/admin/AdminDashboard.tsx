"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LogIn, FolderKanban, Briefcase, Mail, Home, Tags, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/tabs";
import { ProjectsTab } from "../components/admin/ProjectsTab";
import { ExperienceTab } from "../components/admin/ExperienceTab";
import { ContactsTab } from "../components/admin/ContactsTab";
import { HeroTab } from "../components/admin/HeroTab";
import { TagsTab } from "../components/admin/TagsTab";
import { logout } from "../services/auth.service";
import { useState } from "react";
import { ReadOnlyProvider } from "./ReadOnlyContext";

export function AdminDashboard({ readOnly }: { readOnly: boolean }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-700 text-white p-2 rounded-lg">
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Panneau d&apos;administration</h1>
                  <p className="text-sm text-gray-500">{readOnly ? "Consultation en lecture seule" : "Gérez votre portfolio"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-cyan-700 flex items-center gap-2 transition-colors"
                >
                  <Home size={20} />
                  <span className="hidden sm:inline">Voir le site</span>
                </Link>
                {readOnly ? (
                  <Link
                    href="/auth/login"
                    className="border border-cyan-700 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-50 transition-colors flex items-center gap-2 font-medium"
                  >
                    <LogIn size={20} />
                    <span className="hidden sm:inline">Connexion</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {readOnly && (
          <div className="bg-cyan-50 border-b border-cyan-100 text-cyan-900 text-sm">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
              <Eye size={18} className="shrink-0" />
              <span>
                Mode lecture seule : vous pouvez parcourir le panneau d&apos;administration, mais aucune modification n&apos;est possible.
              </span>
            </div>
          </div>
        )}

        {/* Admin Content */}
        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="experiences" className="space-y-6">
            <TabsList className={`grid w-full grid-cols-2 ${readOnly ? "sm:grid-cols-4" : "sm:grid-cols-5"} h-auto gap-2 bg-transparent`}>
              <TabsTrigger
                value="experiences"
                className="flex items-center gap-2 py-3"
              >
                <Briefcase size={18} />
                Expériences
              </TabsTrigger>
              {/* Contact messages hold visitors' personal data: admin only */}
              {!readOnly && (
                <TabsTrigger
                  value="contacts"
                  className="flex items-center gap-2 py-3"
                >
                  <Mail size={18} />
                  Messages
                </TabsTrigger>
              )}
              <TabsTrigger
                value="projects"
                className="flex items-center gap-2 py-3"
              >
                <FolderKanban size={18} />
                Projets
              </TabsTrigger>
              <TabsTrigger
                value="tags"
                className="flex items-center gap-2 py-3"
              >
                <Tags size={18} />
                Tags
              </TabsTrigger>
              <TabsTrigger
                value="hero"
                className="flex items-center gap-2 py-3"
              >
                <Home size={18} />
                Hero
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <ProjectsTab />
            </TabsContent>

            <TabsContent value="experiences" className="space-y-4">
              <ExperienceTab />
            </TabsContent>

            {!readOnly && (
              <TabsContent value="contacts" className="space-y-4">
                <ContactsTab />
              </TabsContent>
            )}

            <TabsContent value="tags" className="space-y-4">
              <TagsTab />
            </TabsContent>

            <TabsContent value="hero" className="space-y-4">
              <HeroTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ReadOnlyProvider>
  );
}
