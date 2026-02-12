"use client";

import { Mail, MapPin, Phone } from "lucide-react";

export function ContactInfo() {

  return (
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
            <p className="text-gray-900">nachate.brahim@gmail.com</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-cyan-600 text-white p-3 rounded-lg">
            <Phone size={24} />
          </div>
          <div>
            <p className="text-gray-600">Téléphone</p>
            <p className="text-gray-900">+33 6 17 34 91 24</p>
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
  );
}
