"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Star,
  Building2,
  Bookmark,
  ShieldAlert,
  LogOut,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchBar } from "@/components/search/search-bar";
import { cn } from "@/lib/utils";
import type { LanguageCode } from "@/lib/i18n/messages";
import type { Messages } from "@/lib/i18n/messages";

export interface HeaderProps {
  user: { name: string | null; phone: string; languagePref: string } | null;
  lang: LanguageCode;
  dict: Messages;
  isModerator: boolean;
  initials: string | null;
}

export function Header({ user, lang, dict, isModerator, initials }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  // On the homepage, the header is an overlay at the very top that scrolls away naturally and does not appear when scrolled down
  const isOverlay = isHomePage;

  return (
    <header
      className={cn(
        "w-full z-40 transition-all duration-300",
        isOverlay
          ? "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/85 via-black/40 to-transparent text-white border-b border-white/10"
          : "sticky top-0 bg-white text-neutral-900 border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
      )}
    >
      {/* Top Primary Navigation Bar */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 xl:px-8">
        {/* Left: Yelp-style Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Authentic Yelp-inspired Red Star Badge */}
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#D71616] text-white shadow-sm transition-transform group-hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                className="size-5 fill-current"
                aria-hidden="true"
              >
                <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-xl font-bold tracking-tight transition-colors",
                  isOverlay ? "text-white" : "text-neutral-900 group-hover:text-[#D71616]",
                )}
              >
                Lanka<span className="text-[#D71616]">Review</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar in Header (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <SearchBar variant="header" />
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* For Business Dropdown */}
          <div className="hidden xl:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors rounded-md",
                    isOverlay
                      ? "text-white/90 hover:text-white hover:bg-white/15"
                      : "text-neutral-700 hover:text-[#D71616] hover:bg-neutral-100",
                  )}
                >
                  <span>LankaReview for Business</span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
                <DropdownMenuItem asChild>
                  <Link
                    href={user ? "/businesses/new" : "/login"}
                    className="flex items-center gap-2.5 cursor-pointer py-2 text-sm font-medium"
                  >
                    <Building2 className="size-4 text-neutral-500" />
                    <span>Add a Business</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/claim"
                    className="flex items-center gap-2.5 cursor-pointer py-2 text-sm font-medium"
                  >
                    <ShieldAlert className="size-4 text-neutral-500" />
                    <span>Claim your Business</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/login"
                    className="flex items-center gap-2.5 cursor-pointer py-2 text-sm font-medium text-neutral-600"
                  >
                    <span>Business Owner Login</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Write a Review Button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "hidden lg:flex items-center gap-1.5 text-sm font-semibold transition-colors",
              isOverlay
                ? "text-white hover:text-white hover:bg-white/15"
                : "text-neutral-700 hover:text-[#D71616] hover:bg-neutral-100",
            )}
          >
            <Link href="/writeareview">
              <Star className="size-4 text-[#D71616] fill-[#D71616]" />
              <span>Write a Review</span>
            </Link>
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher isLoggedIn={Boolean(user)} initialValue={lang} />

          {/* User Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/saved" className="flex items-center gap-1.5">
                  <Bookmark className="size-4 text-neutral-600" />
                  <span>{dict.header.saved}</span>
                </Link>
              </Button>

              {isModerator && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/moderation" className="flex items-center gap-1.5 text-[#D71616]">
                    <ShieldAlert className="size-4" />
                    <span>{dict.header.moderation}</span>
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-1 text-sm font-medium hover:bg-neutral-100 transition-colors"
                  >
                    <Avatar className="size-8 border border-border">
                      <AvatarFallback className="bg-neutral-200 text-neutral-800 font-semibold text-xs">
                        {initials ?? <UserIcon className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {user.name ?? "User"}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user.phone}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/saved" className="flex items-center gap-2 py-2 cursor-pointer">
                      <Bookmark className="size-4 text-neutral-500" />
                      <span>{dict.header.saved}</span>
                    </Link>
                  </DropdownMenuItem>
                  {isModerator && (
                    <DropdownMenuItem asChild>
                      <Link href="/moderation" className="flex items-center gap-2 py-2 cursor-pointer">
                        <ShieldAlert className="size-4 text-neutral-500" />
                        <span>{dict.header.moderation}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <form action="/api/auth/logout" method="post" className="contents">
                    <DropdownMenuItem asChild>
                      <button
                        type="submit"
                        className="flex items-center gap-2 w-full text-left py-2 text-red-600 cursor-pointer font-medium"
                      >
                        <LogOut className="size-4" />
                        <span>{dict.header.logout}</span>
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full px-4 h-9 font-semibold text-sm transition-all",
                  isOverlay
                    ? "border-white/35 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    : "border-neutral-300 text-neutral-800 hover:bg-neutral-100",
                )}
              >
                <Link href="/login">{dict.header.login}</Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="rounded-full px-4 h-9 font-semibold text-sm bg-[#D71616] hover:bg-[#B80F0F] text-white shadow-sm"
              >
                <Link href="/login">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "inline-flex lg:hidden p-2 rounded-md transition-colors",
              isOverlay ? "text-white hover:bg-white/15" : "text-neutral-600 hover:bg-neutral-100",
            )}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Row 2: Desktop Yelp Category Mega-Menu */}
      <MegaMenu isOverlay={isOverlay} />

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-3 shadow-lg">
          <SearchBar variant="unified" />
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            <Link
              href="/search?category=restaurant"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-semibold text-neutral-800 hover:text-[#D71616]"
            >
              Restaurants
            </Link>
            <Link
              href="/search?category=home-services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-semibold text-neutral-800 hover:text-[#D71616]"
            >
              Home Services
            </Link>
            <Link
              href="/search?category=auto-repair"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-semibold text-neutral-800 hover:text-[#D71616]"
            >
              Auto Services
            </Link>
            <Link
              href="/search?category=beauty-spa"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-semibold text-neutral-800 hover:text-[#D71616]"
            >
              Beauty & Spas
            </Link>
            <Link
              href="/directory"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-sm font-semibold text-neutral-800 hover:text-[#D71616]"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
