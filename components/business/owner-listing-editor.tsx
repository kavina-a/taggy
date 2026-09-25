"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/components/i18n/i18n-provider";
import type { BusinessHoursRow } from "@/lib/types/business";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DayState {
  open: boolean;
  openTime: string;
  closeTime: string;
}

function hoursToDays(hours: BusinessHoursRow[]): DayState[] {
  return DAY_LABELS.map((_, dayOfWeek) => {
    const row = hours.find((h) => h.dayOfWeek === dayOfWeek);
    return row
      ? { open: true, openTime: row.openTime, closeTime: row.closeTime }
      : { open: false, openTime: "09:00", closeTime: "17:00" };
  });
}

export function OwnerListingEditor({
  businessSlug,
  description,
  addressFreeText,
  hours,
}: {
  businessSlug: string;
  description: string;
  addressFreeText: string;
  hours: BusinessHoursRow[];
}) {
  const t = useT();
  const router = useRouter();
  const [desc, setDesc] = useState(description);
  const [address, setAddress] = useState(addressFreeText);
  const [days, setDays] = useState<DayState[]>(() => hoursToDays(hours));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const payloadHours = days.flatMap((day, dayOfWeek) =>
        day.open
          ? [
              {
                dayOfWeek,
                openTime: day.openTime,
                closeTime: day.closeTime,
                crossesMidnight: day.openTime > day.closeTime,
              },
            ]
          : [],
      );
      const res = await fetch(`/api/businesses/${businessSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          addressFreeText: address,
          hours: payloadHours,
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error ?? "Could not update the listing.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg bg-secondary/60 p-4">
      <h3 className="text-base font-semibold">{t.business.editListing}</h3>
      <div className="flex flex-col gap-2">
        <Label htmlFor="owner-description">{t.owner.description}</Label>
        <Textarea
          id="owner-description"
          value={desc}
          onChange={(event) => setDesc(event.target.value)}
          rows={5}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="owner-address">{t.owner.address}</Label>
        <Input
          id="owner-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">{t.business.hours}</legend>
        <p className="text-sm text-muted-foreground">{t.owner.hoursHint}</p>
        {days.map((day, index) => (
          <div key={DAY_LABELS[index]} className="flex flex-wrap items-center gap-2">
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={day.open}
                onChange={(event) => {
                  const next = [...days];
                  next[index] = { ...day, open: event.target.checked };
                  setDays(next);
                }}
              />
              {DAY_LABELS[index]}
            </label>
            {day.open && (
              <>
                <Input
                  type="time"
                  aria-label={`${DAY_LABELS[index]} open`}
                  value={day.openTime}
                  onChange={(event) => {
                    const next = [...days];
                    next[index] = { ...day, openTime: event.target.value };
                    setDays(next);
                  }}
                  className="w-auto"
                />
                <Input
                  type="time"
                  aria-label={`${DAY_LABELS[index]} close`}
                  value={day.closeTime}
                  onChange={(event) => {
                    const next = [...days];
                    next[index] = { ...day, closeTime: event.target.value };
                    setDays(next);
                  }}
                  className="w-auto"
                />
              </>
            )}
          </div>
        ))}
      </fieldset>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm font-medium text-status-open">{t.owner.saved}</p>}
      <Button
        type="submit"
        disabled={pending}
        className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
      >
        {t.owner.save}
      </Button>
    </form>
  );
}
