"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type LanguageCode = "en" | "si" | "ta";

export interface LanguageSwitcherProps {
  isLoggedIn: boolean;
  initialValue: LanguageCode;
}

const LANGUAGE_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: "en", label: "English" },
  { value: "si", label: "සිංහල" },
  { value: "ta", label: "தமிழ்" },
];

// 02-CONTEXT.md D-07 / 02-UI-SPEC.md Copywriting Contract "Language switcher
// label" — selecting si/ta only persists the preference and shows this one
// inline note; it must NOT change any other rendered string this phase.
export function LanguageSwitcher({ isLoggedIn, initialValue }: LanguageSwitcherProps) {
  const [value, setValue] = useState<LanguageCode>(initialValue);

  async function handleChange(next: string) {
    const lang = next as LanguageCode;
    setValue(lang);

    if (isLoggedIn) {
      // Logged-in users persist via User.languagePref server-side (02-RESEARCH.md Pattern 6).
      await fetch("/api/auth/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
      });
    } else {
      // Guests persist via a plain (non-httpOnly) cookie, set directly — no
      // server round trip needed for a preference with zero PII/security
      // sensitivity (T-02-10).
      document.cookie = `lang_pref=${lang}; path=/; max-age=31536000`;
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger size="sm" aria-label="Language">
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
      {(value === "si" || value === "ta") && (
        <p className="text-xs text-muted-foreground">
          Sinhala/Tamil UI coming soon — your preference is saved
        </p>
      )}
    </div>
  );
}
