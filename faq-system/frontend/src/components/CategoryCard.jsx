import { useState, useEffect, useRef } from "react";

/* ── Palette: saturated enough to pop on dark, not neon ── */
const PALETTE = {
  "About the Internship":      { hue: 214, sat: 62, light: 56 },  // blue
  "Timing and Dates":          { hue: 30,  sat: 88, light: 64 },  // amber
  "NOC":                       { hue: 168, sat: 58, light: 42 },  // teal
  "Selection and Offer Letter":{ hue: 14,  sat: 72, light: 58 },  // red-orange
  "Work and Mentorship":       { hue: 268, sat: 40, light: 48 },  // muted purple
  "Communication Channels":    { hue: 204, sat: 78, light: 48 },  // sky blue
  "Interviews":                { hue: 357, sat: 100,light: 61 },  // coral red
  "Certificate":               { hue: 48,  sat: 100,light: 62 },  // golden yellow
  "Rosetta":                   { hue: 88,  sat: 74, light: 52 },  // lime green
  "Phase 1 and Coursework":    { hue: 104, sat: 52, light: 44 },  // forest green
  "Yaksha Chat":               { hue: 356, sat: 60, light: 50 },  // crimson
  "ViBe Platform":             { hue: 43,  sat: 82, light: 68 },  // warm gold
  "Team Formation":            { hue: 203, sat: 48, light: 50 },  // slate blue
};

const DEFAULT_PALETTE = { hue: 210, sat: 20, light: 55 };

