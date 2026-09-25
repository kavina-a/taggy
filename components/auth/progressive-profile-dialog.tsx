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
import { useT } from "@/components/i18n/i18n-provider";

export interface ProgressiveProfileDialogProps {
  open: boolean;
  onDismiss: () => void;
}

export function ProgressiveProfileDialog({ open, onDismiss }: ProgressiveProfileDialogProps) {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function persist(nameValue: string | null, emailValue: string | null) {
    setSaving(true);
    try {
      await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue, email: emailValue }),
      });
    } finally {
      setSaving(false);
      onDismiss();
    }
  }

  function handleSave() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    void persist(
      trimmedName.length > 0 ? trimmedName : null,
      trimmedEmail.length > 0 ? trimmedEmail : null,
    );
  }

  function handleSkip(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    void persist(null, null);
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
          <DialogTitle>{t.profile.title}</DialogTitle>
          <DialogDescription>{t.profile.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">{t.profile.name}</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.profile.namePlaceholder}
              disabled={saving}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-email">{t.profile.email}</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.profile.emailPlaceholder}
              disabled={saving}
            />
          </div>
        </div>
        <DialogFooter>
          <a
            href="#"
            onClick={handleSkip}
            aria-disabled={saving}
            className="flex min-h-11 items-center justify-center text-sm text-muted-foreground underline underline-offset-4 sm:justify-start"
          >
            {t.profile.skip}
          </a>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90"
          >
            {t.profile.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProgressiveProfileDialog;
