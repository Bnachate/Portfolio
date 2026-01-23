"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/input";
import { Label } from "../components/common/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock password reset - in production, this would send reset email
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="text-green-600" size={48} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email envoyé !</h2>
            <p className="text-gray-600 mb-6">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
              Veuillez vérifier votre boîte de réception.
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  Retour à la connexion
                </Button>
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full text-cyan-600 hover:text-cyan-700 text-sm"
              >
                Renvoyer l&apos;email
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-600 hover:text-cyan-600 text-sm">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
          </Link>
          <p className="text-gray-600">Réinitialisez votre mot de passe</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h2>
            <p className="text-gray-600 text-sm">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700">
              Envoyer le lien de réinitialisation
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm">
              <ArrowLeft size={16} />
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-cyan-600 text-sm">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
