"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PhotoUploadForm({
  businessSlug,
  currentUserId,
}: {
  businessSlug: string;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  if (currentUserId === null) {
    return (
      <Button asChild variant="outline" className="min-h-11 w-fit">
        <Link href="/login">Log in to add a photo</Link>
      </Button>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Choose a photo to upload.");
      return;
    }

    setPending(true);
    setError(null);
    const body = new FormData();
    body.set("file", file);
    if (caption.trim()) body.set("caption", caption.trim());

    const res = await fetch(`/api/businesses/${businessSlug}/photos`, {
      method: "POST",
      body,
    });
    const json = (await res.json().catch(() => null)) as
      | { error?: string; reasons?: string[] }
      | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error ?? "This photo couldn't be published.");
      return;
    }
    setCaption("");
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-4">
      <Label htmlFor="photo-file">Add a photo</Label>
      <Input id="photo-file" name="file" type="file" accept="image/jpeg,image/png,image/webp" />
      <Label htmlFor="photo-caption">Caption (optional)</Label>
      <Input
        id="photo-caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={200}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={pending}
        className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
      >
        {pending ? "Uploading…" : "Upload photo"}
      </Button>
    </form>
  );
}
