import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPublicHero } from "@/server/services/hero";
import { findProject } from "@/server/services/projects";
import { CASE_STUDIES_ENABLED, LOREM } from "@/app/config/content";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { Section, TechTag, underlineLink } from "@/app/components/site/ui";
import { toBulletPoints } from "@/app/components/site/data";
import { ImageWithFallback } from "@/app/components/common/ImageWithFallback";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

// Only positive integer ids reach the database
async function loadProject(rawId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return findProject(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!CASE_STUDIES_ENABLED) return {};
  const project = await loadProject((await params).id);
  if (!project) return { title: "Projet introuvable" };
  return {
    title: project.title,
    description: project.description.slice(0, 160),
    alternates: { canonical: `/projets/${project.id}` },
  };
}

function CaseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-wrap gap-x-[72px] gap-y-6">
      <h2 className="min-w-0 flex-[1_1_260px] font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h2>
      <div className="min-w-0 max-w-[64ch] flex-[2_1_480px]">{children}</div>
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  // Case studies are being written: send visitors to the home page meanwhile (temporary redirect)
  if (!CASE_STUDIES_ENABLED) redirect("/");
  const [project, hero] = await Promise.all([loadProject((await params).id), getPublicHero()]);
  if (!project) notFound();

  const achievements = project.achievements ? toBulletPoints(project.achievements) : LOREM.achievements;
  const stack = project.tags.slice(0, 3).map((tag) => tag.name).join(", ");

  return (
    <div className="min-h-screen">
      <SiteHeader current="projets" />
      <main>
        <Section className="pt-14">
          <div className="flex flex-col gap-7">
            <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 font-display text-[15px] font-medium text-slate">
              <Link href="/projets" className="underline underline-offset-[3px] hover:text-mint">
                Projets
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-ink">
                {project.title}
              </span>
            </nav>
            <h1 className="max-w-[18ch] font-display text-[clamp(40px,6vw,72px)] font-bold leading-none tracking-[-0.035em] text-balance">
              {project.title}
            </h1>
            <p className="max-w-[60ch] whitespace-pre-line text-[21px] leading-[1.6] text-slate">{project.description}</p>
          </div>
        </Section>

        <Section className="pt-12">
          <dl className="flex flex-wrap gap-x-14 gap-y-6 border-y border-line py-7 font-display">
            <div className="flex min-w-0 flex-col gap-1.5">
              <dt className="text-[15px] text-slate">Type</dt>
              <dd className="text-lg font-semibold">{project.kind ?? LOREM.kind}</dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <dt className="text-[15px] text-slate">Rôle</dt>
              <dd className="text-lg font-semibold">{project.role ?? LOREM.role}</dd>
            </div>
            {stack && (
              <div className="flex min-w-0 flex-col gap-1.5">
                <dt className="text-[15px] text-slate">Stack</dt>
                <dd className="text-lg font-semibold">{stack}</dd>
              </div>
            )}
            {(project.githubUrl || project.demoUrl) && (
              <div className="flex min-w-0 flex-col gap-1.5">
                <dt className="text-[15px] text-slate">Liens</dt>
                <dd className="flex flex-wrap gap-x-5 text-lg font-semibold">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={underlineLink}>
                      Code source
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={underlineLink}>
                      Démo en ligne
                    </a>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </Section>

        <Section className="pt-12">
          <ImageWithFallback
            src={project.projectImageUrl}
            alt={`Capture d'écran de ${project.title}`}
            className="aspect-[2/1] max-h-[520px] w-full rounded-2xl border border-line bg-mist object-cover"
          />
        </Section>

        <Section className="pt-[88px]">
          <div className="flex flex-col gap-20">
            <CaseSection title="Contexte">
              <p className="whitespace-pre-line text-[19px] leading-[1.7] text-slate">{project.context ?? LOREM.context}</p>
            </CaseSection>
            <CaseSection title="Ce que j'ai fait">
              <ul className="flex flex-col text-[19px] leading-[1.65]">
                {achievements.map((achievement, index) => (
                  <li key={`${index}-${achievement}`} className="border-t border-line py-4">
                    {achievement}
                  </li>
                ))}
              </ul>
            </CaseSection>
            {project.tags.length > 0 && (
              <CaseSection title="Technologies">
                <ul aria-label="Technologies" className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag.id}>
                      <TechTag name={tag.name} />
                    </li>
                  ))}
                </ul>
              </CaseSection>
            )}
            <CaseSection title="Résultats">
              <p className="whitespace-pre-line text-[19px] leading-[1.7] text-slate">{project.results ?? LOREM.results}</p>
            </CaseSection>
          </div>
        </Section>

        <Section className="pt-24">
          <nav aria-label="Pages suivantes" className="flex flex-wrap gap-5">
            <Link
              href="/projets"
              className="flex min-w-0 flex-[1_1_320px] flex-col gap-2 rounded-2xl border border-line bg-white px-8 py-7 transition-colors duration-150 hover:bg-ink hover:text-on-ink"
            >
              <span className="font-display text-[15px]">Toutes les études de cas</span>
              <span className="font-display text-2xl font-bold tracking-[-0.01em]">Retour aux projets</span>
            </Link>
            <Link
              href="/experience"
              className="flex min-w-0 flex-[1_1_320px] flex-col gap-2 rounded-2xl border border-line bg-white px-8 py-7 text-right transition-colors duration-150 hover:bg-ink hover:text-on-ink"
            >
              <span className="font-display text-[15px]">Parcours</span>
              <span className="font-display text-2xl font-bold tracking-[-0.01em]">Voir mes expériences</span>
            </Link>
          </nav>
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
