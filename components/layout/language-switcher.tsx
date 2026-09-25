"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/components/i18n/i18n-provider";
import type { LanguageCode } from "@/lib/i18n/messages";

export type { LanguageCode };

export interface LanguageSwitcherProps {
  isLoggedIn: boolean;
  initialValue: LanguageCode;
}

const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: "en", label: "English" },
  { value: "si", label: "සිංහල" },
  { value: "ta", label: "தமிழ்" },
];

export function LanguageSwitcher({ isLoggedIn, initialValue }: LanguageSwitcherProps) {
  const t = useT();
  const router = useRouter();
  const [value, setValue] = useState<LanguageCode>(initialValue);

  async function handleChange(next: string) {
    const lang = next as LanguageCode;
    setValue(lang);
    document.cookie = `lang_pref=${lang}; path=/; max-age=31536000`;

    if (isLoggedIn) {
      await fetch("/api/auth/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger size="sm" aria-label={t.header.language}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
