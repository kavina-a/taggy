import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { getDictionary, isLanguageCode, type LanguageCode } from "@/lib/i18n/messages";
import { getRequestLanguage } from "@/lib/i18n/get-request-language";
import { isModeratorPhone } from "@/lib/moderation/is-moderator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-noto-sinhala",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
});

export const metadata: Metadata = {
  title: "LankaReview",
  description: "Find great local businesses in Colombo",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  let user: { name: string | null; phone: string; languagePref: string } | null = null;
  if (session.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, phone: true, languagePref: true },
    });
  }

  const lang: LanguageCode = isLanguageCode(user?.languagePref)
    ? user.languagePref
    : await getRequestLanguage();
  const dict = getDictionary(lang);
  const isModerator = isModeratorPhone(user?.phone ?? session.phone);
  const initials = user?.name ? user.name.trim().charAt(0).toUpperCase() : null;

  return (
    <html
      lang={lang}
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        notoSinhala.variable,
        notoTamil.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider lang={lang} dict={dict}>
          <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              LankaReview
            </Link>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="min-h-11">
                <Link href={user ? "/businesses/new" : "/login"}>{dict.header.addBusiness}</Link>
              </Button>
              {user ? (
                <Button asChild variant="ghost" size="sm" className="min-h-11">
                  <Link href="/saved">{dict.header.saved}</Link>
                </Button>
              ) : null}
              {isModerator ? (
                <Button asChild variant="ghost" size="sm" className="min-h-11">
                  <Link href="/moderation">{dict.header.moderation}</Link>
                </Button>
              ) : null}
              <LanguageSwitcher isLoggedIn={Boolean(user)} initialValue={lang} />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-muted"
                    >
                      <Avatar size="sm">
                        <AvatarFallback>
                          {initials ?? <UserIcon className="size-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{user.name ?? dict.header.account}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <form action="/api/auth/logout" method="post" className="contents">
                      <DropdownMenuItem asChild>
                        <button type="submit" className="w-full text-left">
                          {dict.header.logout}
                        </button>
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="bg-brand-accent text-white hover:bg-brand-accent/90">
                  <Link href="/login">{dict.header.login}</Link>
                </Button>
              )}
            </div>
          </header>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
