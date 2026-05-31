import { useState, useEffect, useRef } from "react";

/* ── HSL palette (unchanged) ── */
const PALETTE = {
  "About the Internship":      { h: 214, s: 62, l: 56 },
  "Timing and Dates":          { h: 30,  s: 88, l: 64 },
  "NOC":                       { h: 168, s: 58, l: 42 },
  "Selection and Offer Letter":{ h: 14,  s: 72, l: 58 },
  "Work and Mentorship":       { h: 268, s: 40, l: 48 },
  "Communication Channels":    { h: 204, s: 78, l: 48 },
  "Interviews":                { h: 357, s: 100,l: 61 },
  "Certificate":               { h: 48,  s: 100,l: 62 },
  "Rosetta":                   { h: 88,  s: 74, l: 52 },
  "Phase 1 and Coursework":    { h: 104, s: 52, l: 44 },
  "Yaksha Chat":               { h: 356, s: 60, l: 50 },
  "ViBe Platform":             { h: 43,  s: 82, l: 68 },
  "Team Formation":            { h: 203, s: 48, l: 50 },
};
const DEFAULT_P = { h: 210, s: 20, l: 55 };

function hsl(h, s, l, a = 1) { return `hsla(${h},${s}%,${l}%,${a})`; }

const EASING    = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE_OUT  = "cubic-bezier(0.16, 1, 0.3, 1)";
const PAD       = 24;   // container inner padding
const BUBBLE_GAP = 10;  // minimum px between bubble edges

/* Radius: 36px min → 90px max (25% larger than before) */
function bubRadius(count, max) {
  const minR = 36, maxR = 90;
  if (max === 0) return minR;
  return Math.round(minR + (count / max) * (maxR - minR));
}

