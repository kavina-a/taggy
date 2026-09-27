import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-[#F7F7F7] text-[#2D2E2F] pt-14 pb-12 mt-auto">
      <div className="mx-auto max-w-[1600px] px-6 xl:px-8">
        {/* 5 Columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
          {/* Column 1: About */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#2D2E2F] uppercase tracking-wider">
              About
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#6E7072]">
              <li>
                <Link href="/about" className="hover:text-[#2D2E2F] hover:underline">
                  About LankaReview
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-[#2D2E2F] hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-[#2D2E2F] hover:underline">
                  Press & Media
                </Link>
              </li>
              <li>
                <Link href="/trust" className="hover:text-[#2D2E2F] hover:underline">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-[#2D2E2F] hover:underline">
                  Content Guidelines
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#2D2E2F] hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#2D2E2F] hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Discover */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#2D2E2F] uppercase tracking-wider">
              Discover
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#6E7072]">
              <li>
                <Link href="/collections" className="hover:text-[#2D2E2F] hover:underline">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/costs" className="hover:text-[#2D2E2F] hover:underline">
                  Cost Guides &amp; Pricing
                </Link>
              </li>
              <li>
                <Link href="/talk" className="hover:text-[#2D2E2F] hover:underline">
                  Community Talk
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#2D2E2F] hover:underline">
                  Local Events
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-[#2D2E2F] hover:underline">
                  Business Directory
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#2D2E2F] hover:underline">
                  Support & FAQ
                </Link>
              </li>
              <li>
                <Link href="/mobile" className="hover:text-[#2D2E2F] hover:underline">
                  Mobile Apps
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: LankaReview for Business */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#2D2E2F] uppercase tracking-wider">
              LankaReview for Business
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#6E7072]">
              <li>
                <Link href="/login" className="hover:text-[#2D2E2F] hover:underline">
                  Business Owner Login
                </Link>
              </li>
              <li>
                <Link href="/businesses/new" className="hover:text-[#2D2E2F] hover:underline">
                  Add Your Business
                </Link>
              </li>
              <li>
                <Link href="/claim" className="hover:text-[#2D2E2F] hover:underline">
                  Claim your Business Page
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-[#2D2E2F] hover:underline">
                  Advertise on LankaReview
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#2D2E2F] hover:underline">
                  Business Resources
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[#2D2E2F] hover:underline">
                  Business Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Popular in Sri Lanka */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#2D2E2F] uppercase tracking-wider">
              Popular in Sri Lanka
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[#6E7072]">
              <li>
                <Link href="/search?category=restaurant" className="hover:text-[#2D2E2F] hover:underline">
                  Colombo Restaurants
                </Link>
              </li>
              <li>
                <Link href="/search?category=tuk-repair" className="hover:text-[#2D2E2F] hover:underline">
                  Three-Wheeler Repair
                </Link>
              </li>
              <li>
                <Link href="/search?find_desc=AC+Repair" className="hover:text-[#2D2E2F] hover:underline">
                  AC Repair Colombo
                </Link>
              </li>
              <li>
                <Link href="/search?category=beauty-spa" className="hover:text-[#2D2E2F] hover:underline">
                  Ayurveda & Day Spas
                </Link>
              </li>
              <li>
                <Link href="/search?category=wedding-vendors" className="hover:text-[#2D2E2F] hover:underline">
                  Wedding & Event Vendors
                </Link>
              </li>
              <li>
                <Link href="/search?category=tutoring" className="hover:text-[#2D2E2F] hover:underline">
                  Tuition & Classes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Cities & Languages */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#2D2E2F] uppercase tracking-wider">
              Cities & Languages
            </h3>
            <div className="flex flex-col gap-2 text-sm text-[#6E7072]">
              <span className="font-semibold text-xs text-neutral-400 uppercase">Major Cities</span>
              <ul className="flex flex-col gap-1.5">
                <li>
                  <Link href="/search?find_loc=Colombo" className="hover:text-[#2D2E2F] hover:underline">
                    Colombo
                  </Link>
                </li>
                <li>
                  <Link href="/search?find_loc=Kandy" className="hover:text-[#2D2E2F] hover:underline">
                    Kandy
                  </Link>
                </li>
                <li>
                  <Link href="/search?find_loc=Galle" className="hover:text-[#2D2E2F] hover:underline">
                    Galle
                  </Link>
                </li>
                <li>
                  <Link href="/search?find_loc=Negombo" className="hover:text-[#2D2E2F] hover:underline">
                    Negombo
                  </Link>
                </li>
              </ul>
              <span className="font-semibold text-xs text-neutral-400 uppercase mt-2">Languages</span>
              <p className="text-xs text-neutral-500">
                English · සිංහල · தமிழ்
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E7072]">
          <p>
            Copyright © 2026 LankaReview Inc. LankaReview, the LankaReview logo, and related marks are registered trademarks.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="hover:underline">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
