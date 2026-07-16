# Glyph Engine — Elite SVG Generation

Source of truth for how Glyph turns a prompt into Lucide-class SVG icons.

Code in `lib/glyph/*` must follow these contracts.

---

## Cost model (showcase-first)

Glyph is designed to be **cheap by default**:

| Stage | Method | LLM cost |
| ----- | ------ | -------- |
| Classify | Heuristic (no LLM) | $0 |
| Visual plan | Curated subject DB **or** cheap planner | $0 or ~1 cheap call |
| Generate | Selected model + VISUAL PLAN | 1 call |
| Validate / repair | Deterministic | $0 |
| Animation fallback | Deterministic CSS | $0 |
| SVGO | Local | $0 |

**Typical:** 1 call for known subjects (linux, github, react…), 2 calls otherwise.

Recommended models:

- Default: `openai/gpt-4o-mini` (good quality / low cost)
- Free fallback: `openrouter/free` or `openai/gpt-oss-20b:free`
- Premium (optional): set `GLYPH_GENERATE_MODEL=anthropic/claude-sonnet-4`

Env:

```bash
GLYPH_GENERATE_MODEL=openai/gpt-4o-mini
GLYPH_FALLBACK_MODEL=openrouter/free
```

---

## Quality bar

Every glyph must feel Lucide / Heroicons / Tabler grade:

- Recognizable at **16×16**
- Optically centered
- Consistent stroke weight + caps/joins
- 2px padding from viewBox edges
- `currentColor` only (monochrome)
- Minimal path nodes
- Valid XML (no truncated attrs like `stroke-`)

Refuse: photorealism, `<image>`, scripts, event handlers, broken markup.

---

## Pipeline

```
User prompt + UI controls
    ↓
1. Heuristic intent (free)
    ↓
2. Visual plan
     ├─ curated subject DB match? → free instant recipe (linux/tux, github, react…)
     └─ else → cheap LLM planner (gpt-4o-mini) describes shapes + coords
    ↓
3. Generate SVG with selected model — VISUAL PLAN injected front-and-center
    ↓
4. Validate + repair
    ↓
5. Deterministic animation fallback (if needed)
    ↓
6. SVGO
```

**Why plan-then-draw:** LLMs lack visual memory. Without an explicit geometric recipe, “linux penguin” collapses into abstract circles. The plan step forces concrete parts (head, belly, beak, feet) before drawing.

**Cost:** curated subjects = 1 LLM call. Unknown subjects = 2 calls (cheap plan + draw).

Env: `GLYPH_PLAN_MODEL` (default `openai/gpt-4o-mini`), `GLYPH_GENERATE_MODEL`.

---

## Golden training examples

These live in `lib/glyph/examples.ts`. At request time we inject:

1. **Two tiny quality anchors** (`GOLDEN_ANCHORS`) — always
2. **One keyword-matched example** — if the prompt matches

Keep examples minified. Do **not** dump the full library into every prompt.

### Catalog (reference)

| Label | Keywords | Purpose |
| ----- | -------- | ------- |
| home | home, house | closed house path |
| search | search, find | circle + line |
| settings | gear, cog | hub + spokes |
| cloud-upload | cloud, upload | cloud + arrow |
| download | download, save | arrow + baseline |
| heart | heart, like | organic curve |
| star | star, rating | 5-point path |
| bell | bell, notification | body + clapper |
| arrow-right | arrow, next | line + chevron |
| lock | lock, security | rect + shackle |
| trash | trash, delete | lid + can |
| mail | mail, email | envelope |
| user | user, profile | head + shoulders |
| check | check, done | checkmark |
| plus | plus, add | cross |
| menu | menu, nav | 3 lines |
| loader | loading, spinner | arc + CSS spin |

### How to add a new training icon

1. Draw / copy a Lucide-quality 24×24 SVG (minified, `currentColor`, stroke 1.5)
2. Append to `GLYPH_EXAMPLES` with 2–4 keywords
3. Keep under ~300 chars per SVG
4. Never paste the whole catalog into the system prompt

---

## Canvas / stroke rules

- Icons: `viewBox="0 0 24 24"`
- Outline: `fill="none"`, stroke currentColor
- Solid: fill currentColor, no stroke
- Duotone: two fills, secondary opacity ~0.35
- Animated: CSS `<style>` + `@keyframes` preferred

---

## Validator duties

1. Strip markdown fences
2. Extract first `<svg>…</svg>`
3. Ensure xmlns + viewBox
4. Strip scripts / `on*` handlers
5. **Repair truncated attrs** (`stroke-`, empty `fill=`)
6. Apply stroke-width / radius from UI
7. Preserve `<style>` and SMIL

---

## Pack consistency

1. Generate first icon
2. Extract stroke tokens
3. Lock tokens into remaining prompts
4. Parallel generate rest

---

## API (`POST /api/svg`)

Success includes `intent`, `stages`, `model`, `svg`.

---

## File map

| Path | Role |
| ---- | ---- |
| `docs/GLYPH_ENGINE.md` | This playbook |
| `lib/glyph/examples.ts` | Curated few-shots + anchors |
| `lib/glyph/classifier.ts` | Zero-cost heuristics |
| `lib/glyph/prompts.ts` | System + detailed prompt builder |
| `lib/glyph/validator.ts` | Extract / repair / tokens |
| `lib/glyph/optimizer.ts` | SVGO |
| `lib/glyph/generator.ts` | 1-call orchestration |
| `app/api/svg/route.ts` | Auth + pack + DB |

---

## Phase 2

- Credits / billing UI
- Optional SSE streaming
- Optional paid critique pass toggle for power users