/* ── Packed-circle layout with centered cluster ── */
function computeLayout(categories, containerW, containerH) {
  if (!categories.length) return [];

  const max = Math.max(...categories.map(c => c.count), 1);

  // Assign radii
  const bubbles = categories.map(c => ({
    ...c,
    r: bubRadius(c.count, max),
    placed: false,
    x: 0, y: 0,
  }));

  bubbles.sort((a, b) => b.r - a.r); // big ones first

  // Place first bubble at center
  bubbles[0].x = containerW / 2;
  bubbles[0].y = containerH / 2;
  bubbles[0].placed = true;

  let placedCount = 1;
  let attempt = 0;

  while (placedCount < bubbles.length && attempt < 5000) {
    attempt++;
    const b = bubbles[placedCount];

    let found = false;
    const step = 14;
    const maxDist = Math.max(containerW, containerH);

    for (let dist = b.r + 20; dist < maxDist; dist += step) {
      const angles = Math.min(placedCount * 3, 48);
      for (let ai = 0; ai < angles; ai++) {
        const angle = (ai / angles) * Math.PI * 2;
        const cx = containerW / 2 + dist * Math.cos(angle);
        const cy = containerH / 2 + dist * Math.sin(angle);

        // Must fit inside container with padding
        if (cx - b.r < PAD || cx + b.r > containerW - PAD) continue;
        if (cy - b.r < PAD || cy + b.r > containerH - PAD) continue;

        // No overlap
        let ok = true;
        for (let j = 0; j < placedCount; j++) {
          const p = bubbles[j];
          const dx = cx - p.x, dy = cy - p.y;
          const minD = b.r + p.r + BUBBLE_GAP;
          if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
        }

        if (ok) {
          b.x = cx; b.y = cy; b.placed = true;
          placedCount++;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      // Place at outer edge anyway (fallback)
      const angle = (placedCount * 2.4);
      const dist  = Math.max(containerW, containerH) * 0.48;
      b.x = containerW / 2 + dist * Math.cos(angle);
      b.y = containerH / 2 + dist * Math.sin(angle);
      b.placed = true;
      placedCount++;
    }
  }

  // Compute bounding box to fine-center the whole cluster
  const xs = bubbles.map(b => b.x), ys = bubbles.map(b => b.y);
  const minX = Math.min(...bubbles.map(b => b.x - b.r));
  const maxX = Math.max(...bubbles.map(b => b.x + b.r));
  const minY = Math.min(...bubbles.map(b => b.y - b.r));
  const maxY = Math.max(...bubbles.map(b => b.y + b.r));

  const clusterW = maxX - minX, clusterH = maxY - minY;
  const shiftX   = (containerW - clusterW) / 2 - minX;
  const shiftY   = (containerH - clusterH) / 2 - minY;

  return bubbles.map(b => ({ ...b, x: b.x + shiftX, y: b.y + shiftY }));
}

/* ── Single Bubble ── */
function Bubble({ cat, r, x, y, index }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  const p   = PALETTE[cat.name] || DEFAULT_P;
  const bg  = hsl(p.h, p.s, p.l);
  const bg2 = hsl(p.h, p.s * 0.65, p.l * 0.55);
  const bg3 = hsl(p.h, p.s * 0.3,  p.l * 0.45);
  const glow= hsl(p.h, p.s, p.l, 0.5);
  const borderClear = hsl(p.h, p.s, p.l * 1.2, 0.8);
  const textBright  = hsl(p.h, 18, 96);
  const textDim     = hsl(p.h, 30, 80);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 50);
    return () => clearTimeout(t);
  }, [index]);

  // Scroll-trigger
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); obs.disconnect(); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Font sizes scaled to bubble
  const iconSize = Math.max(13, Math.min(Math.round(r * 0.38), 30));
  const nameSize = r >= 70 ? "11px" : r >= 55 ? "10px" : r >= 42 ? "9px" : "8px";
  const pillSize = r >= 55 ? "9px" : "8px";
  const canWrap  = r >= 50;

  // Split long names into lines that fit the bubble width
  const maxCharsPerLine = canWrap
    ? Math.floor((r * 1.7) / (nameSize === "11px" ? 6.5 : nameSize === "10px" ? 6 : 5.5))
    : 999;
  const lines = [];
  if (canWrap) {
    const words = cat.name.split(" ");
    let line = "";
    for (const word of words) {
      if ((line + " " + word).trim().length <= maxCharsPerLine) {
        line = (line + " " + word).trim();
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    if (lines.length > 3) lines.length = 3; // cap at 3 lines
  }

  return (
    <button
      ref={ref}
      onClick={() => { window.location.href = `/faqs/${encodeURIComponent(cat.name)}`; }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        width:  r * 2,
        height: r * 2,
        borderRadius: "50%",
        left: 0, top: 0,
        transform: `translate(${x - r}px, ${y - r}px) scale(${visible ? 1 : 0}) ${hovered ? "scale(1.07)" : "scale(1)"}`,
        opacity: visible ? (hovered ? 1 : 0.9) : 0,
        zIndex: hovered ? 20 : 1,
        transition: [
          `transform 380ms ${visible ? EASING : "ease"}`,
          `opacity 450ms ${EASE_OUT}`,
          `box-shadow 280ms ease`,
          `background 300ms ease`,
          `z-index 0ms`,
        ].join(", "),

        /* glassmorphism */
        background: hovered
          ? `radial-gradient(circle at 30% 30%, ${hsl(p.h, p.s, p.l * 1.18)}, ${bg2})`
          : `radial-gradient(circle at 50% 44%, ${bg2}, ${bg3})`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",

        boxShadow: hovered
          ? [
              `0 0 0 2px ${borderClear}`,
              `0 12px 48px ${glow}`,
              `0 0 80px ${hsl(p.h, p.s, p.l, 0.22)}`,
            ].join(", ")
          : [
              `0 0 0 1px ${hsl(p.h, p.s, p.l * 1.2, 0.35)}`,
              `0 6px 24px rgba(0,0,0,0.5)`,
              `inset 0 1px 0 rgba(255,255,255,0.1)`,
            ].join(", "),

        border: "none",
        outline: "none",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: r >= 58 ? "5px" : "3px",
        padding: "6px 4px",
      }}
    >
      {/* Top-left glass shimmer */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "45%",
        borderRadius: "50% 50% 0 0",
        background: `linear-gradient(160deg, rgba(255,255,255,0.12) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Icon */}
      <span style={{
        fontSize: iconSize,
        lineHeight: 1,
        display: "block",
        filter: hovered
          ? `drop-shadow(0 0 8px ${bg}) brightness(1.25)`
          : "drop-shadow(0 1px 3px rgba(0,0,0,0.45))",
        transform: hovered ? "scale(1.15)" : "scale(1)",
        transition: `transform 340ms ${EASING}, filter 250ms ease`,
      }}>
        {cat.icon || "📁"}
      </span>

      {/* Name — wrapping or single line */}
      {canWrap && lines.length > 1 ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1px",
          maxWidth: r * 1.65,
        }}>
          {lines.map((line, li) => (
            <span key={li} style={{
              fontSize: nameSize,
              fontWeight: 700,
              color: hovered ? textBright : textDim,
              textAlign: "center",
              lineHeight: 1.35,
              fontFamily: "'Inter', system-ui, sans-serif",
              textShadow: hovered ? `0 1px 6px rgba(0,0,0,0.3)` : "none",
              transition: "color 250ms ease",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}>
              {line}
            </span>
          ))}
        </div>
      ) : (
        <span style={{
          fontSize: nameSize,
          fontWeight: 700,
          color: hovered ? textBright : textDim,
          textAlign: "center",
          lineHeight: 1.4,
          maxWidth: r * 1.65,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: canWrap ? "normal" : "nowrap",
          fontFamily: "'Inter', system-ui, sans-serif",
          textShadow: hovered ? `0 1px 6px rgba(0,0,0,0.3)` : "none",
          transition: "color 250ms ease",
          pointerEvents: "none",
        }}>
          {cat.name}
        </span>
      )}

      {/* FAQ pill badge */}
      <div style={{
        background: hovered
          ? "rgba(255,255,255,0.92)"
          : `linear-gradient(135deg, ${hsl(p.h, p.s, p.l, 0.88)}, ${hsl(p.h, p.s * 0.75, p.l * 0.7, 0.92)})`,
        borderRadius: "20px",
        padding: "1px 8px",
        transform: hovered ? "scale(1.12)" : "scale(1)",
        transition: `transform 280ms ${EASING}, background 250ms ease`,
        boxShadow: hovered
          ? "0 3px 10px rgba(0,0,0,0.28)"
          : "0 1px 3px rgba(0,0,0,0.22)",
      }}>
        <span style={{
          fontSize: pillSize,
          fontWeight: 900,
          letterSpacing: "0.03em",
          color: hovered ? hsl(p.h, 55, 28) : hsl(p.h, 12, 97),
          fontFamily: "'Inter', system-ui, sans-serif",
          pointerEvents: "none",
        }}>
          {cat.count} FAQ{cat.count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Outer glow ring on hover */}
      <div style={{
        position: "absolute",
        inset: -5,
        borderRadius: "50%",
        border: `1.5px solid ${hsl(p.h, p.s, p.l, hovered ? 0.45 : 0)}`,
        transition: "border-color 300ms ease",
        pointerEvents: "none",
      }} />
    </button>
  );
}

/* ── Bubble Cloud Container ── */
export default function CategoryBubble({ categories }) {
  const wrapRef = useRef(null);
  const [layout, setLayout] = useState([]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function recompute() {
      const w = el.clientWidth  || 800;
      const h = el.clientHeight || 340;

      const packed = computeLayout(
        categories.map(c => ({ ...c, count: c.count || 0 })),
        w, h
      );
      setLayout(packed);
    }

    recompute();

    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories]);

  const totalH = layout.length
    ? Math.max(...layout.map(b => b.y + b.r)) + PAD
    : 340;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "320px",
        height: `${totalH}px`,
        overflow: "visible",
      }}
    >
      {layout.map((b, i) => (
        <Bubble
          key={b.name}
          cat={{ ...b, icon: categories.find(c => c.name === b.name)?.icon || "📁" }}
          r={b.r}
          x={b.x}
          y={b.y}
          index={i}
        />
      ))}
    </div>
  );
}