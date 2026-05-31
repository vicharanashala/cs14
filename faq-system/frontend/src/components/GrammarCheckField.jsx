import { useState, useEffect, useRef, useCallback } from "react";

/* ── Wavy underline SVG for a single error segment ── */
function WavyUnderline({ color = "#EF4444", thickness = 1.5 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: "-1px",
        left: 0, right: 0,
        height: `${thickness + 2}px`,
        background: `linear-gradient(135deg, ${color}40, ${color}60)`,
        borderBottom: `${thickness}px solid ${color}`,
        borderRadius: `0 0 ${thickness}px ${thickness}px`,
        /* SVG wavy pattern */
        mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4'%3E%3Cpath d='M0 2 Q1.5 0 3 2 T6 2' stroke='black' fill='none' stroke-width='1'/%3E%3C/svg%3E\")",
        WebkitMask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4'%3E%3Cpath d='M0 2 Q1.5 0 3 2 T6 2' stroke='black' fill='none' stroke-width='1'/%3E%3C/svg%3E\")",
        maskRepeat: "repeat-x",
        WebkitMaskRepeat: "repeat-x",
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Inline error marker (wavy red underline + suggestion popup) ── */
function ErrorMarker({ error, isActive, onActivate, onDeactivate, onSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isActive) {
      const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) onDeactivate();
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isActive, onDeactivate]);

  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline-block" }}
    >
      <span
        onClick={() => isActive ? onDeactivate() : onActivate(error)}
        style={{
          cursor: "pointer",
          borderBottom: "2px dotted #EF4444",
          paddingBottom: "1px",
          color: "inherit",
          transition: "background 150ms",
          background: isActive ? "rgba(239,68,68,0.1)" : "transparent",
          borderRadius: "2px",
        }}
      >
        {/* The original word sits invisibly behind for width; the visible
            span is absolutely positioned so the underline doesn't affect layout */}
        <span aria-hidden="true" style={{ opacity: 0, pointerEvents: "none" }}>
          {error.word}
        </span>
        {/* Visible correct-colored replacement text */}
        <span style={{
          position: "relative",
          color: isActive ? "#F87171" : "#FCA5A5",
          fontWeight: 500,
        }}>
          {error.word}
        </span>
      </span>

      {/* Suggestion popup */}
      {isActive && error.suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#1E293B",
            border: "1px solid #334155",
            borderRadius: "10px",
            padding: "8px",
            minWidth: "160px",
            maxWidth: "260px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {/* Header */}
          <div style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#94A3B8",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "6px",
            padding: "0 2px",
          }}>
            Suggestions
          </div>

          {/* Suggestion buttons */}
          {error.suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSelect(sug)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "5px 8px",
                marginBottom: i < error.suggestions.length - 1 ? "2px" : 0,
                background: "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                gap: "8px",
                transition: "background 150ms",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#334155"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{
                fontSize: "13px",
                lineHeight: 1,
                filter: "drop-shadow(0 0 4px rgba(99,210,255,0.4))",
              }}>
                ✏️
              </span>
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#F1F5F9",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {sug}
              </span>
            </button>
          ))}

          {/* Dismiss */}
          <button
            onClick={onDeactivate}
            style={{
              display: "block",
              width: "100%",
              marginTop: "4px",
              padding: "4px",
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 600,
              color: "#64748B",
              letterSpacing: "0.04em",
              transition: "color 150ms, background 150ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "#1E293B"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.background = "transparent"; }}
          >
            Dismiss
          </button>

          {/* Tooltip arrow */}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #334155",
          }} />
        </div>
      )}

      {/* No suggestions indicator */}
      {isActive && error.suggestions.length === 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#1E293B",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "11px",
            color: "#94A3B8",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          No suggestions available
          <div style={{
            position: "absolute",
            top: "100%", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #334155",
          }} />
        </div>
      )}
    </span>
  );
}

/* ── Render text with error markers inline ── */
function HighlightedText({ errors, activeError, onActivate, onDeactivate, onSelect }) {
  if (!errors.length) return null;

  const sorted = [...errors].sort((a, b) => a.start - b.start);
  const segments = [];
  let prev = 0;

  for (let i = 0; i < sorted.length; i++) {
    const err = sorted[i];
    if (err.start > prev) {
      segments.push({ type: "text", content: errors[i > 0 ? i - 1 : 0] ? sorted[i - 1]?.end : 0, start: prev, end: err.start });
    }
    segments.push({ type: "error", error: err, index: i });
    prev = err.end;
  }

  // Build flat list of {text, error} items
  const flat = [];
  let cursor = 0;
  for (const err of sorted) {
    if (err.start > cursor) {
      flat.push({ type: "text", content: err.start - cursor });
    }
    flat.push({ type: "error", error: err });
    cursor = err.end;
  }
  if (cursor < errors.length) {
    // Use a big number as sentinel — handled specially below
  }

  // Actually let's just build from scratch properly
  const items = [];
  let pos = 0;
  for (const err of sorted) {
    if (err.start > pos) {
      items.push({ type: "text", text: null, length: err.start - pos });
    }
    items.push({ type: "error", error: err });
    pos = err.end;
  }

  // We render via a different approach — render full text with error spans
  // Then overlay the wavy underlines using the original text
  return null; // handled in GrammarCheckField render
}

