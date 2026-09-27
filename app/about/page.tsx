import Link from "next/link";
import { Star, ShieldCheck, Users, HeartHandshake, Building2, MapPin, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About LankaReview | Sri Lanka's Local Business Community",
  description: "Learn how LankaReview connects millions of locals and travelers with great businesses, verified reviews, and honest recommendations in Sri Lanka.",
};

export default function AboutPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-[#D71616] border border-red-200">
            <Award className="size-4" />
            <span>Our Mission</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Connecting people with great local businesses across Sri Lanka.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            LankaReview is Sri Lanka&apos;s trusted platform for discovering authentic restaurants, reliable home technicians, expert vehicle workshops, and hidden island treasures through genuine local feedback.
          </p>
        </section>

        {/* 4 Key Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs">
            <div className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-[#D71616]">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Unbiased, Authentic Reviews</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Every review on LankaReview comes from real customers who experienced the service firsthand. We never allow businesses to pay to remove or alter ratings.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs">
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Empowering Local Entrepreneurs</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              From historic family-run kades to modern boutique stays, we give every Sri Lankan business owner a digital storefront to connect with nearby clients.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs">
            <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Vibrant Island Community</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Our active community of passionate foodies, explorers, and neighborhood residents continuously contribute photos, helpful tips, and Q&amp;A insights.
            </p>
          </div>
        </section>

        {/* Key Platform Stats */}
        <section className="rounded-2xl bg-neutral-900 text-white p-8 md:p-12 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-[#D71616]">100+</span>
              <span className="text-xs md:text-sm text-neutral-300 font-medium">Curated Local Listings</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-white">25</span>
              <span className="text-xs md:text-sm text-neutral-300 font-medium">Sri Lankan Districts</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-[#D71616]">100%</span>
              <span className="text-xs md:text-sm text-neutral-300 font-medium">Zero-Paid Manipulation</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-white">24/7</span>
              <span className="text-xs md:text-sm text-neutral-300 font-medium">Community Access</span>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-xs">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <h3 className="text-xl font-bold text-neutral-900">Are you a business owner in Sri Lanka?</h3>
            <p className="text-sm text-neutral-600">
              Claim your listing for free, update opening hours, upload photos, and connect with customers.
            </p>
          </div>
          <Button asChild className="bg-[#D71616] hover:bg-[#B80F0F] text-white rounded-full px-7 font-bold shadow-md shrink-0">
            <Link href="/claim">Claim Your Business</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
