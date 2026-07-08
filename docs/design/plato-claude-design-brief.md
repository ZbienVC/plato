# Plato — "Elevated Verdant" · Claude Design generation brief

A **standalone, paste-ready** brief for generating the Plato redesign in Claude Design. Everything you need is in this one file — you don't need the full spec open. (The full spec lives at `docs/superpowers/specs/2026-07-08-plato-redesign-design.md` if you want the deeper rationale.)

Plato is a **mobile-first nutrition tracking + meal-planning PWA** (React + Tailwind). The redesign is "Elevated Verdant": a cooler, muted teal-jade premium dark theme (with a real light mode), glassmorphism, mesh gradients, a duotone macro palette, and heavy 3D reserved for four signature moments.

---

## How to use this file

Claude Design produces one self-contained HTML bundle per generation. It's great at layout but will happily invent colors, swap fonts, and Title-Case your buttons if you let it. **Consistency comes from sameness of input, not from asking nicely.** So:

1. **Generate one screen per prompt.** Never ask for several screens at once.
2. **Every prompt = the constant blocks + one screen brief.** Paste, in order: **§A Token pack** → **§B Brief template** (fill the `{{ }}` fields from the screen's brief in §D) → the screen's **house rules are already inside the template**. The token pack and house rules are **byte-identical every time** — any per-screen edit to them is a bug.
3. **Generate in this order** so later screens can anchor to earlier ones:
   **Home → Onboarding → Log hub → Explore → Plans → Restaurant → Recipes → Grocery → You/Profile → Weight → Insights → Paywall → Billing → Settings → Auth → Empty/Error.**
4. **After Home passes, copy 1–2 sentences describing its Macro Orb, cards, nav, and top bar** into the "VISUAL ANCHOR" field of every later prompt.
5. **Review every output against §E** (QA). If it drifts on tokens/fonts/case, **regenerate with the broken rule bolded** — don't hand-patch (hand-patches don't carry to the next screen).
6. **Ship both themes in one bundle** via `[data-theme="light"]`. Light and dark differ **only** in token values — never layout, spacing, or radii.

The governing principle: **the tokens are law, and Claude Design is a renderer, not a designer.**

---

## §A. The token pack — paste into EVERY generation

