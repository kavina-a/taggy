import Link from "next/link";
import { Smartphone, QrCode, Search, Star, MapPin, Camera, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Mobile App | LankaReview on iOS & Android",
  description: "Download the LankaReview app to search nearby restaurants, read verified local reviews, and get directions across Sri Lanka on the go.",
};

export default function MobilePage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 flex flex-col gap-14">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-[#D71616] border border-red-200 w-fit">
              <Smartphone className="size-4" />
              <span>LankaReview on the Go</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              Heading out? Bring LankaReview with you.
            </h1>

            <p className="text-base text-neutral-600 leading-relaxed">
              Find top-rated dining, check current opening hours, book tables, and call trusted auto repair garages anywhere in Sri Lanka—right from your pocket.
            </p>

            {/* Feature Bullets */}
            <ul className="flex flex-col gap-3 text-sm text-neutral-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-[#D71616] shrink-0" />
                <span>Instant GPS search for open businesses near your current location</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-[#D71616] shrink-0" />
                <span>Upload food photos and post reviews in seconds</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-[#D71616] shrink-0" />
                <span>Save your favorite local spots into private or shareable collections</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-[#D71616] shrink-0" />
                <span>One-tap calling and directions via Google Maps or Apple Maps</span>
              </li>
            </ul>

            {/* Badges / CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="rounded-xl bg-neutral-900 text-white px-5 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-neutral-800 transition-colors shadow-sm">
                <div className="text-xl font-bold"></div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-neutral-400">Download on the</span>
                  <span className="text-sm font-bold">App Store</span>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-900 text-white px-5 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-neutral-800 transition-colors shadow-sm">
                <div className="text-xl font-bold">▶</div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-neutral-400">GET IT ON</span>
                  <span className="text-sm font-bold">Google Play</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code and Device Frame Visual */}
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-neutral-200/90 shadow-md max-w-sm mx-auto text-center gap-5">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <QrCode className="size-40 text-neutral-900" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm text-neutral-900">Scan to Open LankaReview</span>
              <span className="text-xs text-neutral-500">
                Point your phone camera at the QR code to experience our fast mobile web app instantly.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
