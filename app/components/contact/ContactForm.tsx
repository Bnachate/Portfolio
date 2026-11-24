"use client";

import { AlertCircle, Send } from "lucide-react";
import { useState } from "react";
import { sendContactMessage } from "@/app/services/admin/contacts.service";
import { getErrorMessage } from "@/app/config/api.config";

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" };

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent outline-none";

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

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded-full mb-4">
          <Send size={32} />
        </div>
        <h3 className="text-2xl mb-2 text-gray-900">Message envoyé !</h3>
        <p className="text-gray-600 mb-6">Je vous répondrai dans les plus brefs délais.</p>
        <button type="button" onClick={() => setSubmitted(false)} className="text-cyan-600 hover:text-cyan-700 text-sm">
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-gray-700 mb-2">Nom</label>
          <input id="name" name="name" type="text" required maxLength={100} value={formData.name} onChange={handleChange} className={inputClass} placeholder="Votre nom" />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input id="email" name="email" type="email" required maxLength={200} value={formData.email} onChange={handleChange} className={inputClass} placeholder="votre@email.com" />
        </div>

        <div>
          <label htmlFor="subject" className="block text-gray-700 mb-2">Sujet</label>
          <input id="subject" name="subject" type="text" required maxLength={200} value={formData.subject} onChange={handleChange} className={inputClass} placeholder="Ex : Proposition de mission" />
        </div>

        <div>
          <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
          <textarea id="message" name="message" required rows={5} maxLength={5000} value={formData.message} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Votre message..." />
        </div>

        {/* Honeypot: hidden from humans, bots tend to fill it in */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Site web</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={20} />
          <span>{isSubmitting ? "Envoi en cours..." : "Envoyer le message"}</span>
        </button>
      </form>
    </div>
  );
}
