"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, XIcon } from "lucide-react";
import { updateReviewSchema } from "@/lib/validation/review.schema";
import { photoUrlSchema } from "@/lib/validation/photo-upload.schema";
import { StarRatingInput } from "./star-rating-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useT } from "@/components/i18n/i18n-provider";

const composerFormSchema = updateReviewSchema.omit({ photos: true }).extend({
  photos: z.array(z.object({ url: photoUrlSchema })).max(10).optional(),
});
type ComposerValues = z.infer<typeof composerFormSchema>;

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

export function ReviewComposer({ businessId, existingReview }: ReviewComposerProps) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(existingReview === null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ComposerValues>({
    resolver: zodResolver(composerFormSchema),
    defaultValues: buildDefaultValues(existingReview),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "photos",
  });

  useEffect(() => {
    form.reset(buildDefaultValues(existingReview));
    if (existingReview) {
      setExpanded(false);
    }
  }, [existingReview?.id, existingReview?.rating, existingReview?.text]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_PHOTOS - fields.length;
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) return;

    setUploading(true);
    setSubmitError(null);
    try {
      for (const file of files) {
        const body = new FormData();
        body.set("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body });
        const data = (await res.json().catch(() => null)) as
          | { url?: string; error?: string }
          | null;
        if (!res.ok || !data?.url) {
          setSubmitError(data?.error ?? "This photo couldn't be published.");
          break;
        }
        append({ url: data.url });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
      setSubmitError("You've already reviewed this business — refreshing to show your review.");
      router.refresh();
      return;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setSubmitError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitError(null);
    setSubmitted(true);
    router.refresh();
  }

  const textValue = form.watch("text") ?? "";

  if (existingReview && !expanded) {
    return (
      <div id="write-a-review" className="flex flex-col gap-2 rounded-lg bg-secondary/60 p-4">
        <p className="text-base leading-normal text-foreground">
          {submitted ? t.review.thanks : t.review.alreadyReviewed}
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
          {t.review.edit}
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
                <FormLabel>{t.review.yourRating}</FormLabel>
                <FormControl>
                  <StarRatingInput
                    label={t.review.yourRating}
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
                <FormLabel htmlFor="review-text">{t.review.yourReview}</FormLabel>
                <FormControl>
                  <Textarea
                    id="review-text"
                    aria-label={t.review.yourReview}
                    placeholder="What did you like or dislike? What should other people know?"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <p className="text-sm leading-normal text-muted-foreground">
                  {textValue.length}/{TEXT_MIN_LENGTH} {t.review.minChars}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm leading-normal font-medium">{t.review.photosOptional}</span>
            <div className="flex flex-wrap gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="relative size-20 overflow-hidden rounded-md bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={field.url} alt="" className="size-full object-cover" />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-0 right-0 min-h-8 min-w-8 bg-background/80 p-0"
                    aria-label={t.review.removePhoto}
                    onClick={() => remove(index)}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            {fields.length < MAX_PHOTOS && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  aria-label={t.review.addPhotos}
                  onChange={(event) => void onFilesSelected(event.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-fit gap-1.5"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PlusIcon className="size-4" />
                  {uploading ? t.review.uploading : t.review.addPhotos}
                </Button>
              </>
            )}
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          {submitted && (
            <p className="text-sm font-medium text-status-open">{t.review.thanks}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || uploading}
              className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
            >
              {t.review.submit}
            </Button>
            {existingReview && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() => setExpanded(false)}
              >
                {t.review.cancel}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ReviewComposer;
