# Glyph Engine — Elite SVG Generation

Source of truth for how Glyph turns a prompt into Lucide-class SVG icons.

This document is implementation-ready. Code in `lib/glyph/*` must follow these contracts.

---

## Quality bar

Every generated glyph must pass as if it belonged in Lucide, Heroicons, or Tabler:

- Recognizable at **16×16**
- Optically centered (feels centered, not just mathematically)
- Consistent stroke weight and caps/joins within one icon
- 2px minimum padding from viewBox edges (icons)
- `currentColor` only for monochrome icons (no hardcoded black/white)
- Minimal path nodes — prefer clarity over detail
- Valid XML that inlines safely in HTML

We refuse:

- Photorealistic / Midjourney-style illustrations
- Embedded `<image>`, base64 rasters, external URLs
- `<script>`, event handlers (`onclick`, etc.)
- Broken or truncated SVG markup shown to users

---

## Pipeline

```
User prompt + UI controls
    ↓
1. Intent classifier (cheap model)
    ↓
2. Design brief / amplifier (cheap model)
    ↓
3. Generate SVG (quality model)
    ↓
4. Self-critique + refine (quality model)
    ↓
5. Validate + auto-fix (deterministic)
    ↓
6. Animation injector (if needed)
    ↓
7. SVGO optimize (preserve viewBox + motion)
    ↓
Clean SVG → API → canvas
```

### Stage labels (UI)

| Stage        | Copy                |
| ------------ | ------------------- |
| `classify`   | Classifying intent… |
| `brief`      | Writing design brief… |
| `generate`   | Drafting geometry…  |
| `critique`   | Critiquing & refining… |
| `validate`   | Validating SVG…     |
| `animate`    | Injecting motion…   |
| `optimize`   | Polishing output…   |

---

## Model roles

| Role      | Default env key            | Default model                    | Purpose                          |
| --------- | -------------------------- | -------------------------------- | -------------------------------- |
| Classify  | `GLYPH_CLASSIFY_MODEL`     | `openai/gpt-oss-20b:free`        | Intent schema                    |
| Amplify   | `GLYPH_CLASSIFY_MODEL`     | same as classify                 | Design brief                     |
| Generate  | `GLYPH_GENERATE_MODEL`     | `anthropic/claude-sonnet-4`      | First SVG draft                  |
| Critique  | `GLYPH_GENERATE_MODEL`     | same as generate                 | Self-critique refine             |
| Fallback  | `GLYPH_FALLBACK_MODEL`     | `openrouter/free`                | If quality model fails           |

UI model dropdown can override the **generate** model. Classify/amplify stay cheap unless overridden by env.

---

## Canvas rules (non-negotiable)

### Icons (default)

- `viewBox="0 0 24 24"` (or user-selected 16 / 24 / 32)
- Safe area: inset by padding (default 2px)
- Center optical mass around `(size/2, size/2)`
- No `width` / `height` that fight responsive scaling (validator may normalize; optimizer keeps viewBox)

### Illustrations (classifier only)

- `viewBox="0 0 100 100"` when type is `illustration`
- Still monochrome/`currentColor` unless style is `gradient`

### Logos (classifier only)

- Wider canvas `0 0 200 60` when type is `logo`

---

## Stroke system

| Style      | Fill              | Stroke                         | Caps / joins      |
| ---------- | ----------------- | ------------------------------ | ----------------- |
| outline    | `none`            | `currentColor`, width from UI  | round / round     |
| rounded    | `none`            | same                           | round / round     |
| sharp      | `none`            | same                           | square / miter    |
| solid      | `currentColor`    | none (or hairline avoided)     | —                 |
| duotone    | primary + 0.3 op. | optional light stroke          | round             |
| animated   | follow base style | follow base style              | round preferred   |

Never mix outline + solid fills in the same icon unless style is `duotone`.

---

## Path quality

- Prefer cubic beziers (`C`/`c`) for organic curves
- Prefer arcs (`A`/`a`) for circular segments
- Minimize nodes — target **&lt; 8 nodes per path** for simple icons
- Prefer drawing at correct coordinates over `transform="translate(...)"` crutches
- Close filled shapes with `Z`
- Align anchors to whole or half pixels when possible

---

## Animation contract

When `hasAnimation` is true or style is `animated`:

