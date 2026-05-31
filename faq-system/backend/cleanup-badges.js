require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
require("./server");

const PHANTOMS = [
  "Community Pillar",
  "Curious Mind",
  "Expert Answer",
  "Hall of Fame",
  "Helpful Hand",
  "Rising Star",
];

setTimeout(async () => {
  const Badge = require("./models/Badge");
  const r = await Badge.deleteMany({ name: { $in: PHANTOMS } });
  console.log("Deleted phantoms:", r.deletedCount);
  const remaining = await Badge.find().sort({ name: 1 });
  console.log("Remaining:", remaining.map((x) => x.name).join(", "));
  process.exit(0);
}, 500);