```css
:root {
  /* Surfaces — dark (default) */
  --bg-base: #070D0C;    --bg-base-2: #0A1210;
  --surface-1: #0E1614;  --surface-2: #121C19;  --surface-3: #17231E;
  --glass-fill: rgba(16,26,22,.50);
  --hairline: rgba(160,205,190,.09);
  --glass-border: rgba(160,215,200,.12);
  --divider-strong: rgba(160,215,200,.18);

  /* Brand ramp (cool teal-jade, muted) */
  --brand-forest: #0C3A32; --brand-deep: #0F9482;
  --brand-jade: #43C6AC;   --brand-mint: #8CE0CE;   /* jade = PRIMARY */

  /* Text — dark */
  --ink: #EAF1EF; --sage: #94A9A3; --muted: #5F726D; --on-accent: #04231C;

  /* Macros / duotone (ONE set — replaces the 3 legacy palettes) */
  --macro-cal: #43C6AC;   /* calories/energy = brand jade */
  --macro-protein: #5FD4C4; --macro-carbs: #E7B67C;
  --macro-fat: #E1A0AB;   --accent-violet: #AEA6EA;
  /* macro-bar gradients (same-family, light tint → base) */
  --macro-protein-grad: linear-gradient(90deg,#5FD4C4,#43C6AC);
  --macro-carbs-grad:   linear-gradient(90deg,#F0CC9C,#E7B67C);
  --macro-fat-grad:     linear-gradient(90deg,#ECBFC6,#E1A0AB);

  /* Semantic */
  --success: #43C6AC; --warning: #E7B67C; --danger: #E1616C; --info: #5FD4C4;

  /* Radii */
  --r-card: 22px; --r-tile: 20px; --r-control: 16px; --r-fab: 21px; --r-avatar: 13px;
  /* pills/chips use 9999px */

  /* Motion */
  --dur-fast: 140ms; --dur-base: 240ms; --dur-slow: 420ms;
  --ease-out: cubic-bezier(.22,.61,.36,1);
  --tap-scale: .97; --stagger: 60ms;

  /* Layout */
  --content-max: 430px; --nav-safe-pad: 104px;

  /* Type */
  --font-display: "Bricolage Grotesque", "SF Pro Display", ui-sans-serif, -apple-system, system-ui, sans-serif;
  --font-ui: "Hanken Grotesk", "Geist", "SF Pro Display", ui-sans-serif, -apple-system, system-ui, sans-serif;
}

[data-theme="light"] {
  --bg-base: #F3F7F4; --bg-base-2: #F3F7F4;
  --surface-1: #FFFFFF; --surface-2: #F7FAF8; --surface-3: #EEF3F0;
  --glass-fill: rgba(255,255,255,.62);
  --hairline: rgba(12,58,50,.10);
  --glass-border: rgba(12,58,50,.08);
  --divider-strong: rgba(12,58,50,.14);
  /* ramp unchanged; use --brand-deep for interactive fills on light (AA) */
  --ink: #0E1614; --sage: #48605A; --muted: #7E938C; --on-accent: #04231C;
}

/* Signature dark mesh — Home / Insights / Onboarding page backgrounds */
.mesh-dark {
  background:
    radial-gradient(58% 42% at 80% 6%, rgba(67,198,172,.15), transparent),
    radial-gradient(48% 40% at 10% 20%, rgba(15,148,130,.13), transparent),
    radial-gradient(44% 48% at 92% 84%, rgba(231,182,124,.06), transparent),
    radial-gradient(60% 60% at 32% 102%, rgba(95,212,196,.08), transparent),
    linear-gradient(162deg, #08110E, #060B0A, #080F0D);
}
/* Glass card recipe */
.glass {
  background: var(--glass-fill);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 18px 34px -28px rgba(0,0,0,.9);
}
.glass-nav { backdrop-filter: blur(24px); }
```

**Fonts (ship as inlined assets, no CDN):** Bricolage Grotesque (variable, display) + Hanken Grotesk (variable, body/UI); Geist is an acceptable body fallback. **Forbidden: Inter and Space Grotesk** (AI-default tells — instant reject).

**Copy conventions:** sentence case for all real copy (labels, buttons, headings); **never** Title Case; ALL CAPS **only** for 10px micro-labels (uppercase, letter-spacing .16–.24em, `--sage`). Active voice. Real, specific copy — no lorem. `tabular-nums` on every aligned digit.

---

## §B. The generation brief template — fill the `{{ }}` fields per screen

