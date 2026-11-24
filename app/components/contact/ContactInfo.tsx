import { MessageSquareText, Mail, ShieldCheck } from "lucide-react";

// No email or phone number here on purpose: visitors reach out through the form,
// so personal contact details are never exposed to scrapers
const STEPS = [
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

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl mb-4 text-gray-900">Restons en contact</h3>
        <p className="text-gray-600">
          Je suis toujours ouvert aux nouvelles opportunités et collaborations. Pour obtenir mes coordonnées,
          envoyez-moi simplement un message via le formulaire : je vous recontacterai personnellement.
        </p>
      </div>

      <ol className="space-y-6">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <div className="bg-cyan-600 text-white p-3 rounded-lg shrink-0">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-gray-900 font-medium">{title}</p>
              <p className="text-gray-600">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
