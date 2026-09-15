"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneEntryForm } from "@/components/auth/phone-entry-form";
import { OtpEntryForm, type OtpUser } from "@/components/auth/otp-entry-form";
import { ProgressiveProfileDialog } from "@/components/auth/progressive-profile-dialog";

type Step =
  | { name: "phone" }
  | { name: "otp"; phone: string; devCode?: string };

// D-05 / UI-SPEC "Guest-first framing" — this route is reachable only via an
// explicit "Log in" click (wired in 02-06's header); nothing in the app
// auto-redirects here or blocks rendering behind an auth check.
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "phone" });
  const [profileUser, setProfileUser] = useState<OtpUser | null>(null);

  function handleSent(phone: string, devCode?: string) {
    setStep({ name: "otp", phone, devCode });
  }

  function handleVerified(user: OtpUser) {
    if (!user.hasSeenProfilePrompt) {
      setProfileUser(user);
      return;
    }
    // router.refresh() re-fetches the Server Component tree (including
    // app/layout.tsx's session-aware header) so it reflects the just-issued
    // session cookie — router.push() alone can reuse Next's client-side
    // Router Cache for a previously-visited "/" and keep showing the guest
    // "Log in" CTA after a successful login.
    router.push("/");
    router.refresh();
  }

  function handleProfileDismiss() {
    setProfileUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-12">
      {step.name === "phone" && <PhoneEntryForm onSent={handleSent} />}
      {step.name === "otp" && (
        <OtpEntryForm phone={step.phone} devCode={step.devCode} onVerified={handleVerified} />
      )}
      {profileUser && (
        <ProgressiveProfileDialog open onDismiss={handleProfileDismiss} />
      )}
    </div>
  );
}