```
ROLE
You are rendering ONE screen of "Plato — Elevated Verdant", a mobile-first
nutrition + meal-planning PWA. You are a renderer: use ONLY the tokens and
rules below. Do not invent colors, fonts, radii, or copy conventions.

SCREEN
Name: {{ screen name }}
Purpose (one line): {{ purpose }}
Primary user goal: {{ goal }}

CANVAS & FRAME
- Mobile-first. Design at 430px wide (var --content-max), centered, single column.
- Assume a floating glass bottom nav is present (Home · Plans · [FAB +] · Explore · You);
  reserve 104px (var --nav-safe-pad) of bottom padding so content clears it.
- A contextual top bar is present: {{ top bar contents for this screen }}.
- Default theme is DARK. Also produce the LIGHT variant of this screen.

TOKENS  (use these EXACT values — never a near-neighbor)
{{ PASTE THE FULL §A TOKEN PACK HERE }}

LAYOUT
{{ bento / list / form / modal structure, region by region, top to bottom }}

COMPONENTS USED  (reuse these named patterns exactly; do not restyle them)
{{ e.g., GlassCard, MacroOrb, MacroBar(protein|carbs|fat), MealCard, StatTile,
   PillChip, PrimaryButton, Skeleton, EmptyState }}

STATES  (render each as a labeled frame)
- default: {{ }}
- empty: {{ copy + illustration note }}
- loading/skeleton: {{ which regions shimmer }}
- error: {{ inline vs full-screen, retry copy }}
- offline: {{ what still works from cache, what shows a banner }}
- over-target (if relevant): {{ e.g., calories over goal → danger accents }}

INTERACTIONS
{{ taps, sheets, transitions; tap scale .97; page transition fade+slide 240ms;
   honor prefers-reduced-motion — disable float/parallax/orb animation }}

PREMIUM GATING (if any)
{{ which elements are locked, the lock affordance, the upsell copy }}

VISUAL ANCHOR
Match the treatment established on Home: {{ 1-2 lines pasted from Home output }}.

HOUSE RULES  (identical on every screen — do not deviate)
- Sentence case for all real copy. Never Title Case. ALL CAPS only for 10px
  micro-labels (uppercase, letter-spacing .16–.24em, color var --sage).
- Fonts: display = var --font-display (Bricolage Grotesque); body/UI = var
  --font-ui (Hanken Grotesk). NEVER Inter, NEVER Space Grotesk.
- Numbers use font-variant-numeric: tabular-nums. Hero stats: 800 weight,
  letter-spacing -.03em, sizes 34/30px.
- Type scale (px): 34/30 hero stat · 27 screen title · 20 section head ·
  15/14 body · 13 secondary · 11 caption · 10 micro-label. Body line-height 1.5.
- Radii: cards 22 · tiles 20 · inputs/controls 16 · pills full · FAB 21 · avatar 13.
- Spacing on the 8px rhythm: 2 4 6 8 10 12 16 20 24 32 44.
- Cards use the .glass recipe. Dark page background uses .mesh-dark. Light page
  background uses var --bg-base with NO mesh.
- Macro bars fill with the same-family gradients: protein --macro-protein-grad,
  carbs --macro-carbs-grad, fat --macro-fat-grad.
- Motion tokens: dur-fast 140 / dur-base 240 / dur-slow 420; ease var --ease-out.
- Heavy 3D (WebGL/Spline) ONLY where this brief explicitly calls for it;
  everywhere else use CSS depth (glass, gradients, shadows).
- Copy must be real and specific — no lorem, no placeholder names.

OUTPUT CONTRACT
- Single self-contained HTML bundle (inline CSS, inline fonts, inline SVG/PNG).
- No external CDN, no <link> to remote fonts, no remote images.
- Theme switch via [data-theme="light"] on the root; ship both themes.
- Emit CSS variables by the names above; do not hard-code hex where a token exists.
```

---

## §C. Do's & don'ts + consistency guardrails

| Do | Don't |
|---|---|
| Keep the token variable names; emit them as CSS vars | Rename or "improve" a token, or hard-code a hex where a var exists |
| Design mobile-first at 430px, single column | Produce a desktop/multi-column layout or a 1440px canvas |
| Sentence case everywhere; ALL CAPS only for 10px micro-labels | Title Case headings/buttons, or ALL-CAPS body |
| Use Bricolage Grotesque (display) + Hanken Grotesk (body) | Use Inter or Space Grotesk — instant AI tell, hard reject |
| Reserve 104px bottom safe-area for the floating nav | Let content sit under the nav or add your own bottom bar per screen |
| Use `.glass` cards + `.mesh-dark` page bg (dark), plain `--bg-base` (light) | Invent new card shadows, blurs, or a light-mode mesh |
| Ship both dark and light in one bundle via `[data-theme]` | Deliver dark-only, or fork into two unrelated files |
| Put WebGL/Spline only where the brief names it | Add 3D to arbitrary screens or animate everything |
| Write real Plato copy ("Log breakfast", "You're 320 kcal under") | Lorem ipsum, "Sample text", or fake metrics |
| tabular-nums on all aligned digits | Proportional figures in stats/tables |

**Consistency rules:** (1) token pack + house rules are byte-identical every prompt; (2) one screen per generation; (3) Home is the visual anchor — paste 1–2 sentences of its treatment into later prompts; (4) a fixed component vocabulary (GlassCard, MacroOrb, MacroBar, MealCard, StatTile, PillChip, PrimaryButton, Skeleton, EmptyState, TopBar, FloatingNav, SegmentedTabs, Sheet, Toast) — same names every time; (5) two themes, one geometry; (6) reject-and-regenerate over hand-fixing.

