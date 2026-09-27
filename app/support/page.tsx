import Link from "next/link";
import { HelpCircle, Search, Mail, MessageSquare, Phone, Building2, User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Support Center & FAQ | LankaReview",
  description: "Find answers to frequently asked questions about writing reviews, managing business listings, claiming pages, and account support on LankaReview.",
};

const CONSUMER_FAQS = [
  {
    q: "How do I write a review on LankaReview?",
    a: "Search for the business name or browse our directory, open the business page, and tap 'Write a Review'. Select your 1 to 5 star rating, write your honest firsthand feedback (at least 85 characters), upload photos if available, and submit.",
  },
  {
    q: "Why isn't my review appearing immediately?",
    a: "All reviews pass through our automated quality recommendation software to verify authenticity and prevent spam. Most reviews display immediately, but some may take a short time to complete processing.",
  },
  {
    q: "Can I edit or delete my review later?",
    a: "Yes. Log into your LankaReview account using your registered phone number, visit the business listing or your profile, and click 'Edit' on your review to make updates.",
  },
  {
    q: "How do I report an inaccurate or inappropriate review?",
    a: "Click the flag/report icon next to any review or photo, select the appropriate reason (spam, offensive, misleading, conflict of interest), and our moderation team will investigate.",
  },
];

const BUSINESS_FAQS = [
  {
    q: "How do I claim my business listing on LankaReview?",
    a: "Navigate to 'LankaReview for Business' in the navigation bar or visit /claim. Search for your business name, verify control of your listed business phone via SMS OTP, and gain full management access.",
  },
  {
    q: "Is it free to list my business on LankaReview?",
    a: "Yes! Creating, claiming, and managing a standard business profile—including operating hours, address, contact details, photos, and owner replies—is 100% free.",
  },
  {
    q: "Can I pay LankaReview to remove negative reviews?",
    a: "No. LankaReview strictly prohibits any business from paying to delete, hide, or alter reviews. You can, however, post a polite public owner response to clarify situations or resolve customer concerns.",
  },
  {
    q: "How can I update my opening hours or holiday overrides?",
    a: "Once you have claimed your business listing, log in to your business dashboard to set your regular Monday–Sunday hours as well as specific holiday overrides.",
  },
];

export default function SupportPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-[#D71616] border border-red-200">
            <HelpCircle className="size-4" />
            <span>Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            How can we help you?
          </h1>
          <p className="text-base text-neutral-600">
            Search our knowledge base or browse answers for consumers and business owners.
          </p>
        </header>

        {/* 2 Main Support Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <User className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">For Consumers</h2>
                <span className="text-xs text-neutral-500">Reviews, photos, search &amp; community</span>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {CONSUMER_FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`consumer-${i}`}>
                  <AccordionTrigger className="text-sm font-semibold text-neutral-800 text-left hover:text-[#D71616]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <Card className="rounded-xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-red-50 text-[#D71616]">
                <Building2 className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">For Business Owners</h2>
                <span className="text-xs text-neutral-500">Claiming, verification &amp; profile management</span>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {BUSINESS_FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`business-${i}`}>
                  <AccordionTrigger className="text-sm font-semibold text-neutral-800 text-left hover:text-[#D71616]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>

        {/* Contact Us Card */}
        <section className="rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-bold text-neutral-900">Still have questions?</h3>
            <p className="text-sm text-neutral-600">
              Our Colombo-based support team is here to help with listings, moderation queries, and technical assistance.
            </p>
          </div>
          <Button asChild className="bg-[#D71616] hover:bg-[#B80F0F] text-white rounded-full px-6 font-bold shadow-sm shrink-0 gap-2">
            <Link href="mailto:support@lankareview.lk">
              <Mail className="size-4" />
              <span>Contact Support</span>
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
