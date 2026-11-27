import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicHero } from "@/server/services/hero";
import { findEmployer } from "@/server/services/experiences";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { Section, TileLink } from "@/app/components/site/ui";
import { TextLink } from "@/app/components/common/AppLink";
import { TagList } from "@/app/components/common/Tag";
import { toBulletPoints, toTextBlocks } from "@/app/components/site/data";
import { TextBlocks } from "@/app/components/experience/TextBlocks";
import { formatDuration, formatPeriod } from "@/app/components/experience/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// Slugs are lowercase letters, digits and dashes: anything else never reaches the database
const loadEmployer = (slug: string) => (/^[a-z0-9-]{1,120}$/.test(slug) ? findEmployer(slug) : Promise.resolve(null));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const employer = await loadEmployer((await params).slug);
  if (!employer) return { title: "Expérience introuvable" };
  const firstParagraph = employer.context ? toTextBlocks(employer.context).find((block) => block.type === "paragraph") : undefined;
  const jobs = employer.experiences.map((experience) => experience.job).join(", ");
  return {
    title: `${employer.name} : contexte et missions`,
    description: (firstParagraph?.type === "paragraph" ? firstParagraph.text : `${jobs} chez ${employer.name}.`).slice(0, 160),
    alternates: { canonical: `/experience/${employer.slug}` },
  };
}

function PageSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-wrap gap-x-[72px] gap-y-6">
      <h2 className="min-w-0 flex-[1_1_260px] font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h2>
      <div className="min-w-0 max-w-[64ch] flex-[2_1_480px]">{children}</div>
    </section>
  );
}

export default async function EmployerPage({ params }: Props) {
  const [employer, hero] = await Promise.all([loadEmployer((await params).slug), getPublicHero()]);
  if (!employer) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader current="experience" />
      <main>
        <Section className="pt-14">
          <div className="flex flex-col gap-7">
            <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 font-display text-[15px] font-medium text-slate">
              <TextLink href="/experience">Expérience</TextLink>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-ink">
                {employer.name}
              </span>
            </nav>
            <h1 className="font-display text-[clamp(48px,7vw,80px)] font-bold leading-[0.98] tracking-[-0.035em]">{employer.name}</h1>
            {employer.sector && <p className="font-display text-[clamp(20px,2.4vw,26px)] font-medium text-mint">{employer.sector}</p>}
          </div>
        </Section>

        <Section className="pt-12">
          <dl className="flex flex-wrap gap-x-14 gap-y-6 border-y border-line py-7 font-display">
            <div className="flex min-w-0 flex-col gap-1.5">
              <dt className="text-[15px] text-slate">Période</dt>
              <dd className="text-lg font-semibold">{formatPeriod(employer.startDate, employer.endDate)}</dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <dt className="text-[15px] text-slate">Durée</dt>
              <dd className="text-lg font-semibold">{formatDuration(employer.startDate, employer.endDate)}</dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <dt className="text-[15px] text-slate">{employer.experiences.length > 1 ? "Postes" : "Poste"}</dt>
              <dd className="text-lg font-semibold">{employer.experiences.map((experience) => experience.job).join(", puis ")}</dd>
            </div>
            {employer.websiteUrl && (
              <div className="flex min-w-0 flex-col gap-1.5">
                <dt className="text-[15px] text-slate">Site</dt>
                <dd className="text-lg font-semibold">
                  <TextLink variant="underline" href={employer.websiteUrl} newTab>
                    {employer.websiteUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </TextLink>
                </dd>
              </div>
            )}
          </dl>
        </Section>

        <Section className="pt-[88px]">
          <div className="flex flex-col gap-20">
            {employer.context && (
              <PageSection title="Contexte">
                <TextBlocks text={employer.context} />
              </PageSection>
            )}

            {employer.experiences.map((experience) => {
              const current = experience.endDate === null;
              return (
                <section key={experience.id} className="flex flex-wrap gap-x-[72px] gap-y-6">
                  <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-2">
                    <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em]">
                      {current && (
                        <>
                          <span className="sr-only">Poste actuel :</span>{" "}
                        </>
                      )}
                      {experience.job}
                    </h2>
                    <span className="font-mono text-[15px] text-slate">{formatPeriod(experience.startDate, experience.endDate)}</span>
                    <span className="font-mono text-[13px] text-slate">{formatDuration(experience.startDate, experience.endDate)}</span>
                  </div>
                  <div className="flex min-w-0 max-w-[64ch] flex-[2_1_480px] flex-col gap-6">
                    <ul className="flex flex-col text-[19px] leading-[1.65]">
                      {toBulletPoints(experience.description).map((point, index) => (
                        <li key={`${index}-${point}`} className="border-t border-line py-4">
                          {point}
                        </li>
                      ))}
                    </ul>
                    <TagList names={experience.tags.map((tag) => tag.name)} label={`Technologies : ${experience.job}`} />
                  </div>
                </section>
              );
            })}
          </div>
        </Section>

        <Section className="pt-24">
          <nav aria-label="Pages suivantes" className="flex flex-wrap gap-5">
            <TileLink href="/experience" className="flex min-w-0 flex-[1_1_320px] flex-col gap-2 px-8 py-7">
              <span className="font-display text-[15px]">Parcours</span>
              <span className="font-display text-2xl font-bold tracking-[-0.01em]">Toutes les expériences</span>
            </TileLink>
            <TileLink href="/competences" className="flex min-w-0 flex-[1_1_320px] flex-col gap-2 px-8 py-7 text-right">
              <span className="font-display text-[15px]">Technologies</span>
              <span className="font-display text-2xl font-bold tracking-[-0.01em]">Voir mes compétences</span>
            </TileLink>
          </nav>
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
