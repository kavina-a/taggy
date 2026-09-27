import Link from "next/link";
import { Calendar, MapPin, Clock, Users, ArrowRight, Ticket, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Local Events in Sri Lanka | LankaReview",
  description: "Discover upcoming food festivals, weekend markets, cultural popups, live music, and exhibitions happening across Sri Lanka.",
};

interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: string;
  interestedCount: number;
  imageUrl: string;
  description: string;
}

const EVENTS: EventItem[] = [
  {
    id: "colombo-street-food",
    title: "Colombo Street Food & Kottu Night Festival",
    category: "Food & Drink",
    date: "Saturday, Oct 10, 2026",
    time: "5:00 PM – 11:30 PM",
    venue: "Galle Face Green Promenade",
    city: "Colombo 03",
    price: "Free Admission",
    interestedCount: 342,
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    description: "Experience 40+ local street food stalls, live flaming kottu battles, fresh seafood grills, and acoustic island music by the Indian Ocean.",
  },
  {
    id: "dutch-hospital-jazz",
    title: "Sunset Jazz & Craft Cocktails at Dutch Hospital",
    category: "Music & Nightlife",
    date: "Friday, Oct 16, 2026",
    time: "7:00 PM – 11:00 PM",
    venue: "Old Dutch Hospital Courtyard",
    city: "Colombo 01",
    price: "Free Admission",
    interestedCount: 215,
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    description: "An evening of smooth contemporary jazz, colonial architecture ambiance, and specialty signature cocktails under the stars.",
  },
  {
    id: "good-market-colombo",
    title: "Saturday Good Market & Artisan Fair",
    category: "Markets & Crafts",
    date: "Every Saturday",
    time: "9:00 AM – 5:00 PM",
    venue: "Colombo Racecourse Grounds",
    city: "Colombo 07",
    price: "Free Admission",
    interestedCount: 489,
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    description: "Certified organic fresh produce, artisanal Ceylon chocolates, eco-friendly homeware, natural skincare, and live entertainment.",
  },
  {
    id: "galle-fort-art-walk",
    title: "Galle Heritage Art & Photography Walk",
    category: "Arts & Culture",
    date: "Sunday, Oct 25, 2026",
    time: "3:30 PM – 7:00 PM",
    venue: "Galle Fort Historic Ramparts",
    city: "Galle",
    price: "Rs. 2,000 / person",
    interestedCount: 164,
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    description: "Guided architectural walk exploring 17th-century Dutch colonial buildings, private art studios, and panoramic sunset bastion views.",
  },
];

export default function EventsPage() {
  return (
    <main className="w-full bg-[#FAFAFA] min-h-screen py-10 md:py-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-neutral-200">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D71616]">
              <Calendar className="size-3.5 fill-[#D71616]" />
              <span>Local Happenings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
              Events in Sri Lanka
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Discover culinary popups, weekend markets, live concerts, and cultural gatherings near you.
            </p>
          </div>

          <Button className="bg-[#D71616] hover:bg-[#B80F0F] text-white rounded-full px-6 font-bold shadow-sm self-start sm:self-auto gap-2">
            <Ticket className="size-4" />
            <span>Submit an Event</span>
          </Button>
        </header>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EVENTS.map((evt) => (
            <Card
              key={evt.id}
              className="group overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-lg flex flex-col sm:flex-row"
            >
              {/* Event Image */}
              <div className="relative h-48 sm:h-auto sm:w-2/5 shrink-0 overflow-hidden bg-neutral-900">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${evt.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
                <span className="absolute top-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
                  {evt.category}
                </span>
              </div>

              {/* Event Content */}
              <CardContent className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D71616]">
                    <Calendar className="size-3.5 shrink-0" />
                    <span>{evt.date}</span>
                    <span>&middot;</span>
                    <Clock className="size-3.5 shrink-0 text-neutral-400" />
                    <span className="text-neutral-500 font-normal">{evt.time}</span>
                  </div>

                  <h2 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-[#D71616] transition-colors">
                    {evt.title}
                  </h2>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="size-3.5 text-neutral-400 shrink-0" />
                    <span>{evt.venue}, {evt.city}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed pt-1">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                    <Users className="size-3.5 text-neutral-400" />
                    <span><strong className="text-neutral-900 font-bold">{evt.interestedCount}</strong> interested</span>
                  </div>

                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {evt.price}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
