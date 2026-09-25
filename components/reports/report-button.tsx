"use client";

import { useState } from "react";
import Link from "next/link";
import { FlagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CreateReportInput } from "@/lib/validation/report.schema";

const REASONS: { value: CreateReportInput["reason"]; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive" },
  { value: "misleading", label: "Misleading" },
  { value: "not_relevant", label: "Not relevant" },
  { value: "other", label: "Other" },
];

export interface ReportButtonProps {
  targetType: CreateReportInput["targetType"];
  targetId: string;
  currentUserId: string | null;
  label?: string;
}

export function ReportButton({
  targetType,
  targetId,
  currentUserId,
  label = "Report",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CreateReportInput["reason"]>("spam");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentUserId === null) {
    return (
      <Button asChild variant="ghost" className="min-h-11 text-muted-foreground">
        <Link href="/login">
          <FlagIcon className="size-4" />
          {label}
        </Link>
      </Button>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSubmitted(false);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" className="min-h-11 text-muted-foreground">
          <FlagIcon className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>
            Tell us why this should be reviewed. You will get a confirmation only —
            we do not share the outcome.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <p className="text-base leading-normal">Thanks. We received your report.</p>
        ) : (
          <>
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Reason</legend>
              {REASONS.map((option) => (
                <label key={option.value} className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`report-reason-${targetId}`}
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                className="min-h-11 bg-brand-accent text-white hover:bg-brand-accent/90"
                disabled={submitting}
                onClick={handleSubmit}
              >
                Submit report
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReportButton;
