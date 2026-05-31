import { useState, useEffect } from "react";

const COLOR_MAP = {
  "About the Internship":      { bg: "#4F86C6", light: "#E8F0FA" },
  "Timing and Dates":          { bg: "#F4A261", light: "#FEF0E6" },
  "NOC":                       { bg: "#2A9D8F", light: "#E6F5F3" },
  "Selection and Offer Letter":{ bg: "#E76F51", light: "#FBEAE5" },
  "Work and Mentorship":       { bg: "#6A4C93", light: "#EEE6F4" },
  "Communication Channels":    { bg: "#1982C4", light: "#E5F1F9" },
  "Interviews":                { bg: "#FF595E", light: "#FFEAEA" },
  "Certificate":               { bg: "#FFCA3A", light: "#FFFBE6" },
  "Rosetta":                   { bg: "#8AC926", light: "#EEF8E4" },
  "Phase 1 and Coursework":    { bg: "#6A994E", light: "#EBF4E3" },
  "Yaksha Chat":               { bg: "#BC4749", light: "#F5E6E6" },
  "ViBe Platform":             { bg: "#E9C46A", light: "#FDF8E8" },
  "Team Formation":            { bg: "#457B9D", light: "#E6EFF5" },
};

const DEFAULT_COLOR = { bg: "#94A3B8", light: "#F1F5F9" };

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Scale FAQ count to card dimensions.
 * count=0  → 100×60  (min)
 * count=20 → 280×140 (max)
 * Linear interpolation in between.
 */
function getCardDimensions(count) {
  const minCount = 0;
  const maxCount = 20;
  const minW = 100, maxW = 280;
  const minH = 60,  maxH = 140;

  const raw = maxCount === minCount ? 0 : (count - minCount) / (maxCount - minCount);
  const t = Math.max(0, Math.min(1, raw));

  const width  = Math.round(lerp(minW, maxW, t));
  const height = Math.round(lerp(minH, maxH, t));

  return { width, height };
}

export default function CategoryCard({ cat, count, onClick }) {
  const [hovered, setHovered] = useState(false);

  const { width, height } = getCardDimensions(count);
  const colors = COLOR_MAP[cat.name] || DEFAULT_COLOR;

  // Debug log on mount and when count changes
  useEffect(() => {
    console.debug(
      `[CategoryCard] mounted: name=${cat.name} | count=${count} | ` +
      `size=${width}×${height}px | color=${colors.bg}`
    );
  }, [cat.name, count, width, height, colors.bg]);

  // Determine text layout: longer names stack vertically on tall cards
  const nameLines = cat.name.length > 16 && height >= 100 ? 2 : 1;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => {
        setHovered(true);
        console.debug(`[CategoryCard] hover: ${cat.name}`);
      }}
      onMouseLeave={() => setHovered(false)}
      style={{
        width,
        height,
        backgroundColor: hovered ? colors.bg : colors.light,
        border: `2px solid ${colors.bg}`,
        borderRadius: "12px",
        transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "scale(1.04) translateY(-2px)" : "scale(1) translateY(0)",
        boxShadow: hovered
          ? `0 8px 24px ${colors.bg}40`
          : "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "8px",
        cursor: "pointer",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Category icon */}
      <span
        style={{
          fontSize: height >= 110 ? "22px" : "18px",
          lineHeight: 1,
          filter: hovered ? "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" : "none",
          transition: "filter 200ms",
        }}
      >
        {cat.icon || "📁"}
      </span>

      {/* Category name */}
      <span
        style={{
          fontSize: height >= 120 ? (cat.name.length > 20 ? "9px" : "10px") : "9px",
          fontWeight: 700,
          color: hovered ? "#FFFFFF" : colors.bg,
          textAlign: "center",
          lineHeight: nameLines > 1 ? 1.3 : 1.4,
          letterSpacing: "0.01em",
          fontFamily: "inherit",
          pointerEvents: "none",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: nameLines > 1 ? "normal" : "nowrap",
          transition: "color 200ms",
        }}
      >
        {cat.name}
      </span>

      {/* FAQ count pill */}
      <span
        style={{
          fontSize: "9px",
          fontWeight: 800,
          color: hovered ? colors.bg : "#fff",
          backgroundColor: hovered ? "rgba(255,255,255,0.85)" : colors.bg,
          borderRadius: "20px",
          padding: "2px 7px",
          letterSpacing: "0.03em",
          pointerEvents: "none",
          transition: "all 200ms",
          boxShadow: hovered ? "none" : "0 1px 3px rgba(0,0,0,0.12)",
        }}
      >
        {count} FAQ{count !== 1 ? "s" : ""}
      </span>
    </button>
  );
}