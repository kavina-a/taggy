"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export interface ClaimListingCardProps {
  businessSlug: string;
  currentUserId: string | null;
  isClaimed: boolean;
  isOwner: boolean;
}

export function ClaimListingCard({
  businessSlug,
  currentUserId,
  isClaimed,
  isOwner,
}: ClaimListingCardProps) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "otp">("idle");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (isOwner) {
    return (
      <p className="text-sm text-muted-foreground">You are the verified owner of this listing.</p>
    );
  }
  if (isClaimed) return null;

  if (currentUserId === null) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-4">
        <p className="text-base font-semibold">Own this business?</p>
        <p className="text-sm text-muted-foreground">
          Claim this listing by verifying the listed phone number.
        </p>
        <Button asChild className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90">
          <Link href="/login">Log in to claim</Link>
        </Button>
      </div>
    );
  }

  async function sendCode() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessSlug}/claim/send`, { method: "POST" });
      const data = (await res.json()) as { error?: string; devCode?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send a code.");
        return;
      }
      setDevCode(data.devCode);
      setStep("otp");
    } finally {
      setPending(false);
    }
  }

  async function verify() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/businesses/${businessSlug}/claim/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "That code didn't work.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-secondary/60 p-4">
      <p className="text-base font-semibold">Own this business?</p>
      <p className="text-sm text-muted-foreground">
        We will send a code to the listed phone number. Verifying it unlocks owner responses —
        no registration documents required.
      </p>
      {step === "idle" ? (
        <Button
          type="button"
          className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
          disabled={pending}
          onClick={sendCode}
        >
          Claim this listing
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm">Enter the 6-digit code sent to the listed number.</p>
          {devCode && (
            <p className="text-xs text-muted-foreground">Dev code: {devCode}</p>
          )}
          <InputOTP maxLength={6} value={code} onChange={setCode} autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            type="button"
            className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
            disabled={pending || code.length !== 6}
            onClick={verify}
          >
            Verify and claim
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default ClaimListingCard;