**Premium model (used across briefs):** the paid tier is **Plato Plus**, 48-hour free trial (shown in hours, e.g. "trial · 41h left"). Gated features: **voice AI logging** (`voice_ai`), **photo AI logging** (`photo_ai`), **restaurant mode** (`restaurant_mode`), **concierge swaps** (`concierge_swaps`), **insights depth** (`insights_pro`). **Barcode scanning is FREE and never gated.** Basic insights (current week + month) are free; only depth is Plus. Paywall and Auth are routable bottom **GlassSheets**, not centered modals.

---

## §D. Per-screen briefs

Each brief lists the fields that change per screen. Wrap it in the §B template with the §A token pack + house rules at generation time.

### Home
- **Purpose:** at-a-glance daily status and the fastest path to logging.
- **Top bar:** avatar (opens You), centered wordmark, streak flame with count, premium pill (if trial/free).
- **Layout (bento):** row 1 — full-width hero card with the **Macro Orb** (signature WebGL sphere that fills with light as macros are logged) and the day's calorie number (34px, 800) with "left" / "over" label. Row 2 — three MacroBar cards (protein aqua `--macro-protein`, carbs honey `--macro-carbs`, fat rose `--macro-fat`), each a same-family gradient fill. Row 3 — Water tile (StatTile with goal/target ring, default 8 cups / 2000 ml) + quick-stat tile side by side. Row 4 — "Today" section head, then logged MealCards; below, "Planned" MealCards from the active plan with a quick-add affordance.
- **Components:** MacroOrb, GlassCard, MacroBar, StatTile, MealCard, PillChip, SectionHead.
- **States:** default (orb partially filled); **empty** (no logs — orb dim, copy "Log your first meal to light up your day", primary "Log breakfast"); **loading** (orb static gradient fallback + shimmering bars/cards); **error** (inline banner "Couldn't load today's log — retry"); **offline** (banner "Offline — showing last saved day", logging still queues locally); **over-target** (calorie number and orb rim use `--danger`, copy "320 kcal over").
- **Interactions:** tap orb → Log hub; tap MacroBar → macro detail sheet; tap planned meal → log it; pull-to-refresh; tap scale .97; reduced-motion disables orb fill animation (static gradient) and card parallax.
- **3D:** Macro Orb is one of four sanctioned WebGL moments — lazy-load, pause offscreen, PNG fallback, respect low-power/reduced-motion.
- **Light/dark:** dark uses `.mesh-dark` page bg + glass cards; light uses `--bg-base` (no mesh), white `--surface-1` cards, orb keeps the brand ramp; interactive accents shift to `--brand-deep` on light.

