import { getPublicHero } from "@/server/services/hero";
import { listProjects } from "@/server/services/projects";
import { listExperiences } from "@/server/services/experiences";
import { listTags } from "@/server/services/tags";
import { listSkillDomains } from "@/server/services/skill-domains";
import { personJsonLd } from "./config/structured-data";
import { HERO_FACTS, PROFILE, TILE_TEXTS } from "./config/content";
import { SiteHeader } from "./components/site/SiteHeader";
import { SiteFooter } from "./components/site/SiteFooter";
import { ArrowIcon, Container, Section, TileLink, gutter } from "./components/site/ui";
import { ButtonLink } from "./components/common/Button";
import { TextLink } from "./components/common/AppLink";
import { Tag, TagList } from "./components/common/Tag";
import { buildSkillGroups, currentExperience, experienceSummary, toBulletPoints } from "./components/site/data";
import { formatPeriod } from "./components/experience/format";

// Content is edited from the admin: always render with fresh data
export const dynamic = "force-dynamic";

export default async function Home() {
  const [hero, projects, experiences, tags, domains] = await Promise.all([getPublicHero(), listProjects(), listExperiences(), listTags(), listSkillDomains()]);
  const latest = currentExperience(experiences);
  const domainCount = buildSkillGroups(domains, tags, experiences, projects).length;

  const tiles = [
    {
      href: "/projets",
      title: "Projets",
      meta: projects.length === 0 ? "Bientôt" : `${projects.length} projet${projects.length > 1 ? "s" : ""}`,
      text: TILE_TEXTS.projects,
    },
    { href: "/experience", title: "Expérience", meta: experienceSummary(experiences), text: TILE_TEXTS.experience },
    { href: "/competences", title: "Compétences", meta: `${domainCount} domaine${domainCount > 1 ? "s" : ""}`, text: TILE_TEXTS.skills },
  ];

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd(hero) }} />

      {/* Opening band: header and hero on ink */}
      <div className={`bg-ink ${gutter} text-on-ink`}>
        <SiteHeader current="home" tone="dark" />
      </div>
      <main>
        <div className={`bg-ink ${gutter} pb-24 text-on-ink`}>
          <Container className="flex flex-wrap items-end gap-x-[72px] gap-y-14 pt-[88px]">
            <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
              {hero.availabilityEnabled && (
                <p className="flex items-center gap-2.5 font-display text-base font-medium text-line">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber" />
                  {hero.availabilityText}
                </p>
              )}
              <h1 className="font-display text-[clamp(44px,6.4vw,80px)] font-bold leading-none tracking-[-0.035em] text-balance">{hero.title}</h1>
              <p className="font-display text-[clamp(20px,2.4vw,28px)] font-medium leading-[1.2] text-mint-light">{hero.subtitle}</p>
              <p className="max-w-[56ch] whitespace-pre-line text-[21px] leading-[1.6] text-on-ink-soft">{hero.description}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink variant="mint" size="lg" href={hero.primaryButtonUrl}>
                  {hero.primaryButtonText}
                </ButtonLink>
                <ButtonLink variant="outlineOnInk" size="lg" href={hero.secondaryButtonUrl}>
                  {hero.secondaryButtonText}
                </ButtonLink>
              </div>
            </div>

            <div className="flex w-full min-w-0 max-w-[340px] flex-[0_1_340px] flex-col gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element -- static profile photo, already small */}
              <img
                src="/my_photo.jpeg"
                alt="Photo de profil de Brahim Nachate"
                width={340}
                height={425}
                className="aspect-[4/5] w-full rounded-2xl border border-ink-rule bg-night object-cover"
              />
              <dl className="flex flex-col font-display text-base">
                {HERO_FACTS.map((fact, index) => (
                  <div
                    key={fact.label}
                    className={`flex justify-between gap-4 border-t border-ink-rule py-3 ${index === HERO_FACTS.length - 1 ? "border-b" : ""}`}
                  >
                    <dt className="text-on-ink-muted">{fact.label}</dt>
                    <dd className="text-right font-medium text-on-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <nav aria-label="Profils en ligne" className="flex gap-5 font-display text-base">
                <TextLink variant="onInk" href={hero.githubUrl} newTab>
                  GitHub
                </TextLink>
                <TextLink variant="onInk" href={hero.linkedinUrl} newTab>
                  LinkedIn
                </TextLink>
              </nav>
            </div>
          </Container>
        </div>

        {/* Entry tiles towards the dedicated pages */}
        <Section className="pt-[72px]" aria-label="Pages du portfolio">
          <ul className="flex flex-wrap gap-5">
            {tiles.map((tile) => (
              <li key={tile.href} className="flex min-w-0 flex-[1_1_320px]">
                <TileLink href={tile.href} className="group flex min-h-[280px] w-full flex-col justify-between gap-8 p-8">
                  <span className="flex flex-col gap-3.5">
                    <Tag name={tile.meta} variant="outline" className="self-start" />
                    <span className="font-display text-[44px] font-bold leading-[1.02] tracking-[-0.025em]">{tile.title}</span>
                    <span className="text-lg leading-[1.55] text-slate transition-colors duration-150 group-hover:text-on-ink-soft">{tile.text}</span>
                  </span>
                  <ArrowIcon size={30} />
                </TileLink>
              </li>
            ))}
          </ul>
        </Section>

        {/* Profile */}
        <Section className="pt-28">
          <div className="flex flex-wrap gap-x-[72px] gap-y-10">
            <h2 className="min-w-0 flex-[1_1_320px] font-display text-[clamp(32px,4vw,44px)] font-bold leading-[1.08] tracking-[-0.025em] text-balance">
              {PROFILE.title}
            </h2>
            <div className="flex min-w-0 max-w-[64ch] flex-[1.6_1_480px] flex-col gap-5 text-[19px] leading-[1.7] text-slate">
              {PROFILE.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
              <TextLink variant="underline" href="/experience">
                Lire tout mon parcours
              </TextLink>
            </div>
          </div>
        </Section>

        {/* Most recent position */}
        {latest && (
          <Section className="pt-28">
            <div className="flex flex-wrap items-end justify-between gap-x-14 gap-y-8 rounded-2xl bg-mist p-[clamp(28px,4vw,48px)]">
              <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-4">
                <span className="font-mono text-sm text-slate">
                  {latest.company}, {formatPeriod(latest.startDate, latest.endDate)}
                </span>
                <h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-bold leading-[1.1] tracking-[-0.02em]">{latest.job}</h2>
                <p className="max-w-[60ch] text-lg leading-[1.65] text-slate">{toBulletPoints(latest.description)[0]}</p>
                <div className="pt-1">
                  {/* White tags on mist, as in the design */}
                  <TagList names={latest.tags.slice(0, 8).map((tag) => tag.name)} label={`Technologies chez ${latest.company}`} variant="onMist" />
                </div>
              </div>
              <ButtonLink variant="primary" size="lg" href="/experience">
                Voir mon parcours
              </ButtonLink>
            </div>
          </Section>
        )}
      </main>

      <SiteFooter links={hero} large />
    </div>
  );
}