/* ── Main component ── */
export default function GrammarCheckField({
  value,
  onChange,
  errors = [],
  onActivateError,
  onDeactivateError,
  onSelectSuggestion,
  activeError = null,
  placeholder = "Type your question here…",
  style = {},
  ...rest
}) {
  console.log("[GrammarCheckField] ★ RENDER → value length=", value?.length, "errors=", errors?.length, "errors:", errors);
  const textareaRef  = useRef(null);
  const highlightRef = useRef(null);
  const containerRef = useRef(null);
  const prevValRef   = useRef(value);

  /* Track value changes for debugging */
  useEffect(() => {
    console.log("[GCF] ★ useEffect value changed → length=", value?.length, "prev=", prevValRef.current?.length, "value=", JSON.stringify(value));
    prevValRef.current = value;
  }, [value]);

  /* ── Sync scroll between textarea and highlight overlay ── */
  const syncScroll = useCallback(() => {
    const ta  = textareaRef.current;
    const hl  = highlightRef.current;
    if (!ta || !hl) return;
    hl.scrollTop  = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
  }, []);

  /* ── Map error → React span with wavy underline ── */
  const renderHighlighted = () => {
    if (!errors.length) {
      return <span style={{ color: "transparent" }}>{value || " "}</span>;
    }

    const sorted = [...errors].sort((a, b) => a.start - b.start);
    const parts  = [];
    let cursor   = 0;

    for (const err of sorted) {
      // Text before this error
      if (err.start > cursor) {
        parts.push(
          <span key={`t-${cursor}`} style={{ color: "transparent", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {value.slice(cursor, err.start)}
          </span>
        );
      }
      // Error word with wavy underline
      const isActive = activeError?.start === err.start;
      parts.push(
        <span
          key={`e-${err.start}`}
          onClick={() => {
            if (isActive) { console.log("[GCF] deactivating error"); onDeactivateError?.(); }
            else { console.log("[GCF] activating error:", err); onActivateError?.(err); }
          }}
          style={{
            position: "relative",
            color: "transparent",
            cursor: "pointer",
            borderBottom: `2px dotted ${isActive ? "#F87171" : "#EF4444"}`,
            background: isActive ? "rgba(239,68,68,0.1)" : "transparent",
            borderRadius: "2px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {/* Show replacement text colored */}
          <span style={{
            color: isActive ? "#FCA5A5" : "#F87171",
            fontWeight: 600,
            textDecoration: isActive ? "underline" : "none",
            textDecorationStyle: "wavy",
            textDecorationColor: "#EF4444",
            textDecorationSkipInk: "none",
          }}>
            {err.word}
          </span>

          {/* Suggestion popup */}
          {isActive && (
            <>
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                background: "#0F172A",
                border: "1px solid #334155",
                borderRadius: "10px",
                padding: "8px",
                minWidth: "170px",
                maxWidth: "270px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
              }}>
                <div style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "#64748B",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                  paddingLeft: "2px",
                }}>
                  Did you mean?
                </div>

                {err.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); console.log("[GCF] suggestion clicked:", err, "→", sug); onSelectSuggestion?.(err, sug); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "6px 8px",
                      marginBottom: i < err.suggestions.length - 1 ? "2px" : 0,
                      background: "transparent",
                      border: "none",
                      borderRadius: "7px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1E293B"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "13px", lineHeight: 1 }}>✏️</span>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#F8FAFC",
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      {sug}
                    </span>
                  </button>
                ))}

                {err.suggestions.length === 0 && (
                  <div style={{
                    fontSize: "12px",
                    color: "#64748B",
                    padding: "4px 4px 2px",
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}>
                    No suggestions
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); onDeactivateError?.(); }}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "5px",
                    padding: "4px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#475569",
                    letterSpacing: "0.04em",
                    transition: "color 150ms",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#94A3B8"}
                  onMouseLeave={e => e.currentTarget.style.color = "#475569"}
                >
                  Ignore
                </button>

                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderTop: "7px solid #334155",
                }} />
              </div>

              {/* Backdrop to catch clicks outside */}
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9998,
                }}
                onClick={() => onDeactivateError?.()}
              />
            </>
          )}
        </span>
      );

      cursor = err.end;
    }

    // Trailing text
    if (cursor < value.length) {
      parts.push(
        <span key={`t-${cursor}`} style={{ color: "transparent", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {value.slice(cursor)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", ...style }}
    >
      {/* Highlight overlay — sits behind the textarea but shows wavy underlines */}
      <div
        ref={highlightRef}
        onClick={() => {}}
        style={{
          position: "absolute",
          inset: 0,
          padding: style.padding || "10px 14px",
          fontSize: style.fontSize || "14px",
          lineHeight: style.lineHeight || "1.6",
          fontFamily: "'Inter', system-ui, sans-serif",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflow: "hidden",
          pointerEvents: "none",
          borderRadius: typeof style.borderRadius !== "undefined" ? style.borderRadius : "8px",
          color: "transparent",
        }}
      >
        {renderHighlighted()}
      </div>

      {/* Actual textarea — fully transparent so highlight shows through */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        rows={4}
        style={{
          ...style,
          color: errors.length ? "rgba(0,0,0,0)" : (style.color || "inherit"),
          caretColor: "auto",
          background: "transparent",
          position: "relative",
          zIndex: 1,
          resize: "vertical",
          // Keep all user-given styles
          width: style.width || "100%",
          minHeight: style.minHeight || "100px",
          fontSize: style.fontSize || "14px",
          lineHeight: style.lineHeight || "1.6",
          padding: style.padding || "10px 14px",
          borderRadius: style.borderRadius || "8px",
        }}
        {...rest}
      />

      {/* Status bar: error count */}
      {errors.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          marginTop: "5px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#EF4444",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "20px",
            padding: "2px 8px",
          }}>
            <span>⚠️</span>
            <span>{errors.length} typo{errors.length !== 1 ? "s" : ""} found — click to fix</span>
          </span>
        </div>
      )}
    </div>
  );
}