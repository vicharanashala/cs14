/**
 * UserBadgeChip — shows a colored league-tier indicator
 * Used next to usernames in Navbar and DiscussionPage answer headers
 * Platinum > Gold > Silver > Bronze — shows the highest tier only
 */
import { useState, useEffect } from "react";
import api from "../api/axios";

const TIER_STYLES = {
  platinum: {
    label: "Platinum",
    bg: "from-gray-300 via-gray-100 to-gray-300",
    text: "text-gray-700",
    border: "border-gray-400",
    dot: "bg-gradient-to-br from-gray-300 to-gray-500",
    shadow: "shadow-gray-400/50",
  },
  gold: {
    label: "Gold",
    bg: "from-yellow-400 via-amber-200 to-yellow-400",
    text: "text-amber-800",
    border: "border-yellow-500",
    dot: "bg-gradient-to-br from-yellow-400 to-amber-500",
    shadow: "shadow-amber-400/50",
  },
  silver: {
    label: "Silver",
    bg: "from-gray-300 via-slate-200 to-gray-300",
    text: "text-gray-600",
    border: "border-gray-400",
    dot: "bg-gradient-to-br from-gray-300 to-gray-400",
    shadow: "shadow-gray-400/50",
  },
  bronze: {
    label: "Bronze",
    bg: "from-orange-400 via-orange-300 to-orange-400",
    text: "text-orange-800",
    border: "border-orange-500",
    dot: "bg-gradient-to-br from-orange-400 to-orange-600",
    shadow: "shadow-orange-400/50",
  },
};

const TIERS = ["platinum", "gold", "silver", "bronze"];

export default function UserBadgeChip({ userId, className = "" }) {
  const [league, setLeague] = useState(null); // null = no badge

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    api
      .get(`/users/${userId}/profile`)
      .then((res) => {
        if (cancelled) return;
        const badges = res.data?.badges || [];
        if (!badges.length) return;

        // Pick highest tier
        let highest = null;
        for (const t of TIERS) {
          if (badges.some((b) => b.tier?.toLowerCase() === t)) {
            highest = t;
            break;
          }
        }
        setLeague(highest);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!league) return null;

  const style = TIER_STYLES[league];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {/* League dot */}
      <span
        className={`w-2 h-2 rounded-full ${style.dot} shadow-[0_0_4px_1px_var(--tw-shadow-color)] ${style.shadow}`}
        style={{ boxShadow: `0 0 4px 1px ${league === "platinum" ? "#9CA3AF" : league === "gold" ? "#F59E0B" : league === "silver" ? "#9CA3AF" : "#EA580C"}` }}
        title={`${style.label} League`}
      />
    </span>
  );
}