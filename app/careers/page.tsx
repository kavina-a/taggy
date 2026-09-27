import Link from "next/link";
import { Briefcase, Users, Heart, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Careers at LankaReview | Join Our Engineering & Product Team",
  description: "Explore careers at LankaReview. Build the future of local commerce, search, and community trust in Sri Lanka.",
};

export default function CareersPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        <header className="flex flex-col gap-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
            <Briefcase className="size-4" />
            <span>Work With Us</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            Build the future of local discovery in Sri Lanka.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600">
            Join a passionate team in Colombo engineering high-performance search, real-time mapping, and community-driven trust.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <h2 className="text-base font-bold text-neutral-900">Be Tenacious</h2>
            <p className="text-sm text-neutral-600">We solve complex local challenges with speed, high standards, and deep technical ownership.</p>
          </Card>
          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <h2 className="text-base font-bold text-neutral-900">Protect the Source</h2>
            <p className="text-sm text-neutral-600">Consumer trust is sacred. We defend honest reviews, independent ratings, and authenticity.</p>
          </Card>
          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-3">
            <h2 className="text-base font-bold text-neutral-900">Play Well Together</h2>
            <p className="text-sm text-neutral-600">A humble, collaborative environment where every engineer and designer makes an outsized impact.</p>
          </Card>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900">Open Roles in Colombo &amp; Remote</h2>
          <div className="flex flex-col gap-3">
            {[
              { title: "Senior Full-Stack Engineer (Next.js / PostgreSQL)", dept: "Engineering", loc: "Colombo / Hybrid" },
              { title: "Community & Trust Moderation Lead", dept: "Operations", loc: "Colombo" },
              { title: "Product Designer (Design Systems & Mobile UX)", dept: "Design", loc: "Remote (Sri Lanka)" },
            ].map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all shadow-2xs">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-base text-neutral-900 hover:text-[#D71616] cursor-pointer transition-colors">
                    {job.title}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {job.dept} &middot; {job.loc}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="rounded-full text-xs font-bold gap-1">
                  <span>Apply Now</span>
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
