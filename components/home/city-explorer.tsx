"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CitySearchData {
  city: string;
  topSearches: { name: string; query: string }[];
  trendingSearches: { name: string; query: string }[];
  seasonalSearches: { name: string; query: string }[];
}

const SRI_LANKA_CITIES: CitySearchData[] = [
  {
    city: "Colombo",
    topSearches: [
      { name: "Restaurants near me", query: "Restaurants" },
      { name: "AC Repair & Service", query: "AC+Repair" },
      { name: "Cafes with Wi-Fi", query: "Cafes" },
      { name: "Hair Salons in Colombo 07", query: "Hair+Salon" },
      { name: "Three-Wheeler Repair", query: "Three+Wheeler+Repair" },
    ],
    trendingSearches: [
      { name: "Late Night Kottu", query: "Kottu" },
      { name: "Rooftop Bars & Lounges", query: "Rooftop+Bars" },
      { name: "Seafood at Fort", query: "Seafood" },
      { name: "Plumbers in Dehiwala", query: "Plumber" },
      { name: "Boutique Day Spas", query: "Day+Spa" },
    ],
    seasonalSearches: [
      { name: "Wedding Reception Halls", query: "Wedding+Halls" },
      { name: "Holiday Catering Services", query: "Catering" },
      { name: "Weekend Buffet Lunches", query: "Buffet" },
      { name: "Car Detailing & Wash", query: "Car+Detailing" },
      { name: "Home Deep Cleaning", query: "Home+Cleaning" },
    ],
  },
  {
    city: "Kandy",
    topSearches: [
      { name: "Lake View Restaurants", query: "Restaurants" },
      { name: "Traditional Ayurvedic Spas", query: "Ayurveda" },
      { name: "Boutique Guesthouses", query: "Guesthouses" },
      { name: "Handicrafts & Souvenirs", query: "Handicrafts" },
      { name: "Auto Mechanics Kandy", query: "Auto+Repair" },
    ],
    trendingSearches: [
      { name: "Peradeniya Cafes", query: "Cafes" },
      { name: "Hills Scenic Dining", query: "Dining" },
      { name: "Tuk Tuk Drivers Kandy", query: "Tuk+Tuk" },
      { name: "Jewellery & Gems", query: "Jewellery" },
      { name: "Bakers & Confectionery", query: "Bakery" },
    ],
    seasonalSearches: [
      { name: "Esala Perahera View Hotels", query: "Hotels" },
      { name: "Tea Estate Bungalows", query: "Tea+Bungalows" },
      { name: "Trekking & Nature Guides", query: "Guides" },
      { name: "Wedding Photographers Kandy", query: "Wedding+Photography" },
      { name: "House Painters Kandy", query: "Painters" },
    ],
  },
  {
    city: "Galle",
    topSearches: [
      { name: "Galle Fort Dining", query: "Galle+Fort+Restaurants" },
      { name: "Boutique Hotels & Villas", query: "Villas" },
      { name: "Gelato & Cafes", query: "Gelato" },
      { name: "Surf Lessons Unawatuna", query: "Surfing" },
      { name: "Vehicle Rental Galle", query: "Car+Rental" },
    ],
    trendingSearches: [
      { name: "Fresh Seafood Shacks", query: "Seafood" },
      { name: "Sunset Cocktail Bars", query: "Bars" },
      { name: "Handmade Souvenirs", query: "Gifts" },
      { name: "Yoga Studios & Retreats", query: "Yoga" },
      { name: "Jewelry Artisans", query: "Gems" },
    ],
    seasonalSearches: [
      { name: "Beachfront Villa Bookings", query: "Beach+Villas" },
      { name: "Whale Watching Tours", query: "Whale+Watching" },
      { name: "Galle Literary Festival Cafes", query: "Cafes" },
      { name: "Destination Wedding Venues", query: "Weddings" },
      { name: "Boat Rides & Lagoon Tours", query: "Boat+Tours" },
    ],
  },
  {
    city: "Negombo",
    topSearches: [
      { name: "Lagoon Seafood Diners", query: "Seafood" },
      { name: "Transit Hotels near Airport", query: "Airport+Hotels" },
      { name: "Beach Resorts", query: "Beach+Resorts" },
      { name: "Taxi & Cab Services to BIA", query: "Taxi" },
      { name: "Car Rental Negombo", query: "Car+Rental" },
    ],
    trendingSearches: [
      { name: "Pubs along Lewis Place", query: "Pubs" },
      { name: "Lobster & Crab Specialities", query: "Crab" },
      { name: "Kite Surfing Instructors", query: "Kitesurfing" },
      { name: "Ayurveda Wellness Centers", query: "Ayurveda" },
      { name: "Boat Safari Dutch Canal", query: "Safari" },
    ],
    seasonalSearches: [
      { name: "Catamaran Sailing Trips", query: "Sailing" },
      { name: "Christmas Beach Dinners", query: "Christmas+Dinner" },
      { name: "Church Feast Celebrations", query: "Events" },
      { name: "Wedding Venues Negombo", query: "Wedding+Halls" },
      { name: "Pool Day Passes", query: "Swimming+Pools" },
    ],
  },
  {
    city: "Nuwara Eliya",
    topSearches: [
      { name: "Colonial High Tea & Scones", query: "High+Tea" },
      { name: "Heated Bungalows & Cottages", query: "Cottages" },
      { name: "Strawberry Farm Cafes", query: "Strawberry" },
      { name: "Lake Gregory Speedboats", query: "Boating" },
      { name: "Fresh Vegetable Stalls", query: "Groceries" },
    ],
    trendingSearches: [
      { name: "Log Fire Pubs & Diners", query: "Pubs" },
      { name: "Golf Club Restaurants", query: "Dining" },
      { name: "Horton Plains Guides", query: "Trekking" },
      { name: "Tea Factory Tours", query: "Tea+Factory" },
      { name: "Horse Riding Trainers", query: "Horse+Riding" },
    ],
    seasonalSearches: [
      { name: "April Season Carnivals", query: "Events" },
      { name: "Flower Show Gardens", query: "Gardens" },
      { name: "Bungalows for Avurudu", query: "Bungalows" },
      { name: "Warm Woolen Garments", query: "Garments" },
      { name: "Camp Sites in Ambewela", query: "Camping" },
    ],
  },
];

