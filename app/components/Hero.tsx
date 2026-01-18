"use client";
import { Github, Linkedin, Mail } from "lucide-react";
import { ImageWithFallback } from "./common/ImageWithFallback";

export function Hero() {
  return (
    <section id="accueil" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-cyan-50 to-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl mb-4 text-gray-900">
              Développeur Vue.js React niopy
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              { `Création d'expériences web modernes et performantes` }
            </p>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl">
              Passionné par le développement web, je transforme des idées en applications 
              élégantes et intuitives. Spécialisé en React, TypeScript et design moderne.
            </p>
            <div className="flex gap-4 justify-center md:justify-start mb-8">
              <a
                href="#contact"
                className="bg-cyan-600 text-white px-8 py-3 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Me contacter
              </a>
              <a
                href="#projets"
                className="border-2 border-cyan-600 text-cyan-600 px-8 py-3 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                Voir mes projets
              </a>
            </div>
            <div className="flex gap-6 justify-center md:justify-start">
              <a href="https://github.com/Bnachate" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-cyan-600 transition-colors">
                <Github size={28} />
              </a>
              <a href="https://www.linkedin.com/in/brahim-nachate/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-cyan-600 transition-colors">
                <Linkedin size={28} />
              </a>
              <a href="mailto:nachate.brahim@gmail.com" className="text-gray-700 hover:text-cyan-600 transition-colors">
                <Mail size={28} />
              </a>
            </div>
          </div>
          <div className="flex-1 max-w-md relative h-96 w-full">
            <ImageWithFallback
              src="https://media.licdn.com/dms/image/v2/D4E03AQG_EUscfKZ8gw/profile-displayphoto-crop_800_800/B4EZuh0VXsMAAI-/0/1767946409941?e=1770249600&v=beta&t=DhhrORd89Fqqs-ZZ0v2ysO4Bl-ulc6OWVMIBH0PnyNY"
              alt="Developer front-end"
              className="rounded-2xl shadow-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}