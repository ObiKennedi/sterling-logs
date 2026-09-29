"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/common/LinkButton";
import styles from "./Header.module.scss";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Platforms", href: "#platforms" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.headerContainer}>
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Desktop Navigation Links */}
        <nav className={styles.navDesktop} aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={styles.navLink}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className={styles.actionsDesktop}>
          <Link href="/login" className={styles.loginLink}>
            Log In
          </Link>
          <LinkButton href="/signup" size="md">
            Sign Up
          </LinkButton>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div className={styles.mobileMenu} role="dialog" aria-modal="true">
            <nav className={styles.mobileNavLinks}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={18} opacity={0.6} />
                </a>
              ))}
            </nav>

            <div className={styles.mobileDivider} />

            <div className={styles.mobileActions}>
              <Link
                href="/login"
                className={styles.mobileLoginBtn}
                onClick={closeMobileMenu}
              >
                Log In
              </Link>
              <LinkButton
                href="/signup"
                size="lg"
                onClick={closeMobileMenu}
                className={styles.mobileSignUpBtn}
              >
                Sign Up
              </LinkButton>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
