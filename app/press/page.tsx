import Link from "next/link";
import { Newspaper, Mail, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Press & Newsroom | LankaReview",
  description: "Official news, press releases, media assets, and research reports about Sri Lanka's local business economy from LankaReview.",
};

export default function PressPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        <header className="flex flex-col gap-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <Newspaper className="size-4" />
            <span>Newsroom</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            LankaReview News &amp; Media
          </h1>
          <p className="text-base sm:text-lg text-neutral-600">
            Official announcements, quarterly local business trends, and press inquiries.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900">Recent Press Releases</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                date: "September 15, 2026",
                title: "LankaReview Expands Across 25 Districts in Sri Lanka With Over 100+ Verified Businesses",
                summary: "Platform introduces enterprise-grade search, verified opening hours, and automated review authenticity checks to support Sri Lanka's growing tourism and local dining sector.",
              },
              {
                date: "August 20, 2026",
                title: "Annual Sri Lanka Local Dining Economic Report: Seafood and Artisan Coffee Lead Growth",
                summary: "Analysis of review traffic reveals surging consumer interest in authentic local hoppers, fresh seafood dining, and sustainable agricultural cafes.",
              },
              {
                date: "July 02, 2026",
                title: "LankaReview Launches Free Digital Tools for Sri Lankan Three-Wheeler and Auto Repair Workshops",
                summary: "New mobile verification empowers local mechanics to display service capabilities, certified trade specializations, and direct client call links.",
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all shadow-xs flex flex-col gap-2">
                <span className="text-xs font-semibold text-[#D71616]">{item.date}</span>
                <h3 className="text-lg font-bold text-neutral-900 hover:text-[#D71616] cursor-pointer transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {item.summary}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-neutral-900">Press &amp; Media Inquiries</h3>
            <p className="text-sm text-neutral-600">
              For journalist questions, interview requests, and platform statistics, contact our media team.
            </p>
          </div>
          <Button asChild className="bg-[#D71616] hover:bg-[#B80F0F] text-white rounded-full px-6 font-bold shadow-sm shrink-0 gap-2">
            <Link href="mailto:press@lankareview.lk">
              <Mail className="size-4" />
              <span>press@lankareview.lk</span>
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
