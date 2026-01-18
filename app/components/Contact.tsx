"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation d'envoi de formulaire
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl mb-4 text-gray-900">Contactez-moi</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            { `Vous avez un projet en tête ? N'hésitez pas à me contacter pour en discuter` }
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl mb-6 text-gray-900">Restons en contact</h3>
              <p className="text-gray-600 mb-8">
                { `Je suis toujours ouvert aux nouvelles opportunités et collaborations. 
                N'hésitez pas à me contacter !` }
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-cyan-600 text-white p-3 rounded-lg">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="text-gray-900">contact@example.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-cyan-600 text-white p-3 rounded-lg">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-gray-600">Téléphone</p>
                  <p className="text-gray-900">+33 6 12 34 56 78</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-cyan-600 text-white p-3 rounded-lg">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-gray-600">Localisation</p>
                  <p className="text-gray-900">Paris, France</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-green-100 text-green-700 p-4 rounded-full mb-4">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl mb-2 text-gray-900">Message envoyé !</h3>
                <p className="text-gray-600">Je vous répondrai dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent outline-none"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent outline-none"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent outline-none resize-none"
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  <span>Envoyer le message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}