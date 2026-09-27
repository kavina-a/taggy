import { DiscoveryRail } from "@/components/home/discovery-rail";
import { YelpCategories } from "@/components/home/yelp-categories";
import { RecentActivity } from "@/components/home/recent-activity";
import { CityExplorer } from "@/components/home/city-explorer";
import { YelpHeroCarousel } from "@/components/home/yelp-hero-carousel";
import { CuratedCollectionsSection } from "@/components/home/curated-collections";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestLanguage } from "@/lib/i18n/get-request-language";
import {
  computeOpenNowByBusinessId,
  getTrendingBusinessIds,
  loadBusinessesByIds,
  loadNewBusinesses,
  loadTopRatedBusinesses,
  RAIL_SIZE,
  toRailBusiness,
} from "@/lib/home/load-rails";

const TRENDING_RAIL_SIZE = RAIL_SIZE;
const NEW_BUSINESSES_RAIL_SIZE = RAIL_SIZE;

export default async function Home() {
  const lang = await getRequestLanguage();
  const t = getDictionary(lang);
  const trendingIds = await getTrendingBusinessIds(TRENDING_RAIL_SIZE);

  const [trendingRows, newRows, topRated] = await Promise.all([
    loadBusinessesByIds(trendingIds),
    loadNewBusinesses(NEW_BUSINESSES_RAIL_SIZE),
    loadTopRatedBusinesses(),
  ]);

  const trendingOrder = new Map(trendingIds.map((id, index) => [id, index]));
  trendingRows.sort(
    (a, b) => (trendingOrder.get(a.id) ?? 0) - (trendingOrder.get(b.id) ?? 0),
  );

  const openNowById = await computeOpenNowByBusinessId([
    ...trendingRows.map((b) => b.id),
    ...newRows.map((b) => b.id),
  ]);

  const trending = trendingRows.map((b) => toRailBusiness(b, openNowById.get(b.id)));
  const newBusinesses = newRows.map((b) => toRailBusiness(b, openNowById.get(b.id)));

  return (
    <main className="flex w-full flex-col bg-white">
      {/* Yelp-style Dynamic Hero with Rotating High-Res Backgrounds & Synchronized Text */}
      <YelpHeroCarousel />

      {/* Main Content Sections */}
      <div
        id="explore"
        className="mx-auto flex w-full max-w-[1600px] flex-col gap-16 px-4 py-12 sm:px-8 md:gap-20 md:py-16 lg:px-12 xl:px-16"
      >
        {/* 1. Yelp 8-Category Grid */}
        <YelpCategories />

        {/* 2. Recent Community Activity Feed */}
        <RecentActivity />

        {/* 3. Trending Near You Rail */}
        <DiscoveryRail heading={t.home.trending} businesses={trending} />

        {/* 4. Top Rated Businesses Rail */}
        <DiscoveryRail heading={t.home.topRated} businesses={topRated} />

        {/* 5. New Businesses Rail */}
        <DiscoveryRail heading={t.home.newBusinesses} businesses={newBusinesses} />

        {/* 6. Handcrafted Curated Collections */}
        <CuratedCollectionsSection />

        {/* 7. Searches in Sri Lankan Cities */}
        <CityExplorer />
      </div>
    </main>
  );
}
