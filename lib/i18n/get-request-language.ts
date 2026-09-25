import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/messages";

export async function getRequestLanguage(): Promise<LanguageCode> {
  const session = await getSession();
  if (session.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { languagePref: true },
    });
    if (isLanguageCode(user?.languagePref)) return user.languagePref;
  }

  const cookieLang = (await cookies()).get("lang_pref")?.value;
  return isLanguageCode(cookieLang) ? cookieLang : "en";
}