### Onboarding steps
- **Purpose:** fast-but-coach hybrid — smart defaults, one focused thing per screen, ~60s to a locked plan, unified dark theme (fixes today's jarring light onboarding).
- **Top bar:** slim progress rail (segmented, sage on `--divider-strong`), back chevron; no bottom nav during onboarding.
- **Steps (keys: welcome · basics · goal · activity · preferences · reveal · ready):** (1) Welcome — wordmark, one-line value prop "Plans that fit your goals, logged in seconds", primary "Get started", secondary "I have an account". (2) Basics — name, then age/height/weight/gender with sensible pre-filled defaults, one field group visible at a time. (3) Goal — lose fat / maintain / build muscle / athletic segmented + optional training/days/diet. (4) Activity — activity level. (5) Preferences — meals per day, cook time, cuisines, restrictions as PillChips. (6) **Plan reveal** — "building your plan" blooms into a 3D Spline scene as macros lock (sanctioned 3D moment); real values via Mifflin-St Jeor, min ~1.2s. (7) Ready — the calorie/macro targets with primary "Start tracking".
- **Components:** ProgressRail, Input, SegmentedTabs, PillChip, PrimaryButton, PlanRevealScene (Spline).
- **States:** default; **loading** (reveal animation on step 6, real computed values — not fake); **error** (if plan compute/sync fails, still show locally computed macros + "We'll sync when you're back online"); **offline** (whole flow works from local compute; sync deferred).
- **Interactions:** one primary action per step; Enter advances; validation inline; tap scale .97; reduced-motion replaces the Spline bloom with a static duotone plan card. Account creation is deferred — "continue without account" is available; you can create one later to sync.
- **3D:** Plan Reveal Spline scene — sanctioned; lazy-load only on the reveal step, static gradient/PNG fallback.
- **Light/dark:** ship dark as canonical; also emit the light variant, but default to dark.

### Log hub
- **Purpose:** the FAB destination — every way to add food in one place.
- **Top bar:** "Log" title, close chevron (it opens as a sheet from the FAB).
- **Layout:** six entry modes as large tiles — **Search** (USDA), **Quick** (common foods), **Manual** (macros), **Voice** (premium), **Scan barcode** (free), **Photo** (premium). Search / Quick / Manual render **in-sheet**; Voice / Scan / Photo open **full-screen capture** overlays. Below: recent + frequent foods as a two-up grid of QuickAdd cards.
- **Components:** SegmentedTabs, SearchField, FoodResultRow, QuickAddCard, MacroInput, PillChip, LockBadge.
- **States:** default; **empty** (no recents — "Search USDA or quick-log your first food"); **loading** (search results shimmer rows); **error** (USDA fetch fails — "Search is down, try quick log"); **offline** (search disabled with note; quick log + recents still work and queue).
- **Interactions:** typing debounces USDA search; tap result → serving/quantity sheet → confirm; tap scale .97; sheet dismiss on drag-down.
- **Premium:** Voice and Photo tiles show a LockBadge and route free users to the Paywall (Plato Plus) with contextual copy ("Voice logging is a Plato Plus feature"). **Scan barcode is free — no LockBadge, no Paywall route.**
- **Light/dark:** standard glass tiles; light uses white surfaces; lock badges use `--warning` honey trim.

### Explore (discovery)
- **Purpose:** a browse-and-discover surface — find food fast, discover trending foods and recipes, jump into logging/plans.
- **Top bar:** "Explore" title; search icon action that opens the Log hub in search mode.
- **Layout (bento):** search-prompt field at top (tap → Log search); **quick-add grid** of frequent/recent foods as two-up QuickAddCards (one-tap → meal-confirm sheet); a **trending foods** row of FoodResultRows; discovery entry-point tiles (browse recipes, restaurant, generate a plan); optional category PillChips to filter the grid.
- **Components:** SearchField, QuickAddCard, FoodResultRow, PillChip, SectionHead, StatTile, FoodImage.
- **States:** default; **empty** (new user — "Log a meal or two and your quick-adds show up here"; still show trending + entry points); **loading** (grid + trending shimmer); **error** ("Couldn't load Explore — retry"); **offline** (recents/quick-adds from cache work and queue; trending disabled with a note).
- **Interactions:** tap a quick-add → meal-confirm sheet; tap trending item → serving/quantity sheet → confirm; tap an entry-point tile → routes to the named screen; tap scale .97.
- **Premium:** none — Explore is free; a Plus-gated destination it links to (e.g. restaurant) shows its own LockBadge on that screen, not here.
- **Light/dark:** glass cards; light uses white surfaces; category chips active in `--brand-jade` (dark) / `--brand-deep` (light).

### Plans
- **Purpose:** the 7-day plan plus recipes and restaurant entry points.
- **Top bar:** "Plans" title, contextual action (regenerate / share).
- **Layout:** SegmentedTabs — **My plan** (7-day), **Recipes**, **Restaurant** (premium). My plan: day selector row of PillChips, then per-slot MealCards with edit and swap affordances; footer stats (day totals vs targets). Plan-level actions: export/share (PDF), regenerate.
- **Components:** SegmentedTabs, DaySelector, MealCard, SwapButton, StatTile, PrimaryButton, ShareSheet.
- **States:** default; **empty** (no plan — "Generate a plan tailored to your goals", primary "Generate plan"); **loading** (generating — skeleton day + progress copy); **error** ("Couldn't generate — try again"); **offline** (view cached plan; generate disabled with note); **over-target** (a day exceeding targets flags the footer stat in `--danger`).
- **Interactions:** tap meal → recipe/detail; swap → Concierge Swaps (premium); edit meal (not just delete); export → PDF share sheet.
- **Premium:** Restaurant tab and Concierge Swaps are gated; show LockBadge + Paywall route.
- **Light/dark:** segmented control uses `--surface-2` track, `--brand-jade` active.

### Restaurant (premium)
- **Purpose:** find on-menu items that fit today's remaining macros.
- **Top bar:** "Restaurant" title, search.
- **Layout:** search + cuisine PillChips; result list of RestaurantItem cards (name, item, calories, macro chips, "fits your day" badge when within remaining targets).
- **Components:** SearchField, PillChip, RestaurantItem, FitBadge, LockOverlay.
- **States:** free user → **locked** full-screen LockOverlay with upsell + "Start free trial"; premium default; **empty** (no matches — "No items fit your remaining macros — widen the filter"); **loading** (shimmer rows); **error** (retry); **offline** (cached last search + banner).
- **Interactions:** tap item → log it with remaining-macro delta shown; tap scale .97.
- **Premium:** entire screen is premium; the LockOverlay is the gate.
- **Light/dark:** fit badge uses `--success` jade; over-remaining chips use `--danger`.

### Recipes
- **Purpose:** browse, view, and save recipes; add to plan or log.
- **Top bar:** "Recipes" title, search + saved filter.
- **Layout:** bento grid of RecipeCard tiles (FoodImage, title, calories, macro chips, save heart); tapping opens the RecipeViewer sheet (ingredients, steps, macros, "add to plan" / "log now").
- **Components:** RecipeCard, FoodImage, PillChip, SaveHeart, RecipeViewer (sheet), PrimaryButton.
- **States:** default; **empty saved** ("No saved recipes yet — tap the heart to save"); **loading** (image-placeholder shimmer grid); **error** (retry); **offline** (saved recipes available from synced cache; browse-new disabled with note).
- **Interactions:** save toggles heart and syncs to backend (recipes now round-trip, not localStorage-only); add-to-plan writes into the active plan; tap scale .97.
- **Premium:** none (browsing/saving free); Concierge Swaps within a recipe is premium.
- **Light/dark:** cards white on light; save heart uses `--macro-fat` rose when active.

### Grocery
- **Purpose:** auto-built shopping list from the active plan, plus manual items.
- **Top bar:** "Grocery" title, clear-checked action.
- **Layout:** sectioned checklist grouped by aisle/category; each row is a GroceryItem with checkbox, name, quantity; sticky "add item" field; progress "12 of 20 got".
- **Components:** SectionHead, GroceryItem (checkbox row), Input, ProgressPill.
- **States:** default; **empty** ("Your list builds from your plan — generate a plan or add items"); **loading** (shimmer rows); **error** (retry); **offline** (fully functional from cache; edits queue and sync).
- **Interactions:** check/uncheck with tap scale .97; swipe to delete; add manual item; checked items collapse to bottom.
- **Premium:** none.
- **Light/dark:** checked rows drop to `--muted` with strike; category heads use micro-labels.

### You / Profile
- **Purpose:** identity, goals, quick stats, and entry points to Weight, Insights, Billing, Settings.
- **Top bar:** "You" title, edit action.
- **Layout:** avatar + name + goal summary card; StatTile row (current weight, streak, plan adherence); a list of destinations (Weight, Insights, Achievements, Grocery, Billing & subscription, Settings, Help); sign-in/out state. (This tab replaces the old drawer — there is no drawer.)
- **Components:** ProfileHeader, StatTile, ListRow (with chevron), Avatar, PremiumBadge.
- **States:** default (signed in); **guest** ("Create an account to sync across devices" + primary); **loading** (header + tiles shimmer); **error** (profile load fails — cached values + retry); **offline** (cached profile, edits queue).
- **Interactions:** each ListRow routes to a real URL; edit opens profile sheet; tap scale .97.
- **Premium:** premium badge if subscribed; "Billing & subscription" always present.
- **Light/dark:** avatar radius 13; list dividers use `--hairline`.

### Weight
- **Purpose:** log and trend body weight against goal.
- **Top bar:** "Weight" title, add-entry action.
- **Layout:** hero current weight (34px, 800, tabular-nums) + delta vs goal; trend chart (duotone line, jade over faint grid); list of recent entries with edit/delete.
- **Components:** HeroStat, TrendChart, EntryRow, AddEntrySheet, StatTile.
- **States:** default; **empty** ("Add your first weigh-in to see your trend"); **loading** (chart skeleton); **error** (retry); **offline** (log queues, chart from cache).
- **Interactions:** add-entry sheet; edit/delete entries; scrub chart for values; reduced-motion disables chart draw-on animation.
- **Premium:** none.
- **Light/dark:** chart line `--brand-jade`; grid `--hairline`; goal marker `--macro-carbs` honey.

### Insights
- **Purpose:** weekly/period analytics — adherence, macro balance, trends.
- **Top bar:** "Insights" title, period selector.
- **Layout (bento):** period SegmentedTabs (**week/month = free**; quarter/year locked behind `insights_pro`); top summary tile (avg calories vs target); macro-balance donut using the duotone set; adherence heat-strip (7/30 cells); a couple of trend mini-charts (calories, protein). Deep-history views, correlations, and export are `insights_pro`.
- **Components:** SegmentedTabs, SummaryTile, MacroDonut, HeatStrip, MiniChart, LockBadge (on pro-only periods/exports).
- **States:** default; **empty** ("Log a few days to unlock insights"); **loading** (tiles + charts shimmer); **error** (retry); **offline** (cached period + banner).
- **Interactions:** switch period (free periods render; tapping a locked quarter/year period or export routes to the Paywall); tap a cell → that day's detail; reduced-motion disables chart animation.
- **Premium:** **basic Insights is free** (current week + month). Only **depth** is Plato Plus (`insights_pro`): longer history, quarter/year, correlations, export — LockBadge + Paywall route.
- **Light/dark:** donut segments use `--macro-*`; heat-strip empty cells `--surface-2`, filled scale toward `--brand-jade`.

### Paywall
- **Purpose:** convert free/trial users to **Plato Plus**; explain the 48h trial.
- **Surface:** routable bottom **GlassSheet** at `/upgrade`, not a centered/full-screen modal.
- **Top bar:** close chevron only (dismisses the sheet).
- **Layout:** headline "Unlock everything Plato Plus can do"; benefit rows for the five gated features (voice log AI, photo logging, restaurant mode, concierge swaps, insights pro — deep history + export); plan toggle (monthly/annual) with price; primary "Start 48-hour free trial"; fine print (renews, cancel anytime); restore purchases. **Do not list barcode as a Plus benefit — barcode is free.**
- **Components:** BenefitRow, PlanToggle, PriceTag, PrimaryButton, LegalFinePrint.
- **States:** default; **loading** (Stripe checkout spinner on primary); **error** ("Payment couldn't start — try again"); **trial-active** ("You're on a free trial — 31h left"); **offline** ("Reconnect to start your trial").
- **Interactions:** primary opens Stripe checkout; toggle swaps price; tap scale .97. Contextual variant leads with the relevant benefit (e.g. reason = "voice").
- **Light/dark:** primary uses `--brand-jade` (dark) / `--brand-deep` (light); benefit check icons `--success`.

### Billing
- **Purpose:** manage an active subscription (Stripe) — plan, renewal, payment method, cancel.
- **Top bar:** "Billing & subscription" title, back.
- **Layout:** status card (plan name, price, renewal date, trial countdown if applicable); manage rows (change plan, update payment method → Stripe portal, billing history); danger row "Cancel subscription".
- **Components:** StatusCard, ListRow, StripePortalButton, DangerRow, InvoiceRow.
- **States:** default (active); **trial** (countdown + "You'll be charged on <date>"); **canceled** ("Access ends <date>", CTA to resubscribe); **loading** (status shimmer); **error** ("Couldn't load billing — retry"); **offline** ("Reconnect to manage billing").
- **Interactions:** manage actions deep-link to the Stripe customer portal; cancel shows a confirm sheet with retention copy.
- **Light/dark:** cancel/danger row uses `--danger`; status accents `--success`.

### Settings
- **Purpose:** preferences — theme, units, notifications, water goal, account, data.
- **Top bar:** "Settings" title, back.
- **Layout:** grouped list — Appearance (theme: **system / dark / light**), Units (metric/imperial), Goals (water target default 2000 ml, calorie/macro overrides), Notifications, Account (email, password reset, sign out), Data (export, delete account), About (version, help).
- **Components:** SettingsGroup, ToggleRow, SegmentedRow, StepperRow, ListRow, DangerRow.
- **States:** default; **loading** (rows shimmer on first load); **error** (save fails — inline "Couldn't save, retry"); **offline** (changes apply locally and queue).
- **Interactions:** toggles/steppers write immediately and sync; theme switch flips `[data-theme]` (tri-state system/dark/light); password reset opens the reset flow.
- **Light/dark:** theme control previews both; group heads are micro-labels.

### Auth
- **Purpose:** sign up / log in / reset password.
- **Surface:** routable bottom **GlassSheet** (`/auth/login · /auth/signup · /auth/reset/:token`), not a centered modal.
- **Top bar:** close chevron (dismisses the sheet) or back within the reset flow.
- **Layout:** SegmentedTabs (Sign up / Log in); email + password fields; primary; "Forgot password?" → reset step (email → "Check your inbox" confirmation → new-password screen from link). Guest continue if applicable.
- **Components:** SegmentedTabs, Input, PasswordField, PrimaryButton, InlineError, ResetFlow.
- **States:** default; **loading** (primary spinner); **error** (inline field errors — "That email's already in use", "Wrong password"); **empty** (fields not yet filled — primary disabled); **offline** ("You're offline — connect to sign in"); **reset-sent** (confirmation).
- **Interactions:** validate inline; Enter submits; reset flow is multi-step; tap scale .97.
- **Light/dark:** field focus ring `--brand-jade`; error text `--danger`.

### Empty / Error (shared system)
- **Purpose:** one consistent visual system for all empty, error, offline, and 404 states.
- **Layout:** centered fluid **duotone illustration** (sanctioned illustration moment), a sentence-case headline, one line of guidance, and a single primary action.
- **Components:** EmptyState (illustration + headline + body + action), ErrorState, OfflineBanner, NotFound (404), ErrorBoundaryFallback.
- **States:** empty (per-screen copy, from each brief above); generic error ("Something went wrong — try again"); offline banner (global, sticky top); 404 ("This page doesn't exist" + "Go home"); crash boundary ("Plato hit a snag" + reload).
- **Interactions:** primary retries or routes home; reduced-motion swaps animated illustrations for static duotone PNGs.
- **Light/dark:** illustrations use `--macro-*` duotone pairs; text `--ink`/`--sage`.

---

## §E. Review each output (QA)

A screen isn't "done" until it passes in **both themes**:

- **Tokens & copy:** no `#14B8A6`, `#6366F1`, `#0B0F1A`, `Inter`, or `Space Grotesk`; every color resolves to a §A token. No Title Case / ALL CAPS outside 10px micro-labels; copy is real and specific. `tabular-nums` on aligned digits; hero stats 800 weight at 34/30px.
- **Mobile fit:** correct at 430px down to 360px; no horizontal scroll; single column; content clears the 104px nav safe-area; tap targets ≥ 44px.
- **Light/dark:** both themes in one bundle; toggling `[data-theme="light"]` changes only token values — never layout, spacing, or radii; dark uses `.mesh-dark`, light uses plain `--bg-base` (no mesh).
- **Reduced motion:** `prefers-reduced-motion` disables orb fill, parallax, chart draw-on, Plan Reveal, celebrations; static fallbacks show.
- **Accessibility:** AA contrast (verify jade/deep on light); visible `--brand-jade` focus rings; semantic roles/labels; charts and the orb expose a text equivalent.
- **Self-contained:** single bundle, inline CSS/fonts/images, no CDN/remote requests.

When you have each screen's public bundle URL, import it for staging with the `import-claude-design-from-url` tool (one call per screen, titled `Plato — Elevated Verdant — <ScreenName>`; URLs expire ~1h). Then we execute the phased implementation plan (§12 Part B of the full spec) to wire it into the React repo.
