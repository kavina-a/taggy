"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSlide {
  id: string;
  category: string;
  headline: string;
  subtitle: string;
  ctaText: string;
  businessName: string;
  businessLocation: string;
  categoryHref: string;
  imageUrl: string;
  fallbackGradient: string;
}

// Covers all core sectors across LankaReview (Restaurants, Auto Repair, Home Services,
// Beauty & Spas, Hotels & Stays, Nightlife & Bars, Shopping, Weddings & Events, Cafes & Tea)
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "restaurants",
    category: "Restaurants",
    headline: "Craving something delicious?",
    subtitle: "Find the best restaurants, spicy kottu, fresh seafood, and authentic dining in Colombo.",
    ctaText: "Explore Colombo Restaurants",
    businessName: "Ministry of Crab",
    businessLocation: "Old Dutch Hospital, Colombo 01",
    categoryHref: "/search?category=restaurant",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-amber-950 via-neutral-900 to-black",
  },
  {
    id: "auto",
    category: "Auto Repair",
    headline: "Need a mechanic or tuk repair?",
    subtitle: "Connect with verified auto garages, tyre specialists, and trusted roadside assistance.",
    ctaText: "Find Auto Repair Specialists",
    businessName: "AutoMiraj Grand Workshop",
    businessLocation: "Havelock Town, Colombo 05",
    categoryHref: "/search?category=auto-repair",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-slate-950 via-neutral-900 to-black",
  },
  {
    id: "home",
    category: "Home Services",
    headline: "Fix, repair, or refresh your home",
    subtitle: "Hire trusted AC technicians, plumbers, electricians, and contractors in your area.",
    ctaText: "Discover Home Professionals",
    businessName: "Colombo Cool Air & Care",
    businessLocation: "Galle Road, Dehiwala",
    categoryHref: "/search?category=home-services",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-zinc-950 via-neutral-900 to-black",
  },
  {
    id: "spas",
    category: "Beauty & Spas",
    headline: "Treat yourself to wellness & relaxation",
    subtitle: "Experience luxury Ayurvedic retreats, rejuvenating herbal massages, and top salons.",
    ctaText: "Browse Spas & Wellness",
    businessName: "Spa Ceylon Heritage",
    businessLocation: "Ward Place, Colombo 07",
    categoryHref: "/search?category=beauty-spa",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-rose-950 via-neutral-900 to-black",
  },
  {
    id: "lodging",
    category: "Hotels & Stays",
    headline: "Plan your next island escape",
    subtitle: "Discover luxury oceanfront villas, colonial heritage stays, and boutique hotels.",
    ctaText: "Explore Hotels & Stays",
    businessName: "Galle Face Heritage Hotel",
    businessLocation: "Galle Face Green, Colombo 03",
    categoryHref: "/search?category=lodging",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-cyan-950 via-neutral-900 to-black",
  },
  {
    id: "nightlife",
    category: "Nightlife & Bars",
    headline: "Unwind after dark in the city",
    subtitle: "Explore sunset rooftop lounges, craft cocktail bars, and buzzing nightlife spots.",
    ctaText: "Discover Nightlife & Bars",
    businessName: "Sky Lounge Colombo",
    businessLocation: "The Kingsbury, Colombo 01",
    categoryHref: "/search?category=nightlife-bars",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-purple-950 via-neutral-900 to-black",
  },
  {
    id: "shopping",
    category: "Retail & Shopping",
    headline: "Discover unique local shopping",
    subtitle: "Browse artisan craft markets, Ceylon sapphire boutiques, and premier shopping malls.",
    ctaText: "Explore Shopping & Retail",
    businessName: "Barefoot Craft Boutique",
    businessLocation: "Galle Road, Colombo 03",
    categoryHref: "/search?category=retail-shopping",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-emerald-950 via-neutral-900 to-black",
  },
  {
    id: "weddings",
    category: "Events & Weddings",
    headline: "Celebrate life's big moments",
    subtitle: "Connect with expert wedding vendors, luxury banquet halls, and top photographers.",
    ctaText: "Find Wedding & Event Pros",
    businessName: "Cinnamon Grand Ballroom",
    businessLocation: "Kollupitiya, Colombo 03",
    categoryHref: "/search?category=wedding-vendors",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-pink-950 via-neutral-900 to-black",
  },
  {
    id: "cafes",
    category: "Cafes & Bakeries",
    headline: "Catch up over artisan coffee & Ceylon tea",
    subtitle: "Discover cozy bakeries, fresh breakfast pastries, and work-friendly Wi-Fi spots.",
    ctaText: "Explore Cafes & Bakeries",
    businessName: "The Gallery Cafe & Bakehouse",
    businessLocation: "Alfred House Rd, Colombo 03",
    categoryHref: "/search?category=cafe-bakery",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=2400&q=85",
    fallbackGradient: "from-stone-950 via-neutral-900 to-black",
  },
];

