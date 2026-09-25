"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CollectionSummary } from "@/lib/types/collection";

export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(collection.isPublic);
  const [pending, setPending] = useState(false);

  async function togglePublic() {
    setPending(true);
    const res = await fetch(`/api/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !isPublic }),
    });
    setPending(false);
    if (!res.ok) return;
    setIsPublic(!isPublic);
    router.refresh();
  }

  return (
    <article className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <h2 className="text-lg font-semibold">
        <Link href={`/collections/${collection.slug}`} className="hover:underline">
          {collection.name}
        </Link>
      </h2>
      <p className="text-sm text-muted-foreground">
        {collection.itemCount} {collection.itemCount === 1 ? "place" : "places"}
        {collection.isDefault ? " · Default" : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={pending}
          onClick={() => void togglePublic()}
        >
          {isPublic ? "Make private" : "Make public"}
        </Button>
        {isPublic && (
          <Button asChild variant="ghost" className="min-h-11">
            <Link href={`/collections/${collection.slug}`}>Shareable link</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
