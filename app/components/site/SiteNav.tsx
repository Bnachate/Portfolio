"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button, ButtonLink } from "@/app/components/common/Button";
import { cn } from "@/app/components/common/utils";

export type PageKey = "home" | "projets" | "experience" | "competences" | "contact";

type NavKey = PageKey | "admin";

const NAV: { key: NavKey; href: string; label: string }[] = [
  { key: "home", href: "/", label: "Accueil" },
  { key: "projets", href: "/projets", label: "Projets" },
  { key: "experience", href: "/experience", label: "Expérience" },
  { key: "competences", href: "/competences", label: "Compétences" },
  { key: "contact", href: "/contact", label: "Contact" },
  // Admin panel: read-only for visitors, editable once logged in
  { key: "admin", href: "/admin", label: "Admin" },
];

const NAV_ID = "site-navigation";

/**
 * Main navigation. From the `lg` breakpoint the links sit in one row; below it they are folded
 * behind a "Menu" disclosure button (aria-expanded / aria-controls) and open as a vertical list
 * under the header. Escape, a click outside or choosing a link closes it.
 */
export function SiteNav({ current, dark, cvUrl }: { current: PageKey; dark: boolean; cvUrl: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!navRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    // Back to the desktop layout: the row is always shown, so forget the open state
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (event: MediaQueryListEvent) => event.matches && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <Button
        ref={buttonRef}
        variant={dark ? "outlineOnInk" : "outline"}
        aria-expanded={open}
        aria-controls={NAV_ID}
        onClick={() => setOpen((value) => !value)}
        className="px-4 lg:hidden"
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        Menu
      </Button>
      <nav
        ref={navRef}
        id={NAV_ID}
        aria-label="Navigation principale"
        className={cn(
          "font-display text-base font-medium lg:flex lg:flex-wrap lg:items-center lg:gap-x-2 lg:gap-y-1",
          // Phone and tablet: full-width vertical list under the logo, shown only when open
          open ? "flex basis-full flex-col gap-1 border-t pt-4" : "hidden",
          dark ? "border-ink-rule" : "border-line",
          "lg:basis-auto lg:flex-row lg:border-t-0 lg:pt-0",
        )}
      >
        {NAV.map((item) => {
          const active = item.key === current;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={close}
              className={cn(
                "flex min-h-11 items-center px-3.5 py-2.5 transition-colors duration-150",
                // Current page: mint rule on the left in the list, under the link in the row
                "border-l-[3px] lg:border-b-2 lg:border-l-0",
                active ? (dark ? "border-mint-light" : "border-mint") : "border-transparent",
                dark ? cn(active ? "text-on-ink" : "text-mist", "hover:text-mint-light") : "text-ink hover:text-mint",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <ButtonLink href={cvUrl} newTab variant={dark ? "outlineOnInk" : "outline"} onClick={close} className="mt-2 px-4 font-medium lg:mt-0 lg:ml-2">
          CV en PDF
        </ButtonLink>
      </nav>
    </>
  );
}
