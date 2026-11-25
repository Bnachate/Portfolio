"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/common/Button";
import { Input } from "@/app/components/common/input";
import { Label } from "@/app/components/common/label";
import { login } from "@/app/services/auth.service";
import { getErrorMessage } from "@/app/config/api.config";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Whitespace-only values pass `required`: never send them (each attempt counts towards the rate limit)
    if (!email.trim() || !password.trim()) {
      setError("Veuillez saisir votre email et votre mot de passe");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // The API sets an HttpOnly session cookie on success
      await login(email, password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Email ou mot de passe incorrect"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Ink panel: who this space is for */}
      <div className="flex flex-col justify-between gap-12 bg-ink px-[clamp(24px,6vw,80px)] py-12 text-on-ink">
        <Link href="/" className="flex items-center gap-3 self-start font-display text-lg font-semibold">
          <span aria-hidden="true" className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-mint-light text-base font-bold text-ink">
            BN
          </span>
          Brahim Nachate
        </Link>
        <div className="flex max-w-[30rem] flex-col gap-5">
          <p className="font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.03em]">Espace d&apos;administration</p>
          <p className="text-lg leading-[1.6] text-on-ink-soft">
            Gérez vos projets, votre parcours, vos compétences et les messages reçus par le formulaire de contact.
          </p>
        </div>
        <Link href="/" className="self-start font-display text-base font-semibold text-line underline underline-offset-4 hover:text-mint-light">
          ← Retour au site
        </Link>
      </div>

      <main className="flex items-center justify-center px-[clamp(20px,6vw,80px)] py-12">
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[44px] font-bold leading-none tracking-[-0.025em]">Connexion</h1>
            <p className="text-lg text-slate">Accès réservé au propriétaire du site.</p>
          </div>

          {error && (
            <p role="alert" className="flex items-center gap-2 rounded-lg border border-danger bg-danger-pale p-4 font-display text-base font-medium text-danger">
              <AlertCircle size={20} aria-hidden="true" className="shrink-0" />
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate" size={20} />
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-12 pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate" size={20} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-12 pr-12 pl-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-1.5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate hover:bg-mist hover:text-ink"
                >
                  {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="min-h-[52px] w-full text-[17px]" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
