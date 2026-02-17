"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, FolderKanban, Briefcase, Mail, Home } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/common/tabs";
import { ProjectsTab } from "../components/admin/ProjectsTab";
import { ExperienceTab } from "../components/admin/ExperienceTab";
import { ContactsTab } from "../components/admin/ContactsTab";
import { HeroTab } from "../components/admin/HeroTab";
import { useAuth } from "../lib/useAuth";
import { logout } from "../lib/api-examples";
import { useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log('🔐 Logout démarré');
      await logout();
      console.log('✅ Logout complété');
      
      // Petit délai pour s'assurer que les cookies sont bien supprimés
      setTimeout(() => {
        console.log('🔄 Redirection vers /login');
        router.push("/login");
      }, 500);
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Rediriger quand même
      setTimeout(() => {
        console.log('🔄 Redirection vers /login (avec erreur)');
        router.push("/login");
      }, 500);
    }
  };

  // Afficher un spinner en attente de vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Ne pas afficher la page si pas authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-600 text-white p-2 rounded-lg">
                <FolderKanban size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panneau d&apos;administration</h1>
                <p className="text-sm text-gray-500">Gérez votre portfolio</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-cyan-600 flex items-center gap-2 transition-colors"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Voir le site</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="experiences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 h-auto gap-2 bg-transparent">
            <TabsTrigger
              value="experiences"
              className="flex items-center gap-2 py-3"
            >
              <Briefcase size={18} />
              Expériences
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="flex items-center gap-2 py-3"
            >
              <Mail size={18} />
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex items-center gap-2 py-3"
            >
              <FolderKanban size={18} />
              Projets
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

          <TabsContent value="contacts" className="space-y-4">
            <ContactsTab />
          </TabsContent>

          <TabsContent value="hero" className="space-y-4">
            <HeroTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