function hsl(h, s, l, a = 1) {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

/* Scale count → width/height (treemap) */
function dims(count) {
  const t = Math.min(count / 18, 1);
  return {
    w: Math.round(110 + t * 170),   // 110–280 px
    h: Math.round(64  + t * 82),    //  64–146 px
  };
}

/* ── Framer-inspired cubic-bezier for snappy feel ── */
const EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // slight overshoot
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

/* Stagger delay (ms) per card index */
const STAGGER_BASE = 60;

export default function CategoryCard({ cat, count, index = 0 }) {
  const [hovered, setHovered]   = useState(false);
  const [entered, setEntered]   = useState(false);
  const ref = useRef(null);

  const p    = PALETTE[cat.name] || DEFAULT_PALETTE;
  const { w, h } = dims(count);

  /* Entrance: stagger-fade + scale up on mount */
  useEffect(() => {
    const delay = index * STAGGER_BASE;
    const timer = setTimeout(() => setEntered(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

  /* Scroll-triggered entrance via IntersectionObserver */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setEntered(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bgColor      = hsl(p.hue, p.sat, p.light);
  const bgColorDim   = hsl(p.hue, p.sat, p.light * 0.75);
  const bgGlassLight = hsl(p.hue, p.sat * 0.5, p.light * 1.5, 0.12);
  const bgGlassDark  = hsl(p.hue, p.sat * 0.8, p.light * 0.5, 0.25);
  const textOnHover  = hsl(p.hue, 30, 98);
  const textNative   = hsl(p.hue, p.sat * 0.7, 92);
  const borderColor  = hsl(p.hue, p.sat, p.light * 0.9, 0.5);
  const glowColor    = hsl(p.hue, p.sat, p.light, 0.35);
  const pillBg       = hsl(p.hue, p.sat * 0.6, p.light * 1.1);
  const pillText     = hsl(p.hue, p.sat, p.light * 0.3);

  const fontSize = h >= 130 ? "11px" : h >= 100 ? "10px" : "9px";
  const iconSize = h >= 120 ? "24px" : "19px";
  const nameLong = cat.name.length > 18;
  const tallCard = h >= 100;

  return (
    <button
      ref={ref}
      onClick={() => window.location.href = `/faqs/${encodeURIComponent(cat.name)}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      /* Entrance animation: fade + scale from 0.85 → 1 */
      style={{
        position: "relative",
        width: w,
        height: h,
        flexShrink: 0,
        cursor: "pointer",
        border: "none",
        borderRadius: "16px",
        outline: "none",
        overflow: "visible",
        padding: 0,

        /* glassmorphism: dark frosted bg */
        background: hovered
          ? `linear-gradient(135deg, ${bgColor}dd, ${bgColorDim}cc)`
          : `linear-gradient(135deg, ${hsl(p.hue, p.sat, 18, 0.85)}, ${hsl(p.hue, p.sat * 0.7, 12, 0.9)})`,

        /* fine border — brutalist edge */
        boxShadow: hovered
          ? `0 0 0 1.5px ${borderColor}, 0 12px 40px ${glowColor}, 0 0 60px ${glowColor}40`
          : `0 0 0 1px ${hsl(p.hue, p.sat, 30, 0.25)}, 0 4px 16px rgba(0,0,0,0.4)`,

        /* subtle brutalist: diagonal accent line */
        clipPath: hovered
          ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",

        transform: hovered
          ? `scale(1.06) translateY(-3px)`
          : entered
            ? "scale(1) translateY(0)"
            : "scale(0.88) translateY(8px)",

        opacity: entered ? (hovered ? 1 : 0.92) : 0,

        transition: [
          `transform 380ms ${EASING}`,
          `opacity 400ms ${EASE_OUT}`,
          `box-shadow 300ms ease`,
          `background 300ms ease`,
        ].join(", "),
      }}
    >
      {/* Brutalist: top-left geometric accent */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "36px", height: "36px",
        background: hovered ? "transparent" : hsl(p.hue, p.sat, p.light, 0.15),
        borderRight: `1px solid ${hsl(p.hue, p.sat, p.light, 0.2)}`,
        borderBottom: `1px solid ${hsl(p.hue, p.sat, p.light, 0.2)}`,
        borderRadius: "0 0 10px 0",
        transition: "all 300ms ease",
        zIndex: 1,
      }} />

      {/* Glass shimmer overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "16px",
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)`
          : `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)`,
        transition: "all 350ms ease",
        pointerEvents: "none",
      }} />

      {/* Glassmorphism: blurred frosted bar behind content */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "16px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: bgGlassDark,
        border: `1px solid ${hsl(p.hue, p.sat, p.light, 0.18)}`,
        opacity: hovered ? 0 : 0.6,
        transition: "opacity 350ms ease",
        pointerEvents: "none",
      }} />

      {/* Content stack */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: tallCard ? "6px" : "4px",
        padding: "10px 8px",
      }}>
        {/* Icon */}
        <span style={{
          fontSize: iconSize,
          lineHeight: 1,
          filter: hovered
            ? `drop-shadow(0 0 8px ${bgColor})`
            : `drop-shadow(0 1px 3px rgba(0,0,0,0.5))`,
          transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
          transition: `transform 350ms ${EASING}, filter 300ms ease`,
          display: "block",
        }}>
          {cat.icon || "📁"}
        </span>

        {/* Category name */}
        <span style={{
          fontSize,
          fontWeight: 700,
          letterSpacing: "0.025em",
          color: hovered ? textOnHover : textNative,
          textAlign: "center",
          lineHeight: 1.4,
          maxWidth: "92%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: nameLong && tallCard ? "normal" : "nowrap",
          fontFamily: "'Inter', system-ui, sans-serif",
          textShadow: hovered ? `0 1px 6px ${glowColor}` : "none",
          transition: "color 280ms ease, text-shadow 280ms ease",
          pointerEvents: "none",
        }}>
          {cat.name}
        </span>

        {/* FAQ count pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          background: hovered
            ? `rgba(255,255,255,0.9)`
            : `linear-gradient(135deg, ${hsl(p.hue, p.sat, p.light, 0.85)}, ${hsl(p.hue, p.sat * 0.8, p.light * 0.75, 0.9)})`,
          borderRadius: "20px",
          padding: "2px 9px",
          boxShadow: hovered
            ? `0 2px 8px rgba(0,0,0,0.25)`
            : `0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)`,
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: `all 300ms ${EASING}`,
          marginTop: "2px",
        }}>
          <span style={{
            fontSize: "8px",
            fontWeight: 900,
            letterSpacing: "0.05em",
            color: hovered ? pillText : hsl(p.hue, 20, 98),
            fontFamily: "'Inter', system-ui, sans-serif",
            pointerEvents: "none",
          }}>
            {count}
          </span>
          <span style={{
            fontSize: "8px",
            fontWeight: 600,
            color: hovered ? pillText : hsl(p.hue, 20, 95),
            fontFamily: "'Inter', system-ui, sans-serif",
            pointerEvents: "none",
          }}>
            FAQ{count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Hover: glowing bottom line accent */}
      <div style={{
        position: "absolute",
        bottom: 0, left: "15%", right: "15%",
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${textOnHover}90, transparent)`,
        borderRadius: "2px 2px 0 0",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transition: "all 350ms ease",
      }} />

      {/* Large faded category initial behind content (brutalist touch) */}
      <div style={{
        position: "absolute",
        bottom: "-4px",
        right: "6px",
        fontSize: tallCard ? "38px" : "28px",
        fontWeight: 900,
        color: hsl(p.hue, p.sat, p.light, hovered ? 0.15 : 0.07),
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: 1,
        userSelect: "none",
        pointerEvents: "none",
        transition: "color 350ms ease",
        zIndex: 1,
      }}>
        {cat.name.charAt(0)}
      </div>
    </button>
  );
}