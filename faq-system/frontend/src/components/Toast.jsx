import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const ICONS = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

let toastId = 0;
const listeners = new Set();

export function toast({ type = "info", title, message, duration = 4000 }) {
  const id = ++toastId;
  const toast = { id, type, title, message, duration };
  listeners.forEach((fn) => fn({ type: "ADD", toast }));
  if (duration > 0) {
    setTimeout(() => {
      listeners.forEach((fn) => fn({ type: "REMOVE", id }));
    }, duration);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = ({ type, toast, id }) => {
      if (type === "ADD") setToasts((prev) => [...prev, toast]);
      else if (type === "REMOVE") setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return createPortal(
    <div id="toast-root">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl px-4 py-3 shadow-xl min-w-72 max-w-sm animate-slide-in-right"
          style={{ animationDuration: "0.3s", animationFillMode: "both" }}
        >
          <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            t.type === "success" ? "bg-green-500/15 text-green-500" :
            t.type === "error" ? "bg-red-500/15 text-red-500" :
            t.type === "warning" ? "bg-amber-500/15 text-amber-500" :
            "bg-blue-500/15 text-blue-500"
          }`}>
            {ICONS[t.type]}
          </div>
          <div className="flex-1 min-w-0">
            {t.title && <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{t.title}</p>}
            {t.message && <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">{t.message}</p>}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="shrink-0 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}