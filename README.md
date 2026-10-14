# Glyph

**Prompt to SVG.** Describe an icon in plain words and get clean, production-ready SVG you can drop straight into your product.

---

## What you can do

- **Generate icons from a sentence.** Type something like "rocket taking off" or "cat sitting" and get several options to choose from.
- **Pick a style.** Outline, solid, rounded, sharp, duotone or animated.
- **Make a whole pack.** Write up to 8 icons, one per line, and they come out as a matching set.
- **Check it at real sizes.** Preview every icon from 16px to 64px before you use it.
- **Edit the code.** Switch to the Code tab to tweak the SVG by hand.
- **Export anywhere.** Copy the SVG, download it as SVG, or save it as a PNG.
- **Keep your history.** Every icon you generate is saved to your account, so you can reopen, export or delete it later.

## Why the SVGs are good to ship

- Uses `currentColor`, so icons follow your text colour and work in light and dark themes.
- Scales cleanly at any size, with no fixed width or height baked in.
- Small, optimised files with no scripts or external references.
- Animated icons respect the user's "reduce motion" setting.

## How to use it

1. Sign in.
2. Choose **Single icon** or **Icon pack**.
3. Describe what you want. Describe the subject, not the style.
4. Pick a style and size, then press **Generate** (or ⌘/Ctrl + Enter).
5. Pick the option you like, then copy or download it.

## Tips for better results

- Keep prompts short and concrete: "paper plane" works better than "an icon representing sending messages".
- Name one main subject. Add at most one supporting detail ("coffee cup with steam").
- Don't like any option? Press Generate again for fresh ones.
- For packs, keep every line the same kind of thing (all objects, or all actions) so the set feels consistent.

## Limits

- Prompts can be up to 500 characters.
- Packs can have up to 8 icons.
- Generation is rate-limited per account to keep the service fast for everyone.

---

## Running it locally

You'll need Node.js 20+ and a Postgres database.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the values.
3. Create the database tables with `npm run db:push`.
4. Start the app with `npm run dev` and open http://localhost:3000.
