"use client";

import dynamic from "next/dynamic";
import type { BusinessMapProps } from "./business-map";

// Leaflet touches `window`/`document` at render time, so it must never be
// server-rendered. `ssr: false` requires this call to live in a Client
// Component boundary — kept in this tiny wrapper so business-page.tsx (the
// rest of which is plain server-renderable, SEO-relevant markup) doesn't
// need "use client" itself.
const LazyBusinessMap = dynamic(
  () => import("./business-map").then((mod) => mod.BusinessMap),
  {
    ssr: false,
    loading: () => (
      <div
        data-testid="business-map"
        className="h-64 w-full animate-pulse rounded-md bg-secondary md:h-80"
      />
    ),
  },
);

export function BusinessMapDynamic(props: BusinessMapProps) {
  return <LazyBusinessMap {...props} />;
}
