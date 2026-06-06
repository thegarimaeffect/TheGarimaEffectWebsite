"use client";

import { useEffect } from "react";
import { CALENDLY_URL } from "./CalendlyDrawer";

/**
 * Inline Calendly embed for content pages (e.g. /contact).
 * Loads the Calendly widget script once and renders the booking calendar
 * directly in the page, so visitors can pick a slot without a popup.
 */
export default function CalendlyInline() {
  useEffect(() => {
    const id = "calendly-widget-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div
      className="calendly-inline-widget"
      data-url={CALENDLY_URL}
      style={{
        minWidth: "320px",
        height: "680px",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid rgba(232,84,122,0.2)",
        boxShadow: "0 12px 36px rgba(155,127,199,0.18)",
      }}
    />
  );
}
