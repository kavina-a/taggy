import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | LankaReview",
  description: "Privacy policy detailing how LankaReview collects, uses, and protects personal data and cookies in Sri Lanka.",
};

export default function PrivacyPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 flex flex-col gap-8 bg-white p-8 md:p-12 rounded-xl border border-neutral-200 shadow-xs">
        <header className="flex flex-col gap-2 pb-6 border-b border-neutral-200">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <ShieldCheck className="size-4" />
            <span>Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500">
            Last Updated: September 2026 &middot; Compliant with Sri Lanka Personal Data Protection Act (PDPA)
          </p>
        </header>

        <div className="prose prose-neutral max-w-none text-sm leading-relaxed text-neutral-700 flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including your mobile phone number for authentication, your display name, optional profile city, review text, uploaded business photos, and business ownership claims.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">2. How We Use Your Information</h2>
            <p>
              Your information is used to authenticate your session, publish your community reviews and photos, enable business owners to respond, provide location-relevant search results, and protect our platform against automated spam and fraud.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">3. We Do Not Sell Your Personal Data</h2>
            <p>
              LankaReview does not sell, rent, or trade your personal contact details (such as your phone number or email) to third-party advertisers or telemarketers.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">4. Location Information</h2>
            <p>
              When you search with location access enabled, we use your device&apos;s approximate GPS coordinates solely to calculate distances to nearby businesses and order local search results. We do not track your location in the background when the app is closed.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">5. Contact Our Data Protection Officer</h2>
            <p>
              For inquiries regarding data access, deletion requests, or our privacy practices, contact us at privacy@lankareview.lk.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
