"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createListingSchema } from "@/lib/validation/create-listing.schema";
import { categoryTaxonomy } from "@/lib/categories/category-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const listingFormSchema = createListingSchema.omit({ code: true });
type ListingFormValues = z.infer<typeof listingFormSchema>;

export function CreateListingForm() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: "",
      description: "",
      primaryCategories: ["restaurant"],
      secondaryCategories: [],
      district: "Colombo 07",
      addressFreeText: "",
      latitude: 6.9271,
      longitude: 79.8612,
      phone: "",
    },
  });

  async function sendOtp(values: ListingFormValues) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/listings/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone }),
      });
      const data = (await res.json()) as { error?: string; phone?: string; devCode?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send a code.");
        return;
      }
      setNormalizedPhone(data.phone ?? values.phone);
      setDevCode(data.devCode);
      setStep("otp");
    } finally {
      setPending(false);
    }
  }

  async function createListing() {
    setPending(true);
    setError(null);
    try {
      const values = form.getValues();
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          phone: normalizedPhone ?? values.phone,
          code,
        }),
      });
      const data = (await res.json()) as { error?: string; slug?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create the listing.");
        return;
      }
      router.push(`/business/${data.slug}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-[28px] leading-[1.2] font-semibold">Verify the listed number</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we sent to {normalizedPhone}. That proves you control the
          number and claims the new listing.
        </p>
        {devCode && <p className="text-xs text-muted-foreground">Dev code: {devCode}</p>}
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="button"
          className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
          disabled={pending || code.length !== 6}
          onClick={createListing}
        >
          Verify and create listing
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(sendOtp)} className="flex flex-col gap-4">
        <h1 className="text-[28px] leading-[1.2] font-semibold">Add a business</h1>
        <p className="text-sm text-muted-foreground">
          Create a listing and claim it by verifying the phone number. No registration
          documents required.
        </p>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="primaryCategories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary category</FormLabel>
              <FormControl>
                <select
                  className="min-h-11 rounded-md border border-input bg-transparent px-2.5"
                  value={field.value[0]}
                  onChange={(e) => field.onChange([e.target.value])}
                >
                  {categoryTaxonomy.flatMap((group) =>
                    group.categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {group.groupLabel} — {category.label}
                      </option>
                    )),
                  )}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressFreeText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0771234567" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="min-h-11 w-fit bg-brand-accent text-white hover:bg-brand-accent/90"
          disabled={pending}
        >
          Send verification code
        </Button>
      </form>
    </Form>
  );
}

export default CreateListingForm;
