import type { Metadata } from "next";
import Link from "next/link";
import { getPublicHero } from "@/server/services/hero";
import { listProjects } from "@/server/services/projects";
import { CASE_STUDIES_ENABLED, LOREM } from "@/app/config/content";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { ArrowIcon, PageTitle, Section, TechTagList, buttonStyles, underlineLink } from "@/app/components/site/ui";
import { ImageWithFallback } from "@/app/components/common/ImageWithFallback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projets",
  description: "Les projets de Brahim Nachate, construits de bout en bout, avec leur code source et une étude de cas.",
  alternates: { canonical: "/projets" },
};

export default async function ProjectsPage() {
  const [hero, projects] = await Promise.all([getPublicHero(), listProjects()]);

  return (
    <div className="min-h-screen">
      <SiteHeader current="projets" />
      <main>
        <PageTitle title="Projets" lead="Ce que j'ai construit de bout en bout. Chaque projet renvoie vers son code source et son étude de cas." />

        <Section className="pt-16">
          {projects.length === 0 ? (
            <p className="border-y border-line py-12 text-[19px] text-slate">Les projets arrivent bientôt.</p>
          ) : (
            <div className="border-b border-line">
              {projects.map((project) => (
                <article key={project.id} className="flex flex-wrap items-start gap-x-14 gap-y-6 border-t border-line py-12">
                  <div className="flex min-w-0 flex-[0_0_200px] flex-col gap-2">
                    <span className="font-display text-xl font-semibold">{project.kind ?? LOREM.kind}</span>
                    <span className="font-mono text-sm text-slate">{project.scope ?? LOREM.scope}</span>
                  </div>
                  <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
                    <ImageWithFallback
                      src={project.projectImageUrl}
                      alt={`Capture d'écran de ${project.title}`}
                      className="aspect-[2/1] max-h-[360px] w-full rounded-2xl border border-line bg-mist object-cover"
                    />
                    <h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-bold leading-[1.1] tracking-[-0.02em]">{project.title}</h2>
                    <p className="max-w-[58ch] whitespace-pre-line text-[19px] leading-[1.65] text-slate">{project.description}</p>
                    <TechTagList names={project.tags.map((tag) => tag.name)} label={`Technologies de ${project.title}`} />
                    <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-2">
                      {/* Hidden while the case studies are being written (CASE_STUDIES_ENABLED) */}
                      {CASE_STUDIES_ENABLED && (
                        <Link href={`/projets/${project.id}`} className={buttonStyles.ink}>
                          Lire l&apos;étude de cas
                          <ArrowIcon />
                        </Link>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={underlineLink}>
                          Code source sur GitHub
                        </a>
                      )}
                      {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={underlineLink}>
                          Voir la démo
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
