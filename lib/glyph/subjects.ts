/**
 * Curated geometric recipes for high-recognition subjects.
 * Used as a free visual plan when the prompt matches — skips the LLM planner.
 *
 * For monochrome Glyph output: map "black/white/orange" → currentColor + opacity
 * (e.g. belly = fill currentColor opacity 0.25, or cutout with fill=none stroke).
 */

type SubjectEntry = {
  /** Match if any alias appears in the prompt (longest match wins). */
  aliases: string[];
  /** Concrete geometry the drawer must follow. */
  plan: string;
};

const SUBJECTS: SubjectEntry[] = [
  {
    aliases: [
      "linux penguin",
      "tux penguin",
      "tux the penguin",
      "linux tux",
      "linux",
      "tux",
    ],
    plan: `SUBJECT: Tux the Linux penguin (iconic, simple, recognizable at 24×24)
Elements (draw ALL of these):
1. BODY — rounded oval / teardrop, center ~(12,14), width ~10, height ~11. Wider at bottom.
2. BELLY — smaller oval inside body, center ~(12,15), width ~5.5, height ~7. Lighter (outline: leave empty / solid: opacity 0.25).
3. HEAD — circle or rounded oval on top of body, center ~(12,7), radius ~3.5–4. Connected to body (no gap).
4. EYES — two small dots/circles near top of head ~(10.2,6) and ~(13.8,6), r≈0.7.
5. BEAK — small downward/forward triangle between eyes at ~(12,7.5).
6. WINGS — two small rounded shapes on body sides ~(7.5,13) and ~(16.5,13).
7. FEET — two small shapes at bottom ~(9.5,21) and ~(14.5,21), pointing slightly outward.
Composition: penguin facing slightly right or front. Optical center ≈ (12,13).
DO NOT draw abstract circles or logos — this must read as a penguin.`,
  },
  {
    aliases: ["penguin"],
    plan: `SUBJECT: Simple penguin silhouette
1. Teardrop/oval body centered ~(12,14)
2. Lighter oval belly inside
3. Round head on top ~(12,7)
4. Tiny beak
5. Flipper arms on sides
6. Two feet at bottom
Must be immediately recognizable as a penguin at 16px.`,
  },
  {
    aliases: ["github", "octocat"],
    plan: `SUBJECT: GitHub Octocat (simplified)
1. Circle head center ~(12,10), r≈5
2. Two pointed triangular cat ears on top of head
3. Simple face: two eye dots
4. Tentacle/leg shapes hanging from bottom of head (3–5 curves)
Keep iconic — not a realistic cat.`,
  },
  {
    aliases: ["react"],
    plan: `SUBJECT: React atom logo
1. Three ellipses around center (12,12), rotated roughly 0°, 60°, 120°
2. Shared center point
3. Small filled circle at exact center (12,12), r≈1.2
All stroke (except center fill). No other decoration.`,
  },
  {
    aliases: ["nextjs", "next.js", "next js"],
    plan: `SUBJECT: Next.js mark
Preferred: circle outline + bold geometric "N" (two verticals + one diagonal) inside.
Alt: circle with N path only. Clean sans geometry.`,
  },
  {
    aliases: ["typescript", "ts logo"],
    plan: `SUBJECT: TypeScript "TS"
Rounded square (rx≈2) from ~(3,3) to ~(21,21), filled or stroked.
Letters "TS" as simple paths centered inside. Bold, geometric.`,
  },
  {
    aliases: ["docker"],
    plan: `SUBJECT: Docker whale (simplified)
1. Horizontal whale body (rounded rect/path) mid-lower canvas
2. Stack of 2–3 small squares (containers) on the whale's back
3. Tiny eye + spout optional
Must read as whale + boxes.`,
  },
  {
    aliases: ["apple"],
    plan: `SUBJECT: Apple logo silhouette
1. Apple body as smooth closed path, bitten on right side
2. Small leaf stem on top
Solid fill or outline — classic silhouette, not a realistic fruit drawing.`,
  },
  {
    aliases: ["android"],
    plan: `SUBJECT: Android robot
1. Rounded head with two antenna sticks
2. Two eye dots
3. Body as rounded rect under head
4. Arms + legs as rounded sticks
Iconic green-bot silhouette in currentColor.`,
  },
  {
    aliases: ["twitter", "x.com", " x "],
    plan: `SUBJECT: X / Twitter mark
Two bold diagonal strokes crossing to form an "X", optically centered.
No bird. Clean geometric X only.`,
  },
  {
    aliases: ["youtube"],
    plan: `SUBJECT: YouTube play mark
Rounded rectangle (TV shape) + filled triangle play button pointing right in center.`,
  },
  {
    aliases: ["discord"],
    plan: `SUBJECT: Discord Clyde (simplified)
Game-controller-like face: rounded blob with two eye cutouts and smile.
Keep abstract/mascot, not a photoreal face.`,
  },
  {
    aliases: ["vscode", "vs code", "visual studio code"],
    plan: `SUBJECT: VS Code icon
Angular ribbon / sideways "V" or chevron shapes forming the VS Code mark.
Geometric, pointed, recognizable.`,
  },
  {
    aliases: ["npm"],
    plan: `SUBJECT: npm cube wordmark
Cube/square with "n" style cut — classic npm logo geometry simplified to 24×24.`,
  },
  {
    aliases: ["heart", "love"],
    plan: `SUBJECT: Heart
Classic heart path: two lobes on top, point at bottom center ~(12,20).
Symmetrical, optically centered.`,
  },
  {
    aliases: ["star"],
    plan: `SUBJECT: 5-point star
Regular 5-point star centered at (12,12), points reaching ~safe padding.`,
  },
  {
    aliases: ["home", "house"],
    plan: `SUBJECT: House
1. Triangle roof pointing up, peak ~(12,4)
2. Square/rect body under roof
3. Optional door notch at bottom center
Classic home icon.`,
  },
  {
    aliases: ["search", "magnifier", "find"],
    plan: `SUBJECT: Magnifying glass
1. Circle lens center ~(11,11), r≈6.5
2. Handle line from ~(15.5,15.5) to ~(20,20)
stroke only for outline.`,
  },
  {
    aliases: ["settings", "gear", "cog"],
    plan: `SUBJECT: Gear
1. Center circle/hole ~(12,12)
2. 6–8 teeth around circumference (simple path or short lines)
Recognizable cog.`,
  },
  {
    aliases: ["trash", "bin", "delete"],
    plan: `SUBJECT: Trash can
1. Lid horizontal line/rect at top
2. Can body below with slightly tapered sides
3. Optional handle on lid
Classic delete icon.`,
  },
  {
    aliases: ["cloud"],
    plan: `SUBJECT: Cloud
Single cloud path: 3–4 overlapping bulges, flat bottom, centered ~(12,12).`,
  },
  {
    aliases: ["lock"],
    plan: `SUBJECT: Padlock
1. Rounded rect body lower half
2. U-shaped shackle above body
Classic lock.`,
  },
  {
    aliases: ["mail", "email", "envelope"],
    plan: `SUBJECT: Envelope
1. Rectangle body
2. V flap lines from top corners to center
Classic mail icon.`,
  },
  {
    aliases: ["user", "person", "profile", "avatar"],
    plan: `SUBJECT: User
1. Circle head ~(12,8)
2. Shoulders arc / semicircle below ~(12,18)
Classic person silhouette.`,
  },
];

/**
 * Find the best curated subject plan for a prompt.
 * Prefers longer alias matches (e.g. "linux penguin" over "penguin").
 */
export function getSubjectHint(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  let best: { score: number; plan: string } | null = null;

  for (const entry of SUBJECTS) {
    let bestAliasLen = 0;
    for (const alias of entry.aliases) {
      const needle = alias.toLowerCase();
      if (lower.includes(needle)) {
        bestAliasLen = Math.max(bestAliasLen, needle.length);
      }
    }
    if (bestAliasLen === 0) continue;
    // Longer phrase match wins (linux penguin > penguin)
    if (!best || bestAliasLen > best.score) {
      best = { score: bestAliasLen, plan: entry.plan };
    }
  }

  return best?.plan ?? null;
}

export function listSubjectAliases(): string[] {
  return SUBJECTS.flatMap((s) => s.aliases);
}
