"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Camera, MapPin, User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EditProfileDialogProps {
  initialName: string | null;
  initialCity: string | null;
  initialAvatarUrl: string | null;
}

export function EditProfileDialog({
  initialName,
  initialCity,
  initialAvatarUrl,
}: EditProfileDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName ?? "");
  const [city, setCity] = useState(initialCity ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          city: city.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update profile");
      }

      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-md font-semibold text-xs border-neutral-300 hover:bg-neutral-100 flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Pencil className="size-3.5 text-neutral-500" />
          <span>Edit Profile</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900">
              Edit Your Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              Update your public display name, hometown, and profile photo.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="display-name" className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                <UserIcon className="size-3.5" />
                <span>Display Name</span>
              </Label>
              <Input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saman Kumara"
                maxLength={80}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hometown" className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                <MapPin className="size-3.5" />
                <span>Hometown / City</span>
              </Label>
              <Input
                id="hometown"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Colombo 07, Kandy, Galle"
                maxLength={80}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="avatar-url" className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                <Camera className="size-3.5" />
                <span>Profile Photo URL</span>
              </Label>
              <Input
                id="avatar-url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                type="url"
              />
              <span className="text-[11px] text-neutral-400">
                Provide a direct link to any high-res image or leave empty to use initials.
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#D71616] hover:bg-[#B80F0F] text-white font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
