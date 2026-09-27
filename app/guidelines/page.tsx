import Link from "next/link";
import { FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Content Guidelines | LankaReview",
  description: "Read our community standards and content guidelines for reviews, photos, business listings, and user interactions on LankaReview.",
};

export default function GuidelinesPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <FileText className="size-4" />
            <span>Community Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            LankaReview Content Guidelines
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Our guidelines help ensure that LankaReview remains a helpful, trustworthy, and respectful resource for everyone in Sri Lanka.
          </p>
        </header>

        {/* Guidelines Sections */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>1. Relevance &amp; Firsthand Experience</span>
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Your review should recount your personal experience as a customer. Explain what you ordered, how you were served, the cleanliness of the venue, or the quality of the repair. Avoid political commentary, generalized rants, or disputes unrelated to the actual service provided.
            </p>
          </Card>

          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <XCircle className="size-5 text-red-600 shrink-0" />
              <span>2. No Conflicts of Interest</span>
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              You should not review your own business, your employer&apos;s business, or a competitor&apos;s business. Businesses may not offer incentives (discounts, free meals, gifts, or payments) in exchange for writing, editing, or deleting reviews.
            </p>
          </Card>

          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-600 shrink-0" />
              <span>3. Respect &amp; Privacy</span>
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Do not post private personal information (personal phone numbers, private home addresses, or full government ID numbers) of staff or other patrons. Profanity, hate speech, harassment, threats, and discrimination based on race, religion, gender, or orientation are strictly prohibited.
            </p>
          </Card>

          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span>4. Photo &amp; Video Quality</span>
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Photos should be clear, authentic, and taken at the actual business premises (food dishes, storefront, interior ambiance, menus, or completed workmanship). Please do not upload stock photos, logos with promotional watermarks, or irrelevant imagery.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
