import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Eye, ShieldAlert, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Trust & Safety | LankaReview",
  description: "Learn how LankaReview protects consumers with automated recommendation software, human moderation, and zero paid review manipulation.",
};

export default function TrustPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Header */}
        <header className="flex flex-col gap-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <ShieldCheck className="size-4 text-[#D71616]" />
            <span>Integrity &amp; Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            Earning your trust. Every single day.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Trust is the foundation of LankaReview. We protect our community with automated recommendation algorithms, human moderation, and transparent consumer alert policies.
          </p>
        </header>

        {/* 3 Core Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-[#D71616]">
              <Lock className="size-5" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Zero Paid Alterations</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              No business can pay to add, remove, reorder, or alter a review or rating on LankaReview. Our recommendation logic applies equally to every business.
            </p>
          </Card>

          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Eye className="size-5" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Recommendation Software</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Our automated system evaluates review quality, recency, and user credibility. Reviews deemed helpful and authentic are highlighted prominently.
            </p>
          </Card>

          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="size-5" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Consumer Alerts</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              When we detect suspicious review rings, extortion attempts, or severe health and safety violations, we place prominent public alerts on the listing.
            </p>
          </Card>
        </div>

        {/* Detailed Guidelines Section */}
        <section className="flex flex-col gap-6 rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-neutral-900">
            How we protect review authenticity in Sri Lanka
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-neutral-700">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Verified Firsthand Experiences</span>
              </div>
              <p className="text-neutral-600 pl-6 leading-relaxed">
                Reviews must reflect genuine personal experiences with the business, not secondhand gossip, rumors, or unverified social media commentary.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Strict Conflict-of-Interest Rules</span>
              </div>
              <p className="text-neutral-600 pl-6 leading-relaxed">
                Business owners, family members, competitors, and paid promoters are strictly prohibited from reviewing businesses with which they have ties.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Community Reporting Tools</span>
              </div>
              <p className="text-neutral-600 pl-6 leading-relaxed">
                Every review and photo has a report button allowing any user to flag suspicious content. Our dedicated moderation team reviews flagged items 24/7.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Verified Listing Ownership</span>
              </div>
              <p className="text-neutral-600 pl-6 leading-relaxed">
                Owners must complete multi-factor verification before managing their business profile, ensuring only genuine owners can update operating hours.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
