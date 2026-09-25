"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Messages } from "@/lib/i18n/messages";

export interface ReportQueueItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  businessName: string | null;
  businessSlug: string | null;
  consumerAlert: string | null;
  reviewSnippet: string | null;
}

export function ReportQueue({
  items,
  copy,
}: {
  items: ReportQueueItem[];
  copy: Messages["moderation"];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.consumerAlert ?? ""])),
  );

  async function patch(id: string, body: { status: string; consumerAlert?: string | null }) {
    setError(null);
    const res = await fetch(`/api/moderation/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(json?.error ?? "Could not update the report.");
      return;
    }
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="text-base text-muted-foreground">{copy.empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">
              {item.targetType} · {item.reason} · {item.status}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString("en-LK")}
            </p>
          </div>
          {item.businessName && (
            <p className="text-sm">
              {item.businessSlug ? (
                <a className="underline underline-offset-4" href={`/business/${item.businessSlug}`}>
                  {item.businessName}
                </a>
              ) : (
                item.businessName
              )}
            </p>
          )}
          {item.reviewSnippet && (
            <p className="text-sm text-muted-foreground">{item.reviewSnippet}</p>
          )}
          {item.targetType === "business" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor={`alert-${item.id}`}>
                {copy.setAlert}
              </label>
              <Textarea
                id={`alert-${item.id}`}
                value={alerts[item.id] ?? ""}
                onChange={(event) =>
                  setAlerts((current) => ({ ...current, [item.id]: event.target.value }))
                }
                rows={3}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() =>
                    patch(item.id, {
                      status: item.status,
                      consumerAlert: alerts[item.id] ?? "",
                    })
                  }
                >
                  {copy.saveAlert}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => {
                    setAlerts((current) => ({ ...current, [item.id]: "" }));
                    void patch(item.id, { status: item.status, consumerAlert: null });
                  }}
                >
                  {copy.clearAlert}
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => patch(item.id, { status: "reviewed" })}
            >
              {copy.markReviewed}
            </Button>
            <Button
              type="button"
              className="min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90"
              onClick={() => patch(item.id, { status: "actioned" })}
            >
              {copy.markActioned}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              onClick={() => patch(item.id, { status: "dismissed" })}
            >
              {copy.markDismissed}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
