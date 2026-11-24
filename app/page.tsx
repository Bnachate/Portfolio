import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Education } from "./components/Education";
import { Contact } from "./components/Contact";
import { getCurrentUser } from "@/server/auth";
import { getPublicHero } from "@/server/services/hero";
import { listProjects } from "@/server/services/projects";
import { listExperiences } from "@/server/services/experiences";
import { SITE } from "./config/site";
import { personJsonLd } from "./config/structured-data";

// Content is edited from the admin: always render with fresh data
export const dynamic = "force-dynamic";

export default async function Home() {
  const [user, hero, projects, experiences] = await Promise.all([
    getCurrentUser(),
    getPublicHero(),
    listProjects(),
    listExperiences(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd(hero) }} />
      <Header isAuthenticated={Boolean(user)} />
      <main>
        <Hero hero={hero} />
        <Projects projects={projects} />
        <Experience experiences={experiences} />
        <Education />
        <Contact />
      </main>
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
