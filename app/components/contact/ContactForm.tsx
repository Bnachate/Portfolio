"use client";

import { useState } from "react";
import { sendContactMessage } from "@/app/services/admin/contacts.service";
import { getErrorMessage } from "@/app/config/api.config";
import { Button } from "@/app/components/common/Button";
import { ErrorBanner } from "@/app/components/common/ErrorBanner";
import { Field } from "@/app/components/common/Field";
import { Input } from "@/app/components/common/input";
import { Textarea } from "@/app/components/common/textarea";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" };

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
        <Button variant="outline" size="lg" onClick={() => setSubmitted(false)} className="self-start">
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={card} aria-label="Formulaire de contact">
      <ErrorBanner message={error} />

      <Field id="name" label="Nom">
        <Input id="name" name="name" fieldSize="lg" required maxLength={100} autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Votre nom" />
      </Field>

      <Field id="email" label="E-mail">
        <Input id="email" name="email" type="email" fieldSize="lg" required maxLength={200} autoComplete="email" value={formData.email} onChange={handleChange} placeholder="vous@entreprise.fr" />
      </Field>

      <Field id="subject" label="Sujet">
        <Input id="subject" name="subject" fieldSize="lg" required maxLength={200} value={formData.subject} onChange={handleChange} placeholder="Un poste, une mission, une question" />
      </Field>

      <Field id="message" label="Message">
        <Textarea id="message" name="message" fieldSize="lg" required rows={6} maxLength={5000} value={formData.message} onChange={handleChange} className="min-h-40" placeholder="Le poste ou le projet, le contexte, vos délais" />
      </Field>

      {/* Honeypot: hidden from humans, bots tend to fill it in */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
      </Button>
    </form>
  );
}
