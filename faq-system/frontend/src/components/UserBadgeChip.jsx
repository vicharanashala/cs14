/**
 * UserBadgeChip — shows username + badge count
 * Used next to answer authors in DiscussionPage and in Navbar
 */
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function UserBadgeChip({ userId, username, className = "" }) {
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    api.get(`/users/${userId}/profile`)
      .then((res) => {
        if (!cancelled && res.data?.badges?.length) {
          setBadgeCount(res.data.badges.length);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-[rgb(var(--text-secondary))] ${className}`}>
      <span className="font-semibold text-[rgb(var(--text-primary))]">{username}</span>
      {badgeCount > 0 && (
        <span className="inline-flex items-center gap-0.5 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[rgb(var(--color-primary))]/20">
          🏅{badgeCount}
        </span>
      )}
    </span>
  );
}