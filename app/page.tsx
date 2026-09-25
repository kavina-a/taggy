import { SearchBar } from "@/components/search/search-bar";
import { DiscoveryRail } from "@/components/home/discovery-rail";
import { CategoryShortcuts } from "@/components/home/category-shortcuts";
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
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8 md:gap-16 md:py-12">
      <section className="flex flex-col items-center gap-6 py-8 text-center md:py-12">
        <h1 className="max-w-2xl text-[28px] leading-[1.2] font-semibold">
          {t.home.headline}
        </h1>
        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>
      </section>

      <DiscoveryRail heading={t.home.trending} businesses={trending} />
      <DiscoveryRail heading={t.home.topRated} businesses={topRated} />
      <DiscoveryRail heading={t.home.newBusinesses} businesses={newBusinesses} />
      <CategoryShortcuts heading={t.home.browseCategory} />
    </main>
  );
}
