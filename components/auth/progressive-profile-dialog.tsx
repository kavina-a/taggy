"use client";

import { useState, type MouseEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface ProgressiveProfileDialogProps {
  open: boolean;
  onDismiss: () => void;
}

// UI-SPEC Screen 3 Step 3 / D-06 — a non-blocking, dismissible name prompt
// shown exactly once (the parent only renders this when
// user.hasSeenProfilePrompt is false). Both "Save" and "Skip for now" persist
// through the SAME /api/auth/profile call so hasSeenProfilePrompt is always
// set server-side, regardless of which path the user takes (never two
// diverging code paths that could drift out of sync).
export function ProgressiveProfileDialog({ open, onDismiss }: ProgressiveProfileDialogProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function persist(nameValue: string | null) {
    setSaving(true);
    try {
      await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue }),
      });
    } finally {
      setSaving(false);
      onDismiss();
    }
  }

  function handleSave() {
    const trimmed = name.trim();
    void persist(trimmed.length > 0 ? trimmed : null);
  }

  function handleSkip(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    void persist(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>What should we call you?</DialogTitle>
          <DialogDescription>
            Optional — add a name so it&apos;s clearly you if you write a review or ask a
            question later. You can skip this for now.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            disabled={saving}
          />
        </div>
        <DialogFooter>
          <a
            href="#"
            onClick={handleSkip}
            aria-disabled={saving}
            className="flex min-h-11 items-center justify-center text-sm text-muted-foreground underline underline-offset-4 sm:justify-start"
          >
            Skip for now
          </a>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProgressiveProfileDialog;
