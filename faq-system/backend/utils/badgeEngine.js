/**
 * badgeEngine.js — stat-based badge award logic
 * Call checkAndAwardBadges(userId) whenever a user's stats change.
 * Returns { awarded: [badge names], alreadyHas: [badge names] }
 */

const UserProfile = require("../models/UserProfile");
const Badge = require("../models/Badge");

// ─── Badge definitions ──────────────────────────────────────────
const BADGE_DEFS = [
  { name: "First Question",   statKey: "questionsAsked",  threshold: 1,  icon: "🙋", tier: "bronze",  description: "Asked your first question" },
  { name: "First Answer",     statKey: "answersGiven",    threshold: 1,  icon: "💬", tier: "bronze",  description: "Gave your first answer" },
  { name: "Verified Contributor", statKey: "answersAccepted", threshold: 1, icon: "✅", tier: "silver", description: "Had an answer accepted" },
  { name: "Helping Hand",     statKey: "answersGiven",    threshold: 5,  icon: "🤝", tier: "silver",  description: "Gave 5 or more answers" },
  { name: "Problem Solver",   statKey: "answersAccepted", threshold: 3,  icon: "🛠️", tier: "silver",  description: "Had 3 or more answers accepted" },
  { name: "Popular Voice",    statKey: "upvotesReceived", threshold: 10, icon: "⬆️", tier: "gold",    description: "Received 10 or more upvotes" },
  { name: "Community Champion", statKey: "answersAccepted", threshold: 10, icon: "🏆", tier: "gold",   description: "Had 10 or more answers accepted" },
  { name: "Top Contributor",  statKey: "answersGiven",    threshold: 20, icon: "🌟", tier: "platinum", description: "Gave 20 or more answers" },
];

async function checkAndAwardBadges(userId) {
  const log = (msg) => console.log(`[badgeEngine] ${msg}`);

  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = new UserProfile({ userId });
    await profile.save();
    log(`Created new UserProfile for userId=${userId}`);
  }

  // Ensure stats object exists
  if (!profile.stats) {
    profile.stats = { questionsAsked: 0, answersGiven: 0, answersAccepted: 0, upvotesReceived: 0 };
  }

  const currentBadges = new Set(profile.badges.map((b) => b.toString()));
  const existingBadgeNames = new Set();
  const toAward = [];

  // Find all badges the user doesn't have yet and qualifies for
  for (const def of BADGE_DEFS) {
    const badge = await Badge.findOne({ name: def.name });
    if (!badge) {
      log(`WARNING: Badge '${def.name}' not found in DB — skipping`);
      continue;
    }

    const alreadyHas = currentBadges.has(badge._id.toString());
    existingBadgeNames.add(def.name);

    if (alreadyHas) {
      log(`'${def.name}': already has`);
      continue;
    }

    const statVal = profile.stats[def.statKey] || 0;
    if (statVal >= def.threshold) {
      log(`QUALIFIES: '${def.name}' (${def.statKey}=${statVal} >= ${def.threshold})`);
      toAward.push(badge);
    } else {
      log(`NOT YET: '${def.name}' (${def.statKey}=${statVal} < ${def.threshold})`);
    }
  }

  if (toAward.length > 0) {
    for (const badge of toAward) {
      profile.badges.push(badge._id);
      profile.points = (profile.points || 0) + (badge.points || 0);
      log(`AWARDED: '${badge.name}' (+${badge.points} pts) to userId=${userId}`);
    }
    await profile.save();
  }

  return {
    awarded: toAward.map((b) => b.name),
    alreadyHas: [...existingBadgeNames],
    profile,
  };
}

module.exports = { checkAndAwardBadges, BADGE_DEFS };