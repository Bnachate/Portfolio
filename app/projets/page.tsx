import type { Metadata } from "next";
import { getPublicHero } from "@/server/services/hero";
import { listProjects } from "@/server/services/projects";
import { CASE_STUDIES_ENABLED } from "@/app/config/content";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { ArrowIcon, PageTitle, Section } from "@/app/components/site/ui";
import { ButtonLink } from "@/app/components/common/Button";
import { TagList } from "@/app/components/common/Tag";
import { ImageWithFallback } from "@/app/components/common/ImageWithFallback";
import { toProjectDescription, type ProjectPoint } from "@/app/components/site/data";
import { ExternalLink } from "lucide-react";
import type { JSX } from "react";
import type { ProjectDTO } from "@/server/services/projects";
import type { TagDTO } from "@/server/services/tags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projets",
  description: "Les projets de Brahim Nachate, construits de bout en bout, avec leur code source et une étude de cas.",
  alternates: { canonical: "/projets" },
};

export default async function ProjectsPage(): Promise<JSX.Element> {
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
              {projects.map((project: ProjectDTO) => {
                const { intro, points }: { intro: string[]; points: ProjectPoint[] } = toProjectDescription(project.description);
                const meta: string = [project.kind, project.scope].filter(Boolean).join(" · ");
                // The first action is the filled button, the next ones are outlined
                const primary: "caseStudy" | "demo" | "github" = CASE_STUDIES_ENABLED ? "caseStudy" : project.demoUrl ? "demo" : "github";
                return (
                  <article key={project.id} className="flex flex-col gap-10 border-t border-line py-12">
                    <ImageWithFallback
                      src={project.projectImageUrl}
                      alt={`Capture d'écran de ${project.title}`}
                      className="aspect-[2/1] w-full rounded-2xl border border-line bg-mist object-cover"
                    />
                    {/* Left: the essentials (title, summary, stack, links); right: the technical details, one row each */}
                    <div className={`grid gap-x-14 gap-y-10 ${points.length > 0 ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
                      <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
                        {meta && <span className="font-mono text-sm text-slate">{meta}</span>}
                        <h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-bold leading-[1.1] tracking-[-0.02em]">{project.title}</h2>
                        {intro.map((paragraph: string) => (
                          <p key={paragraph} className="max-w-[58ch] text-[19px] leading-[1.65] text-slate">
                            {paragraph}
                          </p>
                        ))}
                        <TagList names={project.tags.map((tag: TagDTO) => tag.name)} label={`Technologies de ${project.title}`} />
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          {/* Hidden while the case studies are being written (CASE_STUDIES_ENABLED) */}
                          {CASE_STUDIES_ENABLED && (
                            <ButtonLink href={`/projets/${project.id}`} size="lg">
                              Lire l&apos;étude de cas
                              <ArrowIcon />
                            </ButtonLink>
                          )}
                          {project.demoUrl && (
                            <ButtonLink href={project.demoUrl} newTab size="lg" variant={primary === "demo" ? "primary" : "outline"}>
                              Voir la démo
                            </ButtonLink>
                          )}
                          {project.githubUrl && (
                            <ButtonLink href={project.githubUrl} newTab size="lg" variant={primary === "github" ? "primary" : "outline"}>
                              <ExternalLink size={18} aria-hidden="true" />
                              Code source sur GitHub
                            </ButtonLink>
                          )}
                        </div>
                      </div>
                      {points.length > 0 && (
                        <ul aria-label={`Détails techniques de ${project.title}`} className="flex min-w-0 flex-col border-b border-line">
                          {points.map((point: ProjectPoint) => (
                            <li key={point.text} className="grid gap-x-8 gap-y-1 border-t border-line py-5 sm:grid-cols-[150px_minmax(0,1fr)]">
                              {point.label && <span className="font-display text-[17px] font-semibold text-ink">{point.label}</span>}
                              <span className={`text-[17px] leading-[1.6] text-slate ${point.label ? "" : "sm:col-span-2"}`}>{point.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