export function YelpHeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance every 5.5 seconds to showcase all diverse sectors of the website
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section className="relative flex min-h-[660px] lg:min-h-[720px] w-full flex-col items-center justify-center bg-neutral-950 text-white px-4 pt-36 sm:pt-40 lg:pt-44 pb-16 text-center sm:px-6 lg:px-8 overflow-hidden select-none">
      {/* High-Resolution Dynamic Background Slides with Smooth Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out",
                isActive ? "opacity-100 scale-100" : "opacity-0 scale-105",
                "bg-gradient-to-b",
                slide.fallbackGradient,
              )}
              style={{
                backgroundImage: `url(${slide.imageUrl})`,
              }}
              aria-hidden="true"
            />
          );
        })}

        {/* Yelp-style High-Contrast Cinematic Gradient Overlays */}
        <div
          className="absolute inset-0 bg-neutral-950/55 backdrop-brightness-95 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-neutral-950/80 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),rgba(0,0,0,0.85))] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Main Hero Dynamic Content: Changes in sync with the active slide */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6">
        <div
          key={currentSlide.id}
          className="flex flex-col items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
        >
          {/* Dynamic Big Headline - directly displayed without any pill wording above */}
          <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl text-balance drop-shadow-md">
            {currentSlide.headline}
          </h1>

          {/* Dynamic Subtitle */}
          <p className="max-w-xl text-sm sm:text-base text-neutral-200 font-normal drop-shadow-sm leading-relaxed">
            {currentSlide.subtitle}
          </p>

          {/* Dynamic Category CTA Button */}
          <div className="pt-2">
            <Link
              href={currentSlide.categoryHref}
              className="group inline-flex items-center gap-2 rounded-full bg-[#D71616] hover:bg-[#B80F0F] text-white px-7 py-3 text-sm font-bold shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Yelp-style Photo Attribution Badge (Bottom Right) */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-20 hidden sm:flex items-center gap-2">
        <Link
          href={currentSlide.categoryHref}
          className="group flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-xs text-white/90 backdrop-blur-md transition-all hover:bg-black/80 hover:text-white border border-white/20 shadow-lg"
          title={`Discover ${currentSlide.category} in Sri Lanka`}
        >
          <Camera className="size-3.5 text-neutral-300 group-hover:text-white transition-colors" />
          <span className="font-medium text-white/85 group-hover:text-white">
            <span className="font-bold text-white">{currentSlide.businessName}</span>{" "}
            <span className="text-white/60">· {currentSlide.businessLocation}</span>
          </span>
          <ChevronRight className="size-3 text-white/50 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Category Indicator Pills (Bottom Left) */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-20 flex items-center gap-1.5">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              idx === currentIndex
                ? "w-7 bg-white shadow-sm"
                : "w-2 bg-white/40 hover:bg-white/70",
            )}
            aria-label={`Show ${slide.category}`}
          />
        ))}
      </div>
    </section>
  );
}

export default YelpHeroCarousel;
