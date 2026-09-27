import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { getDictionary, isLanguageCode, type LanguageCode } from "@/lib/i18n/messages";
import { getRequestLanguage } from "@/lib/i18n/get-request-language";
import { isModeratorPhone } from "@/lib/moderation/is-moderator";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
  let user: { id: string; name: string | null; phone: string; languagePref: string } | null = null;
  if (session.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, phone: true, languagePref: true },
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
      <body className="min-h-full flex flex-col bg-white">
        <I18nProvider lang={lang} dict={dict}>
          <Header
            user={user}
            lang={lang}
            dict={dict}
            isModerator={isModerator}
            initials={initials}
          />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
