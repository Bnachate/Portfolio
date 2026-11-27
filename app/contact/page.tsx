import type { Metadata } from "next";
import { getPublicHero } from "@/server/services/hero";
import { SiteHeader } from "@/app/components/site/SiteHeader";
import { SiteFooter } from "@/app/components/site/SiteFooter";
import { PageTitle, Section } from "@/app/components/site/ui";
import { ContactForm } from "@/app/components/contact/ContactForm";
import { ContactInfo } from "@/app/components/contact/ContactInfo";
import type { JSX } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Brahim Nachate pour un poste, une mission ou une question sur un projet.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage(): Promise<JSX.Element> {
  const hero = await getPublicHero();

  return (
    <div className="min-h-screen">
      <SiteHeader current="contact" />
      <main>
        <PageTitle title="Contact" lead="Un poste, une mission ou une question sur un projet : écrivez-moi, je vous répondrai par e-mail." />

        <Section className="pt-16">
          <div className="flex flex-wrap items-start gap-x-[72px] gap-y-12">
            <ContactInfo />
            <ContactForm />
          </div>
        </Section>
      </main>
      <SiteFooter links={hero} />
    </div>
  );
}
