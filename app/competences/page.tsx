import type { Metadata } from "next";
import { getPublicHero } from "@/server/services/hero";
import { listExperiences } from "@/server/services/experiences";
import { listProjects } from "@/server/services/projects";
import { listTags } from "@/server/services/tags";
import { listSkillDomains } from "@/server/services/skill-domains";
import { LANGUAGES } from "@/app/config/content";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { PageTitle, Section, TechTag } from "@/app/components/site/ui";
import { buildSkillGroups } from "@/app/components/site/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compétences",
  description: "Les technologies de Brahim Nachate, regroupées par domaine : front-end, tests, API, outils de livraison.",
  alternates: { canonical: "/competences" },
};

export default async function SkillsPage() {
  const [hero, experiences, projects, tags, domains] = await Promise.all([getPublicHero(), listExperiences(), listProjects(), listTags(), listSkillDomains()]);
  const groups = buildSkillGroups(domains, tags, experiences, projects);

  return (
    <div className="min-h-screen">
      <SiteHeader current="competences" />
      <main>
        <PageTitle title="Compétences" lead="Les technologies que j'utilise, regroupées par domaine." />

        <Section className="pt-12">
          <div className="border-b border-line">
            {groups.map((group) => (
              <section key={group.title} className="flex flex-wrap gap-x-[72px] gap-y-5 border-t border-line py-9">
                <h2 className="min-w-0 flex-[1_1_260px] font-display text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">{group.title}</h2>
                <ul className="flex min-w-0 flex-[2_1_480px] flex-wrap content-start gap-2">
                  {/* Same style for every skill until current and past ones get a new visual distinction */}
                  {group.skills.map((skill) => (
                    <li key={skill.name}>
                      <TechTag name={skill.name} variant="now" />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Section>

        <Section className="pt-[72px]">
          <div className="flex flex-wrap gap-x-[72px] gap-y-5">
            <h2 className="min-w-0 flex-[1_1_260px] font-display text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">Langues</h2>
            <ul className="flex min-w-0 max-w-[60ch] flex-[2_1_480px] flex-col text-[19px] leading-[1.65] text-slate">
              {LANGUAGES.map((language) => (
                <li key={language.name}>
                  <span className="font-semibold text-ink">{language.name}</span>, {language.level}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
