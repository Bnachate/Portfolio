import type { Metadata } from "next";
import { getPublicHero } from "@/server/services/hero";
import { listProjects } from "@/server/services/projects";
import { CASE_STUDIES_ENABLED } from "@/app/config/content";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { ArrowIcon, PageTitle, Section } from "@/app/components/site/ui";
import { ButtonLink } from "@/app/components/common/Button";
import { TextLink } from "@/app/components/common/AppLink";
import { TagList } from "@/app/components/common/Tag";
import { ImageWithFallback } from "@/app/components/common/ImageWithFallback";
import { TextBlocks } from "@/app/components/experience/TextBlocks";
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
              {projects.map((project: ProjectDTO) => (
                <article key={project.id} className="flex flex-wrap items-start gap-x-14 gap-y-6 border-t border-line py-12">
                  {/* Type and scope are optional: without either, the column is left out and the project takes the full width */}
                  {(project.kind || project.scope) && (
                    <div className="flex min-w-0 flex-[0_0_200px] flex-col gap-2">
                      {project.kind && <span className="font-display text-xl font-semibold">{project.kind}</span>}
                      {project.scope && <span className="font-mono text-sm text-slate">{project.scope}</span>}
                    </div>
                  )}
                  <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
                    <ImageWithFallback
                      src={project.projectImageUrl}
                      alt={`Capture d'écran de ${project.title}`}
                      className="aspect-[2/1] max-h-[360px] w-full rounded-2xl border border-line bg-mist object-cover"
                    />
                    <h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-bold leading-[1.1] tracking-[-0.02em]">{project.title}</h2>
                    {/* Intro as a paragraph, "• " lines one per row, as the missions of a position */}
                    <TextBlocks text={project.description} list="rules" className="max-w-[58ch] leading-[1.65]" />
                    <TagList names={project.tags.map((tag: TagDTO) => tag.name)} label={`Technologies de ${project.title}`} />
                    <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-2">
                      {/* Hidden while the case studies are being written (CASE_STUDIES_ENABLED) */}
                      {CASE_STUDIES_ENABLED && (
                        <ButtonLink href={`/projets/${project.id}`} size="lg">
                          Lire l&apos;étude de cas
                          <ArrowIcon />
                        </ButtonLink>
                      )}
                      {project.githubUrl && (
                        <TextLink variant="underline" href={project.githubUrl} newTab>
                          Code source sur GitHub
                        </TextLink>
                      )}
                      {project.demoUrl && (
                        <TextLink variant="underline" href={project.demoUrl} newTab>
                          Voir la démo
                        </TextLink>
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
