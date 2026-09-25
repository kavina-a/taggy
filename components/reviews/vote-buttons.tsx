"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThumbsUpIcon, SmileIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import type { VoteKindInput } from "@/lib/validation/vote.schema";

const KINDS: { kind: VoteKindInput; label: string; icon: typeof ThumbsUpIcon }[] = [
  { kind: "useful", label: "Useful", icon: ThumbsUpIcon },
  { kind: "funny", label: "Funny", icon: SmileIcon },
  { kind: "cool", label: "Cool", icon: SunIcon },
];

export interface VoteButtonsProps {
  reviewId: string;
  usefulCount: number;
  funnyCount: number;
  coolCount: number;
  viewerVotes: Array<"useful" | "funny" | "cool">;
  currentUserId: string | null;
  isOwnReview: boolean;
}

export function VoteButtons({
  reviewId,
  usefulCount,
  funnyCount,
  coolCount,
  viewerVotes,
  currentUserId,
  isOwnReview,
}: VoteButtonsProps) {
  const router = useRouter();
  const [counts, setCounts] = useState({
    useful: usefulCount,
    funny: funnyCount,
    cool: coolCount,
  });
  const [voted, setVoted] = useState<Set<string>>(() => new Set(viewerVotes));
  const [pending, setPending] = useState<string | null>(null);

  if (isOwnReview) return null;

  if (currentUserId === null) {
    return (
      <div className="flex flex-wrap gap-2">
        {KINDS.map(({ kind, label, icon: Icon }) => (
          <Button key={kind} asChild variant="outline" className="min-h-11">
            <Link href="/login">
              <Icon className="size-4" />
              {label}
              {counts[kind] > 0 ? ` ${counts[kind]}` : ""}
            </Link>
          </Button>
        ))}
      </div>
    );
  }

  async function toggle(kind: VoteKindInput) {
    if (pending) return;
    setPending(kind);
    const wasVoted = voted.has(kind);
    setVoted((prev) => {
      const next = new Set(prev);
      if (wasVoted) next.delete(kind);
      else next.add(kind);
      return next;
    });
    setCounts((prev) => ({ ...prev, [kind]: prev[kind] + (wasVoted ? -1 : 1) }));

    try {
      const res = await fetch(`/api/reviews/${reviewId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (!res.ok) {
        setVoted((prev) => {
          const next = new Set(prev);
          if (wasVoted) next.add(kind);
          else next.delete(kind);
          return next;
        });
        setCounts((prev) => ({ ...prev, [kind]: prev[kind] + (wasVoted ? 1 : -1) }));
        return;
      }
      const data = (await res.json()) as {
        voted: boolean;
        counts: { useful: number; funny: number; cool: number };
      };
      setCounts(data.counts);
      setVoted((prev) => {
        const next = new Set(prev);
        if (data.voted) next.add(kind);
        else next.delete(kind);
        return next;
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {KINDS.map(({ kind, label, icon: Icon }) => {
        const isOn = voted.has(kind);
        return (
          <Button
            key={kind}
            type="button"
            variant={isOn ? "secondary" : "outline"}
            className={cn("min-h-11", isOn && "border-brand-accent")}
            aria-pressed={isOn}
            disabled={pending === kind}
            onClick={() => toggle(kind)}
          >
            <Icon className="size-4" />
            {label}
            {counts[kind] > 0 ? ` ${counts[kind]}` : ""}
          </Button>
        );
      })}
    </div>
  );
}

export default VoteButtons;
