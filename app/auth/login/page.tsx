"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/app/components/common/Button";
import { ErrorBanner } from "@/app/components/common/ErrorBanner";
import { Field } from "@/app/components/common/Field";
import { IconButton } from "@/app/components/common/IconButton";
import { Input } from "@/app/components/common/input";
import { LogoMark } from "@/app/components/common/LogoMark";
import { TextLink } from "@/app/components/common/AppLink";
import { gutter } from "@/app/components/site/ui";
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
          <LogoMark onInk />
          Brahim Nachate
        </Link>
        <div className="flex max-w-[30rem] flex-col gap-5">
          <p className="font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.03em]">Espace d&apos;administration</p>
          <p className="text-lg leading-[1.6] text-on-ink-soft">
            Gérez vos projets, votre parcours, vos compétences et les messages reçus par le formulaire de contact.
          </p>
        </div>
        <TextLink href="/" variant="onInk" className="self-start font-display text-base font-semibold underline">
          ← Retour au site
        </TextLink>
      </div>

      <main className={`flex items-center justify-center ${gutter} py-12`}>
        <div className="flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[44px] font-bold leading-none tracking-[-0.025em]">Connexion</h1>
            <p className="text-lg text-slate">Accès réservé au propriétaire du site.</p>
          </div>

          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Field id="email" label="E-mail">
              <Input
                id="email"
                type="email"
                fieldSize="lg"
                icon={Mail}
                autoComplete="username"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field id="password" label="Mot de passe">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                fieldSize="lg"
                icon={Lock}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                end={
                  <IconButton
                    label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    tone="ghost"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-10 w-10"
                  >
                    {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                  </IconButton>
                }
              />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
