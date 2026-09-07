"use client";

import { useEffect } from "react";
import { getFontTheme, type FontThemeId } from "@/lib/site-content";

/** Loads the selected Google Font theme and exposes CSS variables. */
export function FontThemeLoader({ themeId }: { themeId: FontThemeId }) {
  const theme = getFontTheme(themeId);

  useEffect(() => {
    const linkId = "hogback-font-theme";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const families = theme.googleFamilies.map((f) => `family=${f}`).join("&");
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    const styleId = "hogback-font-theme-vars";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = `
      :root {
        --font-sans: ${theme.bodyFamily};
        --font-display: ${theme.displayFamily};
        --font-dm-sans: ${theme.bodyFamily};
        --font-barlow: ${theme.displayFamily};
      }
      body {
        font-family: ${theme.bodyFamily};
      }
      .font-display {
        font-family: ${theme.displayFamily};
      }
    `;
  }, [theme]);

  return null;
}
