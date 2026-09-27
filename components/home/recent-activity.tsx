"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThumbsUp, HeartHandshake, Heart, Frown } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  userCity: string;
  action: string;
  timeAgo: string;
  businessName: string;
  businessSlug: string;
  category: string;
  district: string;
  priceTier: string;
  rating: number;
  snippet: string;
  reactions: {
    helpful: number;
    thanks: number;
    love: number;
    ohNo: number;
  };
}

const SEED_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    userId: "cmujq1rwd0000jgwecndn2njo", // Saman Kumara
    userName: "Saman Kumara",
    userAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    userCity: "Colombo 07",
    action: "wrote a review",
    timeAgo: "25 minutes ago",
    businessName: "Toni & Guy Colombo",
    businessSlug: "toni-and-guy-colombo",
    category: "Beauty & Spas",
    district: "Colombo 07",
    priceTier: "$$$",
    rating: 5,
    snippet:
      "Exceptional service and styling! The team is extremely attentive, professional, and knowledgeable. By far the finest salon experience in Colombo. Highly recommended for hair treatments.",
    reactions: { helpful: 4, thanks: 2, love: 6, ohNo: 0 },
  },
  {
    id: "act-2",
    userId: "cmujq1ry70001jgwev6gtkkmu", // Dilani Perera
    userName: "Dilani Perera",
    userAvatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    userCity: "Colombo 03",
    action: "wrote a review",
    timeAgo: "1 hour ago",
    businessName: "The Curry Leaf",
    businessSlug: "the-curry-leaf",
    category: "Restaurants",
    district: "Colombo 01",
    priceTier: "$$$",
    rating: 4.5,
    snippet:
      "Superb authentic Sri Lankan seafood and hoppers prepared fresh at the live stations. The ambiance at night by the lotus pond is truly magical. Make sure to try the crab curry!",
    reactions: { helpful: 8, thanks: 3, love: 9, ohNo: 0 },
  },
  {
    id: "act-3",
    userId: "cmujq1ryi0002jgwe3wkwhuq8", // Nuwan Jayasuriya
    userName: "Nuwan Jayasuriya",
    userAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    userCity: "Rajagiriya",
    action: "wrote a review",
    timeAgo: "3 hours ago",
    businessName: "Cheers Pub",
    businessSlug: "cheers-pub",
    category: "Nightlife & Bars",
    district: "Colombo 03",
    priceTier: "$$",
    rating: 4,
    snippet:
      "Great British pub vibe with live sports screenings, cold brews, and generous portions. The fish and chips along with the beef pie are always dependable favorites.",
    reactions: { helpful: 3, thanks: 1, love: 2, ohNo: 0 },
  },
  {
    id: "act-4",
    userId: "cmujqui7b00035swegfiuz8fv", // Hasini Wickramasinghe
    userName: "Hasini Wickramasinghe",
    userAvatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    userCity: "Kollupitiya",
    action: "wrote a review",
    timeAgo: "5 hours ago",
    businessName: "Spa Ceylon Colombo",
    businessSlug: "spa-ceylon-colombo",
    category: "Beauty & Spas",
    district: "Colombo 07",
    priceTier: "$$$",
    rating: 5,
    snippet:
      "Pure sanctuary of relaxation. The herbal massage and natural aromatherapy scents melt away all stress. Staff are courteous and the signature teas are delicious.",
    reactions: { helpful: 7, thanks: 4, love: 8, ohNo: 0 },
  },
  {
    id: "act-5",
    userId: "cmujqui7i00045swe6h32oywu", // Chathura Silva
    userName: "Chathura Silva",
    userAvatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    userCity: "Nugegoda",
    action: "wrote a review",
    timeAgo: "7 hours ago",
    businessName: "House of Fashions",
    businessSlug: "house-of-fashions",
    category: "Retail & Shopping",
    district: "Colombo 08",
    priceTier: "$$",
    rating: 4,
    snippet:
      "A massive department store with multiple floors. Huge variety of casual clothing, home goods, and accessories at very accessible prices. Spacious parking available.",
    reactions: { helpful: 2, thanks: 1, love: 1, ohNo: 0 },
  },
  {
    id: "act-6",
    userId: "cmujqui7q00055swe2py44jah", // Anuka Fernando
    userName: "Anuka Fernando",
    userAvatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    userCity: "Mount Lavinia",
    action: "wrote a review",
    timeAgo: "10 hours ago",
    businessName: "Navy Food Restaurant",
    businessSlug: "navy-food-restaurant",
    category: "Restaurants",
    district: "Colombo 01",
    priceTier: "$$",
    rating: 4.5,
    snippet:
      "Consistently delicious food right near the harbor area. Fast friendly service, spotlessly clean dining space, and reasonable prices for Colombo Fort. Will return soon.",
    reactions: { helpful: 5, thanks: 2, love: 4, ohNo: 0 },
  },
];


