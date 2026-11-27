import type { Metadata } from "next";
import { getPublicHero } from "@/server/services/hero";
import { listEmployers } from "@/server/services/experiences";
import { CV_URL, EDUCATION, type EducationItem } from "@/app/config/content";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { ArrowIcon, PageTitle, Section, TileLink } from "@/app/components/site/ui";
import { ButtonLink } from "@/app/components/common/Button";
import { TextLink } from "@/app/components/common/AppLink";
import { StatusBadge } from "@/app/components/common/StatusBadge";
import { TruncatedTag } from "@/app/components/common/TruncatedTag";
import { formatDuration, formatPeriod } from "@/app/components/experience/format";
import type { JSX } from "react";
import type { EmployerDTO, ExperienceDTO } from "@/server/services/experiences";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Expérience",
  description: "Le parcours de Brahim Nachate : du marketing automation au développement full-stack, et sa formation.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage(): Promise<JSX.Element> {
  const [hero, employers] = await Promise.all([getPublicHero(), listEmployers()]);

  return (
    <div className="min-h-screen">
      <SiteHeader current="experience" />
      <main>
        <PageTitle title="Expérience" lead="Du marketing automation au développement full-stack, en passant par React, Node.js et Vue.js." />

        {/* One card per employer: its page tells the context and the missions */}
        <Section className="pt-[72px]" aria-label="Entreprises">
          {employers.length === 0 ? (
            <p className="text-[19px] text-slate">Le parcours arrive bientôt.</p>
          ) : (
            <ul className="flex flex-wrap gap-5">
              {employers.map((employer: EmployerDTO) => {
                const current = employer.endDate === null;
                return (
                  <li key={employer.id} className="flex min-w-0 flex-[1_1_320px]">
                    <TileLink href={`/experience/${employer.slug}`} className="group flex min-h-[300px] w-full flex-col justify-between gap-8 p-8">
                      <span className="flex flex-col gap-3.5">
                        {/* One line, always the same height: every company name starts at the same level */}
                        <span className="flex min-h-7 items-center gap-2">
                          {employer.sector && <TruncatedTag name={employer.sector} />}
                          {current && (
                            <span className="shrink-0">
                              <StatusBadge tone="current">En poste</StatusBadge>
                            </span>
                          )}
                        </span>
                        <h2 className="font-display text-[clamp(34px,4vw,44px)] font-bold leading-[1.02] tracking-[-0.025em]">{employer.name}</h2>
                        <span className="font-mono text-[15px] text-slate transition-colors duration-150 group-hover:text-on-ink-soft">
                          {formatPeriod(employer.startDate, employer.endDate)} · {formatDuration(employer.startDate, employer.endDate)}
                        </span>
                        <span className="flex flex-col gap-1 text-lg leading-[1.45]">
                          {employer.experiences.map((experience: ExperienceDTO) => (
                            <span key={experience.id}>{experience.job}</span>
                          ))}
                        </span>
                      </span>
                      <span className="flex items-center justify-between gap-4 font-display text-base font-semibold">
                        Contexte et missions
                        <ArrowIcon size={26} />
                      </span>
                    </TileLink>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Education */}
        <Section className="pt-28">
          <div className="flex flex-wrap gap-x-[72px] gap-y-8">
            <h2 className="min-w-0 flex-[1_1_260px] font-display text-[clamp(32px,4vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">Formation</h2>
            <ul className="flex min-w-0 flex-[2_1_480px] flex-col">
              {EDUCATION.map((item: EducationItem) => (
                <li key={item.title} className="flex flex-wrap gap-x-8 gap-y-1.5 border-t border-line py-[22px]">
                  <span className="flex-[0_0_120px] pt-1 font-mono text-sm text-slate">{item.period}</span>
                  <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
                    <span className="font-display text-[22px] font-bold leading-[1.2]">{item.title}</span>
                    <span className="text-[17px] leading-normal text-slate">{item.school}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section className="pt-20">
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href={CV_URL} newTab size="lg">
              Télécharger le CV en PDF
            </ButtonLink>
            <TextLink variant="underline" href="/competences" className="self-center">
              Voir mes compétences
            </TextLink>
          </div>
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
