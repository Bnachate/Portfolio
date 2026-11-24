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
import { SITE, getSiteUrl } from "./config/site";

// Content is edited from the admin: always render with fresh data
export const dynamic = "force-dynamic";

/** Structured data (schema.org Person) that search engines use to describe who the site is about. */
function personJsonLd(hero: { githubUrl: string; linkedinUrl: string }) {
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: SITE.jobTitle,
    url: getSiteUrl(),
    address: { "@type": "PostalAddress", addressLocality: "Paris", addressCountry: "FR" },
    knowsAbout: SITE.skills,
    sameAs: [hero.githubUrl, hero.linkedinUrl],
  });
  // Escape "<" so admin-edited URLs can never close the script tag
  return json.replace(/</g, "\\u003c");
}

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