export function RecentActivity() {
  const [reactions, setReactions] = useState<Record<string, Record<string, boolean>>>({});
  const [counts, setCounts] = useState<Record<string, ActivityItem["reactions"]>>(() => {
    const initial: Record<string, ActivityItem["reactions"]> = {};
    for (const item of SEED_ACTIVITY) {
      initial[item.id] = { ...item.reactions };
    }
    return initial;
  });

  const toggleReaction = (itemId: string, reactionType: keyof ActivityItem["reactions"]) => {
    const isCurrentlyActive = Boolean(reactions[itemId]?.[reactionType]);
    setReactions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [reactionType]: !isCurrentlyActive,
      },
    }));

    setCounts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [reactionType]: isCurrentlyActive
          ? prev[itemId][reactionType] - 1
          : prev[itemId][reactionType] + 1,
      },
    }));
  };

  return (
    <section className="flex flex-col gap-6 w-full" aria-label="Recent community activity">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Recent Activity
          </h2>
          <p className="text-sm text-neutral-500">
            Fresh reviews and recommendations from locals in Sri Lanka
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SEED_ACTIVITY.map((item) => {
          const userInitials = item.userName
            .split(" ")
            .map((n) => n[0])
            .join("");
          const currentCounts = counts[item.id] ?? item.reactions;
          const userReactions = reactions[item.id] ?? {};

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-lg border border-neutral-200/90 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div>
                {/* User Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <Link
                    href={`/user/${item.userId}`}
                    className="shrink-0 transition-transform hover:scale-105"
                    title={`View ${item.userName}'s profile`}
                  >
                    <UserAvatar
                      src={item.userAvatarUrl}
                      name={item.userName}
                      size="md"
                      className="border border-neutral-200 hover:border-[#D71616] transition-colors"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <Link
                        href={`/user/${item.userId}`}
                        className="font-bold text-sm text-neutral-900 hover:text-[#D71616] hover:underline transition-colors"
                      >
                        {item.userName}
                      </Link>
                      <span className="text-xs text-neutral-500 font-normal">
                        {item.action}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {item.userCity} · {item.timeAgo}
                    </span>
                  </div>
                </div>

                {/* Business Info */}
                <div className="pt-3 pb-2 flex flex-col gap-1.5">
                  <Link
                    href={`/business/${item.businessSlug}`}
                    className="font-bold text-base text-neutral-900 hover:text-[#D71616] hover:underline transition-colors leading-tight"
                  >
                    {item.businessName}
                  </Link>

                  <div className="flex items-center gap-2">
                    <StarRating rating={item.rating} size="xs" showCount={false} />
                    <span className="text-xs text-neutral-500 font-medium">
                      {item.category} · {item.priceTier}
                    </span>
                  </div>
                </div>

                {/* Snippet */}
                <p className="text-sm text-neutral-700 leading-relaxed pt-1 line-clamp-4">
                  “{item.snippet}”
                </p>
              </div>

              {/* Reaction Buttons Row: Professional Enterprise Action Badges */}
              <div className="pt-3.5 mt-3 border-t border-neutral-100 flex items-center justify-between gap-1 text-xs">
                {/* Helpful */}
                <button
                  type="button"
                  onClick={() => toggleReaction(item.id, "helpful")}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md font-medium transition-all duration-150 border cursor-pointer select-none",
                    userReactions.helpful
                      ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-xs"
                      : "bg-neutral-50/70 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border-neutral-200/70",
                  )}
                  aria-label="Helpful"
                  aria-pressed={Boolean(userReactions.helpful)}
                >
                  <ThumbsUp
                    className={cn(
                      "size-3.5 shrink-0 transition-transform active:scale-125",
                      userReactions.helpful ? "text-amber-700 fill-amber-700" : "text-neutral-500",
                    )}
                  />
                  <span>Helpful</span>
                  <span className={cn("text-[11px] font-semibold tabular-nums", userReactions.helpful ? "text-amber-900" : "text-neutral-600")}>
                    {currentCounts.helpful}
                  </span>
                </button>

                {/* Thanks */}
                <button
                  type="button"
                  onClick={() => toggleReaction(item.id, "thanks")}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md font-medium transition-all duration-150 border cursor-pointer select-none",
                    userReactions.thanks
                      ? "bg-blue-50 text-blue-900 border-blue-300 font-semibold shadow-xs"
                      : "bg-neutral-50/70 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border-neutral-200/70",
                  )}
                  aria-label="Thanks"
                  aria-pressed={Boolean(userReactions.thanks)}
                >
                  <HeartHandshake
                    className={cn(
                      "size-3.5 shrink-0 transition-transform active:scale-125",
                      userReactions.thanks ? "text-blue-700 stroke-[2.2]" : "text-neutral-500",
                    )}
                  />
                  <span>Thanks</span>
                  <span className={cn("text-[11px] font-semibold tabular-nums", userReactions.thanks ? "text-blue-900" : "text-neutral-600")}>
                    {currentCounts.thanks}
                  </span>
                </button>

                {/* Love */}
                <button
                  type="button"
                  onClick={() => toggleReaction(item.id, "love")}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md font-medium transition-all duration-150 border cursor-pointer select-none",
                    userReactions.love
                      ? "bg-rose-50 text-rose-900 border-rose-300 font-semibold shadow-xs"
                      : "bg-neutral-50/70 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border-neutral-200/70",
                  )}
                  aria-label="Love this"
                  aria-pressed={Boolean(userReactions.love)}
                >
                  <Heart
                    className={cn(
                      "size-3.5 shrink-0 transition-transform active:scale-125",
                      userReactions.love ? "text-[#D71616] fill-[#D71616]" : "text-neutral-500",
                    )}
                  />
                  <span>Love</span>
                  <span className={cn("text-[11px] font-semibold tabular-nums", userReactions.love ? "text-rose-900" : "text-neutral-600")}>
                    {currentCounts.love}
                  </span>
                </button>

                {/* Oh no */}
                <button
                  type="button"
                  onClick={() => toggleReaction(item.id, "ohNo")}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md font-medium transition-all duration-150 border cursor-pointer select-none",
                    userReactions.ohNo
                      ? "bg-purple-50 text-purple-900 border-purple-300 font-semibold shadow-xs"
                      : "bg-neutral-50/70 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border-neutral-200/70",
                  )}
                  aria-label="Oh no"
                  aria-pressed={Boolean(userReactions.ohNo)}
                >
                  <Frown
                    className={cn(
                      "size-3.5 shrink-0 transition-transform active:scale-125",
                      userReactions.ohNo ? "text-purple-700 stroke-[2.2]" : "text-neutral-500",
                    )}
                  />
                  <span>Oh no</span>
                  <span className={cn("text-[11px] font-semibold tabular-nums", userReactions.ohNo ? "text-purple-900" : "text-neutral-600")}>
                    {currentCounts.ohNo}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RecentActivity;