export function CityExplorer() {
  const [selectedCityName, setSelectedCityName] = useState("Colombo");
  const currentCity =
    SRI_LANKA_CITIES.find((c) => c.city === selectedCityName) ??
    SRI_LANKA_CITIES[0];

  return (
    <section className="flex flex-col gap-6 w-full" aria-label="Explore popular searches">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Explore Searches in Sri Lankan Cities
        </h2>
        <p className="text-sm text-neutral-500">
          Discover what locals and travelers are searching for in every region
        </p>
      </div>

      {/* City Chips */}
      <div className="flex flex-wrap gap-2 pb-2">
        {SRI_LANKA_CITIES.map((c) => {
          const isSelected = c.city === selectedCityName;
          return (
            <button
              key={c.city}
              type="button"
              onClick={() => setSelectedCityName(c.city)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-all border",
                isSelected
                  ? "bg-[#E6F4F7] text-[#007692] border-[#007692] shadow-xs"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
              )}
            >
              {c.city}
            </button>
          );
        })}
      </div>

      {/* 3 Columns of Search Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border border-neutral-200/90 bg-white p-6 shadow-sm">
        {/* Column 1 */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2">
            Top Searches in {currentCity.city}
          </h3>
          <ul className="flex flex-col gap-2">
            {currentCity.topSearches.map((item) => (
              <li key={item.name}>
                <Link
                  href={`/search?find_desc=${item.query}&find_loc=${currentCity.city}`}
                  className="text-sm text-neutral-700 hover:text-[#D71616] hover:underline transition-colors block py-0.5"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2">
            Trending Searches
          </h3>
          <ul className="flex flex-col gap-2">
            {currentCity.trendingSearches.map((item) => (
              <li key={item.name}>
                <Link
                  href={`/search?find_desc=${item.query}&find_loc=${currentCity.city}`}
                  className="text-sm text-neutral-700 hover:text-[#D71616] hover:underline transition-colors block py-0.5"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base text-neutral-900 border-b border-neutral-100 pb-2">
            Seasonal & Weekend Specials
          </h3>
          <ul className="flex flex-col gap-2">
            {currentCity.seasonalSearches.map((item) => (
              <li key={item.name}>
                <Link
                  href={`/search?find_desc=${item.query}&find_loc=${currentCity.city}`}
                  className="text-sm text-neutral-700 hover:text-[#D71616] hover:underline transition-colors block py-0.5"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default CityExplorer;
