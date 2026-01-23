"use client";

import { ContactForm } from './contact/ContactForm';
import { ContactInfo } from './contact/ContactInfo';

export function Contact() {

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
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
