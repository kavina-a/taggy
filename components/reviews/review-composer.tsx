"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, XIcon } from "lucide-react";
import { updateReviewSchema } from "@/lib/validation/review.schema";
import { StarRatingInput } from "./star-rating-input";
import { Textarea } from "@/components/ui/textarea";
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

// react-hook-form's useFieldArray needs an array of OBJECTS (a stable `id`
// key per row), not a raw string[] — updateReviewSchema's `photos: string[]`
// (server-side truth) is reshaped to `{ url: string }[]` for the form only,
// then flattened back to string[] before the fetch payload is built.
const composerFormSchema = updateReviewSchema.omit({ photos: true }).extend({
  photos: z.array(z.object({ url: z.string().url() })).max(10).optional(),
});
type ComposerValues = z.infer<typeof composerFormSchema>;

// Mirrors lib/validation/review.schema.ts's real minimum, used here ONLY for
// the live character-count copy — zodResolver(updateReviewSchema) below is
// the single source of truth for actual validation, this constant never
// re-implements it.
const TEXT_MIN_LENGTH = 50;
const MAX_PHOTOS = 10;

export interface ExistingReviewForComposer {
  id: string;
  rating: number;
  text: string;
  photos: { url: string }[];
}

export interface ReviewComposerProps {
  businessId: string;
  existingReview: ExistingReviewForComposer | null;
}

function buildDefaultValues(existingReview: ExistingReviewForComposer | null): ComposerValues {
  return {
    rating: existingReview?.rating ?? 0,
    text: existingReview?.text ?? "",
    photos: existingReview?.photos.map((p) => ({ url: p.url })) ?? [],
  };
}

// REV-01/REV-02: rating first, then text (min length enforced), then
// optional photo URLs. Handles both create (POST /api/reviews) and edit
// (PATCH /api/reviews/[id]) through one form — an existing review starts
// collapsed behind an "Edit your review" affordance rather than always
// showing an open form the user already filled in once.
//
// spec 6.3 / REV-03's most important UI rule: the success path shows the
// SAME generic confirmation no matter what visibilityStatus the review was
// assigned server-side — this component never receives that field (see
// lib/reviews/author-review-response.ts) and must never try to infer it.
export function ReviewComposer({ businessId, existingReview }: ReviewComposerProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(existingReview === null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ComposerValues>({
    resolver: zodResolver(composerFormSchema),
    defaultValues: buildDefaultValues(existingReview),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "photos",
  });

  // Keep the form in sync after a parent Server Component refresh (e.g.
  // router.refresh() following a 409 race, or after our own successful
  // submit) brings back an updated/newly-created `existingReview` prop.
  useEffect(() => {
    form.reset(buildDefaultValues(existingReview));
    if (existingReview) {
      setExpanded(false);
    }
  }, [existingReview?.id, existingReview?.rating, existingReview?.text]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: ComposerValues) {
    setSubmitError(null);

    const cleanedPhotos = (values.photos ?? [])
      .map((p) => p.url.trim())
      .filter(Boolean);
    const payload = {
      rating: values.rating,
      text: values.text,
      photos: cleanedPhotos.length > 0 ? cleanedPhotos : undefined,
    };

    const isEdit = existingReview !== null;
    const endpoint = isEdit ? `/api/reviews/${existingReview.id}` : "/api/reviews";
    const method = isEdit ? "PATCH" : "POST";
    const body = isEdit ? payload : { ...payload, businessId };

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 409) {
      // Race: a review for this business already exists (e.g. submitted in
      // another tab since this page loaded). Refresh rather than dead-end —
      // the Server Component re-fetches and this composer receives the now-
      // real `existingReview`, switching itself into edit mode.
      setSubmitError("You've already reviewed this business — refreshing to show your review.");
      router.refresh();
      return;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      // MOD-01 hard-block or a validation failure — shown verbatim to the
      // author. NOT the secret REV-03 filter outcome (spec 6.3); MOD-01 is
      // a hard content block the author is always told about.
      setSubmitError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    // Identical confirmation regardless of the review's real (never
    // revealed) visibility_status — never branch this on `data`.
    setSubmitError(null);
    setSubmitted(true);
    router.refresh();
  }

  const textValue = form.watch("text") ?? "";

  if (existingReview && !expanded) {
    return (
      <div id="write-a-review" className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-4">
        <p className="text-base leading-normal text-foreground">
          {submitted ? "Thanks for your review!" : "You've reviewed this business."}
        </p>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-fit"
          onClick={() => {
            setExpanded(true);
            setSubmitted(false);
          }}
        >
          Edit your review
        </Button>
      </div>
    );
  }

  return (
    <div id="write-a-review" className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your rating</FormLabel>
                <FormControl>
                  <StarRatingInput
                    label="Your rating"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="review-text">Your review</FormLabel>
                <FormControl>
                  <Textarea
                    id="review-text"
                    aria-label="Your review"
                    placeholder="What did you like or dislike? What should other people know?"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <p className="text-sm leading-normal text-muted-foreground">
                  {textValue.length}/{TEXT_MIN_LENGTH} characters minimum
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm leading-normal font-medium">
              Photos <span className="text-muted-foreground">(optional)</span>
            </span>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  type="url"
                  placeholder="https://..."
                  aria-label={`Photo URL ${index + 1}`}
                  {...form.register(`photos.${index}.url` as const)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  aria-label="Remove photo"
                  onClick={() => remove(index)}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ))}
            {fields.length < MAX_PHOTOS && (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-fit gap-1.5"
                onClick={() => append({ url: "" })}
              >
                <PlusIcon className="size-4" />
                Add photo URL
              </Button>
            )}
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          {submitted && (
            <p className="text-sm font-medium text-status-open">Thanks for your review!</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
            >
              Submit review
            </Button>
            {existingReview && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() => setExpanded(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ReviewComposer;
