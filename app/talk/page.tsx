import Link from "next/link";
import { MessageSquare, MessageCircle, Heart, ArrowRight, User as UserIcon, Flame, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata = {
  title: "Community Talk & Local Discussions | LankaReview",
  description: "Join local discussions in Sri Lanka: best street food gems, neighborhood advice, trusted tradesmen, and island living tips.",
};

interface TalkThread {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorCity: string;
  timeAgo: string;
  replyCount: number;
  likeCount: number;
  preview: string;
  isPopular?: boolean;
}

const SEED_THREADS: TalkThread[] = [
  {
    id: "thread-1",
    title: "Best place for authentic Ceylon black pork curry in Colombo?",
    category: "Food & Dining",
    authorName: "Mahesh Ranasinghe",
    authorCity: "Colombo 05",
    timeAgo: "2 hours ago",
    replyCount: 18,
    likeCount: 24,
    preview: "Looking for traditional spicy black pork curry made with real goraka and roasted curry powder. Any roadside kade or upscale place you swear by?",
    isPopular: true,
  },
  {
    id: "thread-2",
    title: "Reliable inverter AC technicians who don't overcharge for gas top-up?",
    category: "Home & Living",
    authorName: "Kavindi Jayawardena",
    authorCity: "Dehiwala",
    timeAgo: "5 hours ago",
    replyCount: 12,
    likeCount: 9,
    preview: "Every technician I call claims my inverter AC has a gas leak without even checking the copper pipes. Can anyone recommend an honest certified service provider?",
  },
  {
    id: "thread-3",
    title: "Quiet cafes in Colombo with high-speed Wi-Fi and good coffee for remote work?",
    category: "Work & Cafes",
    authorName: "Sachintha Perera",
    authorCity: "Colombo 07",
    timeAgo: "1 day ago",
    replyCount: 27,
    likeCount: 38,
    preview: "Need a spot with comfortable seating, plug points near every table, and solid Wi-Fi where taking a quick 10-minute Zoom call isn't an issue.",
    isPopular: true,
  },
  {
    id: "thread-4",
    title: "Best three-wheeler repair shop in Nugegoda / Rajagiriya for suspension tuning?",
    category: "Auto & Transport",
    authorName: "Roshan Gamage",
    authorCity: "Nugegoda",
    timeAgo: "2 days ago",
    replyCount: 8,
    likeCount: 6,
    preview: "Looking for an expert mechanic who specializes in Bajaj RE rear shock absorber and leaf spring replacement. Reasonable rates preferred.",
  },
  {
    id: "thread-5",
    title: "Hidden gems in Galle Fort that tourists usually miss?",
    category: "Travel & Island",
    authorName: "Natasha Fernando",
    authorCity: "Mount Lavinia",
    timeAgo: "3 days ago",
    replyCount: 31,
    likeCount: 45,
    preview: "Visiting Galle this weekend with friends. Already seen the lighthouse and ramparts. What are the best small gelato spots, antique bookshops, or secluded sunset courtyards?",
    isPopular: true,
  },
];

export default function TalkPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-10 md:py-14">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-neutral-200">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
              <MessageSquare className="size-3.5 fill-[#D71616]" />
              <span>Community Forum</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              Community Talk
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Exchange tips, ask local questions, and share recommendations with fellow locals across Sri Lanka.
            </p>
          </div>

          <Button className="bg-[#D71616] hover:bg-[#B80F0F] text-white rounded-full px-6 font-bold shadow-sm self-start sm:self-auto gap-2">
            <MessageCircle className="size-4" />
            <span>New Conversation</span>
          </Button>
        </div>

        {/* Layout: Categories Sidebar + Threads */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Categories Sidebar */}
          <aside className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
              Discussion Topics
            </span>
            <nav className="flex flex-col gap-1">
              {[
                "All Conversations",
                "Food & Dining",
                "Home & Living",
                "Work & Cafes",
                "Auto & Transport",
                "Travel & Island",
                "Events & Meetups",
              ].map((category, idx) => (
                <button
                  key={category}
                  type="button"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                    idx === 0
                      ? "bg-neutral-900 text-white font-bold"
                      : "text-neutral-700 hover:bg-neutral-200/60 hover:text-neutral-900"
                  }`}
                >
                  <span>{category}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Threads List */}
          <div className="flex flex-col gap-4">
            {SEED_THREADS.map((thread) => {
              const authorInitials = thread.authorName
                .split(" ")
                .map((n) => n[0])
                .join("");

              return (
                <Card
                  key={thread.id}
                  className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-neutral-300 flex flex-col gap-3.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-neutral-200">
                        <AvatarFallback className="text-xs font-bold bg-neutral-100 text-neutral-800">
                          {authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-neutral-900">
                          {thread.authorName}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {thread.authorCity} &middot; {thread.timeAgo}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 border border-neutral-200/80">
                      {thread.category}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 hover:text-[#D71616] cursor-pointer transition-colors leading-snug">
                      {thread.title}
                    </h2>
                    <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                      {thread.preview}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                        <MessageSquare className="size-3.5 text-neutral-400" />
                        <span className="font-bold">{thread.replyCount}</span> replies
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                        <Heart className="size-3.5 text-neutral-400" />
                        <span className="font-bold">{thread.likeCount}</span> likes
                      </span>
                      {thread.isPopular && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Flame className="size-3 fill-amber-500 text-amber-600" />
                          <span>Trending</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#D71616] hover:underline cursor-pointer">
                      Join Discussion &rarr;
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
