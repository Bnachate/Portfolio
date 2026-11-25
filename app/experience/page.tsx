import type { Metadata } from "next";
import Link from "next/link";
import { getPublicHero } from "@/server/services/hero";
import { listExperiences } from "@/server/services/experiences";
import { CV_URL, EDUCATION } from "@/app/config/content";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { PageTitle, Section, TechTagList, buttonStyles, underlineLink } from "@/app/components/site/ui";
import { toBulletPoints } from "@/app/components/site/data";
import { formatDuration, formatPeriod } from "@/app/components/experience/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Expérience",
  description: "Le parcours de Brahim Nachate : du marketing automation au développement full-stack, et sa formation.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const [hero, experiences] = await Promise.all([getPublicHero(), listExperiences()]);

  return (
    <div className="min-h-screen">
      <SiteHeader current="experience" />
      <main>
        <PageTitle title="Expérience" lead="Du marketing automation au développement full-stack, en passant par React, Node.js et Vue.js." />

        {/* Timeline */}
        <Section className="pt-[72px]">
          {experiences.length === 0 ? (
            <p className="text-[19px] text-slate">Le parcours arrive bientôt.</p>
          ) : (
            <ol className="flex flex-col gap-16">
              {experiences.map((experience) => {
                const current = experience.endDate === null;
                return (
                  <li key={experience.id} className="flex flex-wrap gap-x-10 gap-y-4">
                    <div className="flex min-w-0 flex-[0_0_200px] flex-col gap-1.5 pt-1">
                      <span className="font-mono text-[15px]">{formatPeriod(experience.startDate, experience.endDate)}</span>
                      <span className="font-mono text-[13px] text-slate">{formatDuration(experience.startDate, experience.endDate)}</span>
                    </div>
                    <div className="relative flex min-w-0 flex-[1_1_440px] flex-col gap-[18px] border-l-2 border-line pl-9">
                      {current ? (
                        <span aria-hidden="true" className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full bg-mint" />
                      ) : (
                        <span aria-hidden="true" className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-slate bg-paper" />
                      )}
                      <div className="flex flex-col gap-1.5">
                        <h2 className="font-display text-[clamp(26px,3vw,32px)] font-bold leading-[1.1] tracking-[-0.02em]">
                          {current && (
                            <>
                              <span className="sr-only">Poste actuel :</span>{" "}
                            </>
                          )}
                          {experience.job}
                        </h2>
                        <span className="font-display text-[19px] font-semibold text-slate">{experience.company}</span>
                      </div>
                      <ul className="flex max-w-[62ch] flex-col gap-2.5 text-lg leading-[1.65]">
                        {toBulletPoints(experience.description).map((point, index) => (
                          <li key={`${index}-${point}`} className="relative pl-5">
                            <span aria-hidden="true" className="absolute left-0 top-[0.8em] h-0.5 w-2 bg-slate" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <TechTagList names={experience.tags.map((tag) => tag.name)} label={`Technologies chez ${experience.company}`} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Section>

        {/* Education */}
        <Section className="pt-28">
          <div className="flex flex-wrap gap-x-[72px] gap-y-8">
            <h2 className="min-w-0 flex-[1_1_260px] font-display text-[clamp(32px,4vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">Formation</h2>
            <ul className="flex min-w-0 flex-[2_1_480px] flex-col">
              {EDUCATION.map((item) => (
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
            <a href={CV_URL} target="_blank" rel="noopener noreferrer" className={buttonStyles.ink}>
              Télécharger le CV en PDF
            </a>
            <Link href="/competences" className={`${underlineLink} self-center`}>
              Voir mes compétences
            </Link>
          </div>
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
