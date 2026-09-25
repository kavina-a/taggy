"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CollectionMembership } from "@/lib/types/collection";

export function SaveBusinessButton({
  businessId,
  currentUserId,
  memberships,
}: {
  businessId: string;
  currentUserId: string | null;
  memberships: CollectionMembership[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState(memberships);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const savedInDefault = lists.some((c) => c.containsBusiness);

  if (currentUserId === null) {
    return (
      <Button asChild variant="outline" className="min-h-11">
        <Link href="/login">
          <BookmarkIcon className="size-4" />
          Save
        </Link>
      </Button>
    );
  }

  async function toggle(collectionId: string, next: boolean) {
    setError(null);
    const path = `/api/collections/${collectionId}/items`;
    const res = next
      ? await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId }),
        })
      : await fetch(`${path}/${businessId}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Couldn't update this list.");
      return;
    }
    setLists((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, containsBusiness: next } : c)),
    );
    router.refresh();
  }

  async function createList() {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    const createRes = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const created = (await createRes.json().catch(() => null)) as { id?: string; name?: string } | null;
    if (!createRes.ok || !created?.id) {
      setError("Couldn't create that list.");
      return;
    }
    const addRes = await fetch(`/api/collections/${created.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });
    if (!addRes.ok) {
      setError("List created, but the business wasn't added.");
      return;
    }
    setLists((prev) => [
      ...prev,
      { id: created.id!, name: created.name ?? name, containsBusiness: true },
    ]);
    setNewName("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={savedInDefault ? "default" : "outline"} className="min-h-11">
          <BookmarkIcon className="size-4" />
          {savedInDefault ? "Saved" : "Save"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save this business</DialogTitle>
          <DialogDescription>
            Add it to My Saved Places or a named list.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {lists.map((list) => (
            <label key={list.id} className="flex min-h-11 items-center gap-2">
              <Checkbox
                checked={list.containsBusiness}
                onCheckedChange={(checked) => {
                  void toggle(list.id, checked === true);
                }}
              />
              <span>{list.name}</span>
            </label>
          ))}
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-collection">New list</Label>
            <Input
              id="new-collection"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Weekend spots"
            />
            <Button type="button" variant="outline" className="min-h-11 w-fit" onClick={() => void createList()}>
              Create and save
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
