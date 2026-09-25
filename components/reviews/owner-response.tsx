"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ownerResponseSchema, type OwnerResponseInput } from "@/lib/validation/owner-response.schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function OwnerResponseBlock({
  text,
  editedAt,
}: {
  text: string;
  editedAt: string | null;
}) {
  return (
    <div className="rounded-md border-l-2 border-brand-accent bg-secondary/60 px-3 py-2">
      <p className="text-sm font-semibold">Response from the owner</p>
      {editedAt && <p className="text-xs text-muted-foreground">Edited</p>}
      <p className="mt-1 text-sm leading-normal">{text}</p>
    </div>
  );
}

export function OwnerResponseComposer({
  reviewId,
  existingText,
}: {
  reviewId: string;
  existingText: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<OwnerResponseInput>({
    resolver: zodResolver(ownerResponseSchema),
    defaultValues: { text: existingText ?? "" },
  });

  async function onSubmit(values: OwnerResponseInput) {
    setError(null);
    const isEdit = existingText !== null;
    const res = await fetch(`/api/reviews/${reviewId}/owner-response`, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError("Your response could not be published.");
      return;
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response from the owner</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
          disabled={form.formState.isSubmitting}
        >
          {existingText ? "Update response" : "Post response"}
        </Button>
      </form>
    </Form>
  );
}
