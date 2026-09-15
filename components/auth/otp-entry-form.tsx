"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { verifyOtpSchema } from "@/lib/otp/otp.schema";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

type VerifyValues = z.infer<typeof verifyOtpSchema>;

export interface OtpUser {
  id: string;
  name: string | null;
  hasSeenProfilePrompt: boolean;
}

export interface OtpEntryFormProps {
  phone: string;
  devCode?: string;
  onVerified: (user: OtpUser) => void;
}

// UI-SPEC Copywriting Contract — exact wrong-code copy, never a raw server
// error string, and the resend cooldown window (30s, matches T-02-07's
// dev-mode transport being the only reason to spam-tap resend).
const WRONG_CODE_COPY = "That code didn't work. Check it and try again.";
const RESEND_COOLDOWN_SECONDS = 30;

function formatCooldown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `Resend code in ${m}:${String(s).padStart(2, "0")}`;
}

// Screen 3 Step 2 (02-UI-SPEC.md) — OTP entry. A resend re-calls the same
// send endpoint (dev-stub transport, D-03) and restarts the cooldown.
export function OtpEntryForm({ phone, devCode, onVerified }: OtpEntryFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentDevCode, setCurrentDevCode] = useState(devCode);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    setCurrentDevCode(devCode);
  }, [devCode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const form = useForm<VerifyValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone, code: "" },
  });

  const codeValue = form.watch("code");

  async function onSubmit(values: VerifyValues) {
    setSubmitError(null);
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setSubmitError(WRONG_CODE_COPY);
      return;
    }
    const data = await res.json();
    onVerified(data.user);
  }

  async function handleResend() {
    if (cooldown > 0) return;
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentDevCode(data.devCode);
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-medium">Enter the code</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we sent to {phone}.
          </p>
        </div>
        {currentDevCode && (
          <p className="text-xs text-muted-foreground">
            (dev mode) Your code: {currentDevCode}
          </p>
        )}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={field.value}
                  onChange={field.onChange}
                >
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        <Button
          type="submit"
          disabled={codeValue?.length !== 6 || form.formState.isSubmitting}
          className="min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90"
        >
          Verify
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="min-h-11 text-sm text-muted-foreground underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0 ? formatCooldown(cooldown) : "Resend code"}
        </button>
      </form>
    </Form>
  );
}

export default OtpEntryForm;
