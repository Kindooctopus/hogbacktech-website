"use client";

import { useEffect, useState } from "react";
import {
  defaultSiteContent,
  mergeSiteContent,
  type SiteContent,
} from "@/lib/site-content";

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (!res.ok) throw new Error(`content ${res.status}`);
        const data = await res.json();
        if (!cancelled) setContent(mergeSiteContent(data));
      } catch {
        // Keep bundled defaults when API/KV is unavailable (local static serve).
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, loaded, setContent };
}
