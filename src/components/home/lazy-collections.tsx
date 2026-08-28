"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CollectionRunRow,
  CollectionSection,
} from "@/components/home/collection-section";
import {
  getHomeCollections,
  groupByQueuePosition,
  type ApiCollection,
} from "@/lib/api/home";
import type { Lang } from "@/lib/types";

const REVEAL_STEP = 6;

// Below-the-fold home sections: fetched once straight from the backend API
// when the user scrolls near the sentinel, then revealed a few runs at a
// time. Keeps the initial document small — long transfers get reset on flaky
// networks, so the bulk of the collections must not ship with the HTML.
// (Deliberately NOT a Next /api route: the production nginx routes /api/* to
// the NestJS backend, so Next route handlers under /api 404 there.)
export function LazyCollections({
  lang,
  offset,
}: {
  lang: Lang;
  offset: number;
}) {
  const [runs, setRuns] = useState<ApiCollection[][] | null>(null);
  const [visible, setVisible] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  const loadOrReveal = useCallback(async () => {
    if (runs !== null) {
      setVisible((v) => Math.min(runs.length, v + REVEAL_STEP));
      return;
    }
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const collections = await getHomeCollections(lang);
      // getHomeCollections is fail-soft ([] on error). The homepage only
      // mounts this component when there are more runs than the SSR slice,
      // so an empty result means the fetch failed: keep the sentinel so the
      // next intersection retries.
      if (collections.length === 0) return;
      setRuns(groupByQueuePosition(collections).slice(offset));
      setVisible(REVEAL_STEP);
    } catch {
      // Fail-soft: sentinel stays mounted, so the next intersection retries.
    } finally {
      fetchingRef.current = false;
    }
  }, [lang, offset, runs]);

  // Recreated whenever `visible` advances: observe() re-delivers the current
  // intersection state, so reveals keep chaining while the sentinel is still
  // inside the margin (e.g. the user scrolled straight to the bottom).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadOrReveal();
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadOrReveal, visible]);

  const done = runs !== null && visible >= runs.length;

  return (
    <>
      {(runs ?? []).slice(0, visible).map((run) =>
        run.length === 1 ? (
          <CollectionSection key={run[0].id} collection={run[0]} />
        ) : (
          <CollectionRunRow key={run[0].id} run={run} />
        ),
      )}
      {!done && <div ref={sentinelRef} aria-hidden className="h-px" />}
    </>
  );
}
