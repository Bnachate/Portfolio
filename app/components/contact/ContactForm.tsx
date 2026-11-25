"use client";

import { useState } from "react";
import { sendContactMessage } from "@/app/services/admin/contacts.service";
import { getErrorMessage } from "@/app/config/api.config";
import { buttonStyles } from "@/app/components/site/ui";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" };

// Design system field: label always visible above, slate border, 48 px high
const fieldClass =
  "min-h-12 w-full rounded-lg border-[1.5px] border-slate bg-white px-3.5 font-display text-[17px] text-ink transition-colors duration-150 focus:border-mint focus:shadow-[0_0_0_1px_var(--color-mint)] focus-visible:outline-none";
const labelClass = "font-display text-base font-semibold";

export function ContactForm() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // `required` lets whitespace-only values through: check them before calling the API
    const { name, email, subject, message } = formData;
    if ([name, email, subject, message].some((value) => !value.trim())) {
      setError("Merci de remplir tous les champs.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      await sendContactMessage(formData);
      setSubmitted(true);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(getErrorMessage(err, "Le message n'a pas pu être envoyé. Réessayez plus tard."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const card = "flex min-w-0 flex-[1.3_1_400px] flex-col gap-[22px] rounded-2xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]";

  if (submitted) {
    return (
      <div className={card} role="status">
        <h2 className="font-display text-[28px] font-bold tracking-[-0.02em]">Message envoyé !</h2>
        <p className="text-lg leading-[1.6] text-slate">Merci. Je vous répondrai par e-mail dans les plus brefs délais.</p>
        <button type="button" onClick={() => setSubmitted(false)} className={`${buttonStyles.outline} self-start`}>
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={card} aria-label="Formulaire de contact">
      {error && (
        <p role="alert" className="rounded-lg border border-danger bg-danger-pale px-4 py-3 font-display text-base font-medium text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>Nom</label>
        <input id="name" name="name" type="text" required maxLength={100} autoComplete="name" value={formData.name} onChange={handleChange} className={fieldClass} placeholder="Votre nom" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>E-mail</label>
        <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" value={formData.email} onChange={handleChange} className={fieldClass} placeholder="vous@entreprise.fr" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className={labelClass}>Sujet</label>
        <input id="subject" name="subject" type="text" required maxLength={200} value={formData.subject} onChange={handleChange} className={fieldClass} placeholder="Un poste, une mission, une question" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea id="message" name="message" required rows={6} maxLength={5000} value={formData.message} onChange={handleChange} className={`${fieldClass} min-h-40 resize-y py-3 leading-normal`} placeholder="Le poste ou le projet, le contexte, vos délais" />
      </div>

      {/* Honeypot: hidden from humans, bots tend to fill it in */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
      </div>

      <button type="submit" disabled={isSubmitting} className={`${buttonStyles.ink} cursor-pointer self-start disabled:cursor-not-allowed disabled:opacity-50`}>
        {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
      </button>
    </form>
  );
}
