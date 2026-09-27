import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | LankaReview",
  description: "Terms and conditions governing the use of LankaReview's local business directory, review submission, and business account management.",
};

export default function TermsPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 flex flex-col gap-8 bg-white p-8 md:p-12 rounded-xl border border-neutral-200 shadow-xs">
        <header className="flex flex-col gap-2 pb-6 border-b border-neutral-200">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <FileText className="size-4" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Terms of Service
          </h1>
          <p className="text-xs text-neutral-500">
            Last Updated: September 2026 &middot; Effective Date: September 2026
          </p>
        </header>

        <div className="prose prose-neutral max-w-none text-sm leading-relaxed text-neutral-700 flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using LankaReview (accessible at lankareview.lk or via mobile web application), you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must not access or use our services.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">2. User Accounts and Verification</h2>
            <p>
              You must provide accurate information when registering for an account. LankaReview uses phone number OTP verification to ensure security and prevent account spoofing. You are solely responsible for maintaining the confidentiality of your credentials.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">3. User Content &amp; Reviews</h2>
            <p>
              You retain ownership of any text, photos, or reviews you submit to LankaReview. By submitting content, you grant LankaReview a perpetual, irrevocable, worldwide, non-exclusive license to publish, display, format, and distribute the content in connection with our services.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">4. Prohibited Conduct</h2>
            <p>
              Users agree not to: (a) submit fake, deceptive, or paid reviews; (b) harass, threaten, or defame any individual or business; (c) post confidential personal data; or (d) attempt to scrape or reverse engineer our recommendation software without express authorization.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-neutral-900">5. Business Claiming &amp; Listing Management</h2>
            <p>
              Authorized representatives of a business may claim their listing upon completing phone verification. Claimed owners may update operating hours and post owner responses, but may not manipulate or pay to suppress legitimate user reviews.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
