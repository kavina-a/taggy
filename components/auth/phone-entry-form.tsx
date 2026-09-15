"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { sendOtpSchema } from "@/lib/otp/otp.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type PhoneEntryValues = z.infer<typeof sendOtpSchema>;

export interface PhoneEntryFormProps {
  onSent: (phone: string, devCode?: string) => void;
}

// Screen 3 Step 1 (02-UI-SPEC.md) — phone entry. Client-side validation via
// zodResolver(sendOtpSchema) is a UX convenience only; the send route
// independently re-validates and E.164-normalizes the phone server-side.
export function PhoneEntryForm({ onSent }: PhoneEntryFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<PhoneEntryValues>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phone: "" },
  });

  async function onSubmit(values: PhoneEntryValues) {
    setSubmitError(null);
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setSubmitError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    onSent(values.phone, data.devCode);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-medium">Log in or sign up</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll text you a code to verify your number.
          </p>
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+94 7X XXX XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90"
        >
          Send code
        </Button>
      </form>
    </Form>
  );
}

export default PhoneEntryForm;
