import { SITE } from "@/app/config/site";
import { TextLink } from "@/app/components/common/AppLink";
import { ButtonLink } from "@/app/components/common/Button";
import { Container, gutter } from "./ui";
import type { JSX } from "react";

type FooterLinks = { githubUrl: string; linkedinUrl: string };

/**
 * Ink footer. `large` is the home page version with a big call to action.
 * No email address here on purpose: visitors reach out through the contact form.
 */
export function SiteFooter({ links, large = false }: { links: FooterLinks; large?: boolean }): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer className={`bg-ink ${gutter} text-on-ink ${large ? "mt-28 pb-10 pt-24" : "mt-24 pb-10 pt-14"}`}>
      <Container className={`flex flex-col ${large ? "gap-[72px]" : "gap-10"}`}>
        <div className="flex flex-wrap items-end justify-between gap-x-14 gap-y-8">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-5">
            <h2
              className={`font-display font-bold ${
                large ? "text-[clamp(34px,5vw,56px)] leading-[1.05] tracking-[-0.03em]" : "text-[28px] tracking-[-0.02em]"
              } text-balance`}
            >
              {large ? "Un poste ou un projet à discuter ?" : "Un projet à discuter ?"}
            </h2>
            <p className={`font-display font-medium text-mint-light ${large ? "text-[clamp(20px,2.4vw,28px)]" : "text-xl"}`}>
              Je réponds à chaque message par e-mail.
            </p>
          </div>
          <ButtonLink variant="mint" size="lg" href="/contact">
            Écrire à Brahim
          </ButtonLink>
        </div>
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-4 border-t border-ink-rule pt-7 font-display text-[15px] text-on-ink-muted">
          <span>
            © {year} {SITE.name}
          </span>
          <nav aria-label="Liens du pied de page" className="flex flex-wrap gap-x-6 gap-y-2">
            <TextLink variant="onInk" href="/contact">
              Contact
            </TextLink>
            <TextLink variant="onInk" href={links.githubUrl} newTab>
              GitHub
            </TextLink>
            <TextLink variant="onInk" href={links.linkedinUrl} newTab>
              LinkedIn
            </TextLink>
            <TextLink variant="onInk" href="/admin">
              Admin
            </TextLink>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
