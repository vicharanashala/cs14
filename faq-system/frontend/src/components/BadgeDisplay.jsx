/**
 * BadgeDisplay — colored emoji pill badges
 * Props:
 *   badges: array of { name, icon, tier }  (from populated UserProfile)
 *   showCount: boolean — if true and badges.length > 3, show "+N more"
 *   size: "sm" | "md"
 */

const TIER_COLORS = {
  bronze:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  silver:  "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  gold:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-400 dark:border-yellow-600",
  platinum:"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-600",
};

const SIZE_CLASSES = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
};

export default function BadgeDisplay({ badges = [], showCount = true, size = "sm" }) {
  if (!badges.length) return null;

  const visible = showCount ? badges.slice(0, 3) : badges;
  const extra = badges.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((badge) => (
        <span
          key={badge.name}
          title={`${badge.name}: ${badge.description || ""}`}
          className={`
            inline-flex items-center rounded-full border font-bold font-display
            ${TIER_COLORS[badge.tier] || TIER_COLORS.bronze}
            ${SIZE_CLASSES[size]}
          `}
        >
          <span>{badge.icon || "🏅"}</span>
          <span>{badge.name}</span>
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[10px] text-[rgb(var(--text-tertiary))] font-display font-bold">
          +{extra} more
        </span>
      )}
    </div>
  );
}