1. Prefer **CSS** inside a single `<style>` block:
   - `@keyframes` + `animation` shorthand
   - Classes or ids on animated elements
2. SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`) allowed as secondary
3. Durations: **0.6s–2.4s**, smooth easing, seamless loops
4. Motion must stay readable at rest and in motion
5. No JavaScript, no external CSS files

Common patterns:

- **Spin** — rotate 0→360, linear, infinite
- **Pulse** — opacity 1→0.35→1, ease-in-out
- **Draw** — `stroke-dasharray` / `stroke-dashoffset`
- **Bounce** — subtle `translateY`
- **Stagger** — multiple blocks with delay offsets

Animation injector runs **after** validate when animation is required and the draft lacks motion tags/styles.

---

## Intent schema

Classifier returns:

```ts
{
  type: "icon" | "illustration" | "logo" | "animation" | "pattern",
  style: "outline" | "solid" | "duotone" | "gradient" | "animated",
  complexity: "simple" | "medium" | "complex",
  hasAnimation: boolean,
  colorScheme: "monochrome" | "brand" | "colorful" | "gradient",
  subject: string,
  suggestedViewBox: "0 0 24 24" | "0 0 100 100" | "0 0 200 60"
}
```

UI style controls **override** classifier style when the user picked a preset.

---

## Pack consistency

1. Generate first icon fully through the engine
2. Extract tokens: `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `rx`
3. Append a pack-consistency lock to remaining prompts
4. Generate remaining icons in parallel
5. Each item still runs validate → optimize

---

## Validator duties

Deterministic post-processing:

1. Strip markdown fences
2. Extract first `<svg>…</svg>`
3. Ensure `xmlns`
4. Ensure / normalize `viewBox`
5. Strip `<script>` and `on*` handlers
6. Preserve safe `<style>` and SMIL animation
7. Apply stroke-width / corner-radius from UI when set
8. For outline styles, ensure stroked shapes have `stroke="currentColor"` and sensible caps

If no SVG can be extracted → generation failure (retry once at API layer).

---

## SVGO

Optimize for size **without** destroying product quality:

- Keep `viewBox`
- Keep `<style>` and animation attributes
- Remove comments, metadata, editor junk
- Collapse useless groups; minify path data carefully
- Do **not** strip `currentColor`

---

## QA checklist (critique pass)

Before shipping a glyph, critique must verify:

1. All strokes/fills use `currentColor` (monochrome)
2. Caps/joins match the style preset
3. No coordinates wildly outside viewBox
4. Optical balance / centering
5. Paths not unnecessarily complex
6. Animation (if any) is subtle and looping cleanly

---

## Golden examples (quality target)

Match this precision — not the subject:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/>
  <path d="M16.5 16.5 21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

---

## API contract (`POST /api/svg`)

Request (existing + engine fields):

```json
{
  "prompt": "cloud upload icon",
  "style": "outline",
  "strokeWidth": 1.5,
  "cornerRadius": 0,
  "padding": 2,
  "viewBoxSize": 24,
  "model": "optional-override",
  "packPrompts": []
}
```

Success (single):

```json
{
  "svg": "<svg ...>...</svg>",
  "model": "anthropic/gpt-4o-mini",
  "provider": "openrouter",
  "intent": { "...": "..." },
  "stages": ["classify", "brief", "generate", "critique", "validate", "optimize"],
  "saved": true
}
```

---

## Phase 2 (out of scope here)

- Billing / generation credits
- True SSE token streaming of path drawing
- Community library marketplace ranking
- Visual QA model that scores rendered bitmaps

---

## File map

| Path                         | Role                                      |
| ---------------------------- | ----------------------------------------- |
| `docs/GLYPH_ENGINE.md`       | This playbook                             |
| `lib/glyph/provider.ts`      | OpenRouter client + model roles           |
| `lib/glyph/prompts.ts`       | System / critique / detailed prompts      |
| `lib/glyph/examples.ts`      | Curated few-shot references               |
| `lib/glyph/classifier.ts`    | Intent classification                     |
| `lib/glyph/validator.ts`     | Extract + fix                             |
| `lib/glyph/animator.ts`      | CSS motion injection                      |
| `lib/glyph/optimizer.ts`     | SVGO                                      |
| `lib/glyph/generator.ts`     | Full orchestration                        |
| `app/api/svg/route.ts`       | Auth, pack, DB, engine entry              |
