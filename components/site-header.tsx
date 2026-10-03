"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowForwardIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const { t } = useI18n();
  const { isSignedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mobile menu: focus the first link on open; close on Escape (returning focus) or outside click.
  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  const links = [
    { href: "/#product", label: t.nav.product },
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/#privacy", label: t.nav.privacy },
  ];

  const account = isSignedIn
    ? { href: "/dashboard", label: t.nav.dashboard }
    : { href: "/sign-in", label: t.nav.signIn };

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || menuOpen
          ? "border-line/70 bg-white/85 shadow-[0_8px_30px_-20px_rgb(15_23_42/0.25)]"
          : "border-transparent bg-white/60",
      )}
    >
      <a
        href="#main"
        className="sr-only rounded-lg bg-surface px-3 py-2 text-sm font-medium text-primary focus:not-sr-only focus:absolute focus:start-4 focus:top-3"
      >
        {t.common.skipToContent}
      </a>

      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Logo />

        <nav aria-label={t.nav.primary} className="hidden flex-1 md:block">
          <ul className="flex items-center gap-1 ps-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={buttonClass("ghost", "md", "font-medium")}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <LanguageToggle />
          <Link
            href={account.href}
            className={buttonClass("ghost", "md", "hidden font-medium md:inline-flex")}
          >
            {account.label}
          </Link>
          <Link href="/#waitlist" className={buttonClass("primary", "md", "hidden h-11 px-5 sm:inline-flex")}>
            {t.nav.joinWaitlist}
            <ArrowForwardIcon className="size-4 rtl:-scale-x-100" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-line-soft md:hidden"
          >
            {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!menuOpen}
        className="border-t border-line/70 bg-surface px-4 pb-5 pt-3 md:hidden"
      >
        <ul className="flex flex-col">
          {[...links, account].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-3 text-[15px] font-medium text-ink hover:bg-line-soft"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/#waitlist"
          onClick={() => setMenuOpen(false)}
          className={buttonClass("primary", "lg", "mt-3 w-full")}
        >
          {t.nav.joinWaitlist}
        </Link>
      </div>
    </header>
  );
}
