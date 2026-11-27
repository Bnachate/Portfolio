import { MessageSquareText, Mail, ShieldCheck, type LucideIcon } from "lucide-react";
import type { JSX } from "react";

// No email or phone number here on purpose: visitors reach out through the form,
// so personal contact details are never exposed to scrapers
type Step = { icon: LucideIcon; title: string; text: string };

const STEPS: Step[] = [
  {
    icon: MessageSquareText,
    title: "Écrivez-moi via le formulaire",
    text: "Présentez-vous et décrivez votre projet ou votre besoin en quelques lignes.",
  },
  {
    icon: Mail,
    title: "Je vous réponds par email",
    text: "Je reviens vers vous dans les plus brefs délais à l'adresse que vous m'avez indiquée.",
  },
  {
    icon: ShieldCheck,
    title: "Vos données restent privées",
    text: "Votre message n'est utilisé que pour vous répondre et n'est jamais partagé.",
  },
];

export function ContactInfo(): JSX.Element {
  return (
    <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-8 py-2">
      <div>
        <h2 className="mb-4 font-display text-[22px] text-ink">Restons en contact</h2>
        <p className="text-[15px] leading-relaxed text-slate">
          Je suis toujours ouvert aux nouvelles opportunités et collaborations. Pour obtenir mes coordonnées,
          envoyez-moi simplement un message via le formulaire : je vous recontacterai personnellement.
        </p>
      </div>

      <ol className="flex flex-col gap-7">
        {STEPS.map(({ icon: Icon, title, text }: Step) => (
          <li key={title} className="flex items-start gap-4">
            <div className="shrink-0 rounded-lg bg-mint p-3 text-on-ink">
              <Icon size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-ink">{title}</p>
              <p className="text-[15px] leading-relaxed text-slate">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
