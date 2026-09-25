"use client";

import { createContext, useContext, type ReactNode } from "react";
import { en, type LanguageCode, type Messages } from "@/lib/i18n/messages";

interface I18nValue {
  lang: LanguageCode;
  dict: Messages;
}

const I18nContext = createContext<I18nValue>({ lang: "en", dict: en });

export function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: LanguageCode;
  dict: Messages;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ lang, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export function useT(): Messages {
  return useContext(I18nContext).dict;
}
