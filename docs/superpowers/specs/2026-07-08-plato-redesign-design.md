# Plato — "Elevated Verdant" redesign spec

> **Status:** approved direction, ready for Claude Design generation → import → implementation
> **Date:** 2026-07-08
> **Scope:** full product + design redesign (new IA + visuals, and all known gap-fixes)
> **Platform:** React 19 + Vite + Tailwind v4 mobile-first web app (PWA), max content width 430px
> **Reference concept:** the approved visual direction is captured in the "Elevated Verdant v2" concept board (Home + onboarding, cooler muted teal-jade). This spec is the complete blueprint behind it.

## What this document is

This is the definitive redesign spec for Plato, a nutrition tracking and meal-planning app. It is written to be **fed into Claude Design** to generate the interface, and then **imported back into this React repo and implemented** (see §12 for the packaging + implementation plan). Every screen, state, flow, token, and gap-fix is specified.

**How to read it:** §0 is the authoritative decision ledger — where any section conflicts with §0, §0 wins. §1 is the design-token foundation every other section references. §2 is the navigation/route source of truth. §3–§8 and §5B specify every screen and flow. §9 is the engineering/data-model source of truth. §10–§11 define the component and motion systems. §12 is the Claude Design + implementation handoff.

## Design principles

1. **One theme, everywhere.** A single "Elevated Verdant" system (cooler, muted teal-jade) runs from onboarding through the whole app — no more light-onboarding / dark-app clash. Dark-first, with a real light mode.
2. **Depth is earned with light, not clutter.** Glassmorphism, mesh gradients, and layering create premium depth; heavy WebGL/3D is reserved for four signature moments and everything else stays CSS-light and fast.
3. **The number is the hero.** Nutrition is numbers — tabular, confident, legible. Typography and the macro orb carry the screen; chrome recedes.
4. **Fast, then warm.** Get to value in ~60 seconds with smart defaults, but make it feel like a coach, not a form.
5. **Log in one tap, from anywhere.** The FAB and quick paths make logging the lowest-friction action in the app.
6. **Mobile-first and honest.** Designed at 430px, every state (empty, loading, error, offline, over-target) is specified. Sentence case, active voice, real copy.

## Table of contents

- **§0 — Canonical decisions (source of truth)**
- **§1 — Design system & foundation**
- **§2 — Information architecture & navigation**
- **§3 — Onboarding (fast + coach hybrid)**
- **§4 — Home / daily dashboard**
- **§5 — Logging hub & meal entry**
- **§5B — Explore (discovery)**
- **§6 — Plans, recipes, grocery & restaurant**
- **§7 — Tracking, profile & insights**
- **§8 — Monetization, auth, account & settings**
- **§9 — Backend, data model & gap-fix engineering**
- **§10 — Component library & 3D signature moments**
- **§11 — Motion & interaction system**
- **§12 — Claude Design packaging & implementation plan**

---


## 0. Canonical decisions (source of truth)

This section is authoritative. **Where any later section conflicts with a decision here, this section wins.** It exists to resolve the handful of cross-section choices (routing, navigation model, premium split, data model) so that Claude Design and implementation read one consistent story.

### 0.1 Navigation model — no drawer
The left drawer is **removed**. The five-tab floating glass bottom nav is the only primary navigation:

`Home · Plans · [ + FAB ] · Explore · You`

- The **avatar** in the top bar navigates to the **You** tab (`/you`). It never opens a drawer. The word "drawer" does not appear anywhere in the shipped product.
- **You** is the hub for everything formerly in the drawer: Profile & Stats, Weight, Insights, Achievements, Settings, Billing, Account.
- The **+ FAB** opens the **Log hub** (§5).

### 0.2 Route table (single source of truth)
Real, nested URL routes (React Router). Sub-navigation (Plans segments, Log modes) are **real routes**, not query params. Browser back/forward works; every screen is deep-linkable except transient sheets noted below.

| Area | Route | Notes |
|---|---|---|
| Onboarding | `/welcome`, `/onboarding/:step` | `step ∈ welcome · basics · goal · activity · preferences · reveal · ready` |
| Home | `/home` (also `/`) | |
| Log hub | `/log` | Sheet with in-sheet modes: search · quick · manual |
| Log overlays | `/log/voice` · `/log/scan` · `/log/photo` | Full-screen capture overlays (mic/camera) |
| Plans | `/plans/week` · `/plans/recipes` · `/plans/restaurant` · `/plans/grocery` | Segmented control = real nested routes |
| Recipe detail | `/plans/recipes/:recipeId` | |
| Explore | `/explore` | Discovery tab (§5B) |
| You hub | `/you` | Profile & stats |
| You sub | `/you/weight` · `/you/insights` · `/you/achievements` · `/you/settings` · `/you/billing` · `/you/account` | |
| Auth | `/auth/login` · `/auth/signup` · `/auth/reset/:token` | Rendered as a routable bottom **GlassSheet** |
| Upgrade | `/upgrade` | Paywall bottom **GlassSheet** |
| Public share | `/share/plan/:shareId` | Read-only shared plan view |

Transient surfaces without their own route: the meal-confirm sheet, plan-config/regenerate sheet, toasts.

### 0.3 Log hub composition
The Log hub (`/log`) is a bottom sheet with a mode selector exposing **six** entry methods:
- **In-sheet modes** (render inside the sheet): `Search` (USDA), `Quick` (common foods), `Manual` (first-class 6th mode — a distinct manual-entry form, not folded into Quick).
- **Overlay modes** (open a full-screen capture route): `Voice` → `/log/voice`, `Scan` (barcode) → `/log/scan`, `Photo` → `/log/photo`.

All six feed the shared **meal-confirm sheet** (slot, quantity, live macro preview, save).

### 0.4 Premium — "Plato Plus"
Brand name for the paid tier is **Plato Plus**. Trial is **48 hours**, always displayed in **hours** (e.g. `trial · 41h left`) — never in days. Gating rejection is **HTTP 402** everywhere (client and server).

Canonical entitlement enum (snake_case, server-authoritative — used identically in every section, including `entitlements.features[]`):

`voice_ai · photo_ai · restaurant_mode · concierge_swaps · insights_pro`

| Capability | Tier | Entitlement key |
|---|---|---|
| Core logging: search, quick, manual | Free | — |
| **Barcode scanning** | **Free** (deliberate — drives the logging habit) | — |
| Meal plan generation, grocery, weight, water, streaks, achievements | Free | — |
| Basic Insights (current week + current month) | Free | — |
| Voice AI logging | Plus | `voice_ai` |
| Photo AI logging | Plus | `photo_ai` |
| Restaurant Mode | Plus | `restaurant_mode` |
| Concierge Swaps | Plus | `concierge_swaps` |
| Insights Pro (deep history, quarter/year, correlations, export) | Plus | `insights_pro` |

Insights is **free for the current week + month**; only depth (longer history, correlations, export) is `insights_pro`. Barcode is **never** gated.

### 0.5 Data model & backend
- **§9 is the engineering source of truth** for the data model and endpoints. Where §6 (or any section) shows a different schema for plans/recipes/grocery, §9 supersedes it; §6's tables are illustrative.
- Meal plans & saved recipes **sync to the backend** (JSON-blob model per §9): `meal_plans` (with `meals_json`), `saved_recipes`. Grocery state persists as `grocery_json` on the active plan (plus localStorage for offline).
- **All API endpoints are under `/api`** (e.g. `/api/profile`, `/api/log`, `/api/plans`). Any bare-path shorthand in §4–§8 is `/api`-relative. Fix the legacy `api.ts` bug: `'/profile'` → `'/api/profile'`.
- Water hydration goal default: **2000 ml** (8 × 250 ml cups). DB `water_goal_ml INTEGER DEFAULT 2000`.
- Goal enum (locked): `lose-fat · maintain · build-muscle · athletic`. No `cut`/`lose` variants.

### 0.6 Theme model
Tri-state, stored as `plato.theme = system | light | dark` (default `system`, which resolves dark-first for new installs). This replaces the legacy boolean `AppContext.dark`. Settings exposes a 3-way System / Light / Dark control. The no-flash head script reads `plato.theme` and resolves `system` via `prefers-color-scheme`.

### 0.7 Macro-bar gradient (token fix)
Macro progress bars fill with a **same-family** gradient (a light tint → the macro's base color) — bars stay in their own color family for unambiguous coding. Add these tint tokens to §1 (they are canonical, not ad-hoc):
- `--macro-protein: linear-gradient(90deg,#5FD4C4,#43C6AC)` (aqua → jade; protein is the hero macro)
- `--macro-carb: linear-gradient(90deg,#F0CC9C,#E7B67C)` (`--macro-carb-lite #F0CC9C` → honey)
- `--macro-fat: linear-gradient(90deg,#ECBFC6,#E1A0AB)` (`--macro-fat-lite #ECBFC6` → rose)

The stray hexes `#D99E5C` and `#C97F8E` (from a §4.5 draft) are **removed** — they are not part of the palette.

### 0.8 Surface types
- **Auth** and **Paywall** are bottom **GlassSheets** (routable at `/auth/:mode` and `/upgrade`), not centered modals.
- **Onboarding steps** use the keys in §0.2 (`welcome · basics · goal · activity · preferences · reveal · ready`).


## 1. Design system & foundation

This is the backbone of the "Elevated Verdant" redesign. Every other section references the tokens, roles, and recipes defined here — nothing downstream may invent a new hex, radius, duration, or type size. The palette is cooler and more muted than legacy Plato: a teal-jade brand with a warm honey counterpoint, rendered on near-black forest surfaces in dark (default) and soft off-white in light. The system unifies the three conflicting legacy palettes into one duotone-driven token set, standardizes glass and mesh as reusable recipes, and defines the theming, typography, motion, and shape primitives that hold the whole app together.

Design principles that these tokens serve:

- **Calm depth, not decoration.** Depth comes from layered surfaces, hairline borders, glass, and mesh light — CSS everywhere except the four signature 3D moments. Nothing is flat, nothing is loud.
- **One accent, disciplined.** Jade `#43C6AC` is the brand and the only "hero" color. Macro colors (aqua, honey, rose) and semantic colors read as a coordinated family, never a rainbow.
- **Muted, adult, premium.** Saturation is deliberately restrained. Text is sage-tinted rather than pure gray. Warmth appears only as a counterpoint (honey), never as the lead.
- **Mobile-first, thumb-first.** Everything sizes to a 430px content column, 8px rhythm, generous tap targets, and a floating glass bottom nav.
- **Sentence case, always.** All real UI copy — labels, buttons, headings, empty states — is sentence case. The only uppercase in the product is the 10px micro-label.

---

### 1.1 Color token system

All colors are defined once as CSS custom properties on a `:root`/`[data-theme]` scope (§1.11) and surfaced to Tailwind v4 via `@theme` (§1.12). The tables below are the single source of truth. **Never hardcode a hex in a component — reference the token.**

#### 1.1.1 Dark theme (default / primary)

The app boots dark. Dark is the reference experience — every screen is designed dark-first, then adapted to light.

| Token | CSS variable | Value | Role |
|---|---|---|---|
| Page base | `--bg-base` | `#070D0C` | App background, behind mesh |
| Base 2 | `--bg-base-2` | `#0A1210` | Secondary background / scroll underlay |
| Surface 1 | `--surface-1` | `#0E1614` | Lowest raised surface (bars, list rows) |
| Surface 2 | `--surface-2` | `#121C19` | Standard card / tile surface |
| Surface 3 | `--surface-3` | `#17231E` | Raised / hovered / nested surface |
| Hairline border | `--border-hairline` | `rgba(160,205,190,.09)` | Default 1px separators, card outlines |
| Glass border | `--border-glass` | `rgba(160,215,200,.12)` | Border on glass cards + floating nav |
| Strong divider | `--border-strong` | `rgba(160,215,200,.18)` | Emphasized dividers, focus outlines |
| Glass fill | `--glass-fill` | `rgba(16,26,22,.50)` | Backdrop-blurred glass surface fill |
| Text primary (ink) | `--text-primary` | `#EAF1EF` | Headings, primary copy, hero digits |
| Text secondary (sage) | `--text-secondary` | `#94A9A3` | Secondary copy, labels, inactive nav |
| Text muted | `--text-muted` | `#5F726D` | Hints, disabled, timestamps, placeholders |
| On-accent | `--text-on-accent` | `#04231C` | Text/icon on jade fills |

#### 1.1.2 Light theme (secondary; specified for every screen)

Light is fully supported and specified per screen. The brand ramp is unchanged; the one substitution is that **primary interactive elements use `deep #0F9482` instead of jade** so filled buttons and links clear AA contrast on light surfaces.

| Token | CSS variable | Value | Role |
|---|---|---|---|
| Page base | `--bg-base` | `#F3F7F4` | App background, behind soft mesh |
| Base 2 | `--bg-base-2` | `#EEF3F0` | Secondary background (reuses surface-3 tone) |
| Surface 1 | `--surface-1` | `#FFFFFF` | Cards, sheets, top-level surfaces |
| Surface 2 | `--surface-2` | `#F7FAF8` | Tiles, secondary surfaces |
| Surface 3 | `--surface-3` | `#EEF3F0` | Nested / hovered surfaces |
| Hairline border | `--border-hairline` | `rgba(12,58,50,.10)` | Default separators |
| Glass border | `--border-glass` | `rgba(12,58,50,.08)` | Glass card + nav border |
| Glass fill | `--glass-fill` | `rgba(255,255,255,.62)` | Backdrop-blurred glass fill |
| Text primary | `--text-primary` | `#0E1614` | Headings, primary copy |
| Text secondary | `--text-secondary` | `#48605A` | Secondary copy, labels |
| Text muted | `--text-muted` | `#7E938C` | Hints, disabled, placeholders |
| On-accent | `--text-on-accent` | `#04231C` | Text/icon on jade / deep fills |

> Light-mode `--border-strong` is `rgba(12,58,50,.16)` (derived, one step up from glass border) for focus rings and emphasized dividers. This is the only derived border value.

#### 1.1.3 Brand ramp (shared, both themes)

A cool teal-jade ramp, muted. Jade is the primary brand accent; deep is the AA-safe interactive on light.

| Token | CSS variable | Value | Role |
|---|---|---|---|
| Forest | `--brand-forest` | `#0C3A32` | Deepest brand shade — tinted fills, gradient anchors, chart baselines |
| Deep | `--brand-deep` | `#0F9482` | Primary interactive on **light**; mid-ramp gradient stop |
| Jade (PRIMARY) | `--brand-jade` | `#43C6AC` | The brand. Calorie/energy, primary accent on dark, rings, active nav, focus glow |
| Mint | `--brand-mint` | `#8CE0CE` | Lightest brand — highlights, gradient tops, glints, success sparkle |

Interactive-primary is resolved per theme via a semantic alias so components never branch:

| Alias | Dark resolves to | Light resolves to |
|---|---|---|
| `--interactive-primary` | `--brand-jade` (`#43C6AC`) | `--brand-deep` (`#0F9482`) |
| `--interactive-primary-text` | `--text-on-accent` (`#04231C`) | `--text-on-accent` (`#04231C`) |

#### 1.1.4 Macro / duotone colors (the unified palette)

These replace the three conflicting legacy palettes. **Every macro visualization app-wide uses exactly these four hues plus the spare.** Each macro fill uses a same-family gradient (light→brand direction) so bars and rings feel dimensional, not flat.

| Macro | Token | Base hex | Fill gradient (90deg) |
|---|---|---|---|
| Calories / energy | `--macro-cal` | `#43C6AC` (jade — the brand) | `linear-gradient(90deg,#8CE0CE,#43C6AC)` |
| Protein | `--macro-protein` | `#5FD4C4` (aqua) | `linear-gradient(90deg,#5FD4C4,#43C6AC)` |
| Carbs | `--macro-carbs` | `#E7B67C` (honey) | `linear-gradient(90deg,#F0CC9C,#E7B67C)` |
| Fat | `--macro-fat` | `#E1A0AB` (rose) | `linear-gradient(90deg,#ECBFC6,#E1A0AB)` |
| Spare accent | `--macro-accent` | `#AEA6EA` (violet) | `linear-gradient(90deg,#C6BFF2,#AEA6EA)` |

Usage rules:
- Calories always reads as the brand (jade). Do not tint calories any other color.
- The spare **violet** is reserved for a fifth data dimension only when needed (e.g. fiber, an extra chart series, a tag). Never use it as a general accent.
- The lighter gradient stops above (`#F0CC9C`, `#ECBFC6`, `#C6BFF2`, `#8CE0CE`) are derived tints of the base hue, defined once as `--macro-*-lite` variables (e.g. `--macro-carb-lite #F0CC9C`, `--macro-fat-lite #ECBFC6`). They exist **only** as gradient companions — never as standalone fills or text.

#### 1.1.5 Semantic roles

Feedback colors, drawn from the same family so status never clashes with data. Only **danger** introduces a new hue (rose-red) — everything else reuses brand/macro colors.

| Role | Token | Value | Used for |
|---|---|---|---|
| Success | `--success` | `#43C6AC` (jade) | Confirmations, goal met, positive deltas, checkmarks |
| Warning | `--warning` | `#E7B67C` (honey) | Approaching limit, soft cautions, trial-ending nudges |
| Danger | `--danger` | `#E1616C` (rose-red) | Errors, destructive actions, over-target overflow, failed sync |
| Info | `--info` | `#5FD4C4` (aqua) | Neutral tips, informational toasts, sync-in-progress |

Each semantic color also defines a low-alpha `-soft` companion for tinted backgrounds (badges, banners, over-target track fills), generated at ~12% alpha over the current surface:

| Token | Dark value | Light value |
|---|---|---|
| `--success-soft` | `rgba(67,198,172,.12)` | `rgba(67,198,172,.14)` |
| `--warning-soft` | `rgba(231,182,124,.12)` | `rgba(231,182,124,.14)` |
| `--danger-soft` | `rgba(225,97,108,.12)` | `rgba(225,97,108,.14)` |
| `--info-soft` | `rgba(95,212,196,.12)` | `rgba(95,212,196,.14)` |

**Over-target treatment (referenced by Home/Log):** when a macro or calorie total exceeds its target, the fill past 100% renders in `--danger` (or `--danger-soft` for the track), the numeric turns `--danger`, and a small "over by N" micro-label appears. Warning (`--warning`) is used at ≥90% of target as the pre-overflow cue.

---

### 1.2 Signature mesh gradient

The mesh is the app's atmospheric backdrop — a layered set of radial gradients over the base color, with a warm honey counterpoint low-right and a faint dot-grain overlay. It sits behind content on Home, Insights, onboarding, and full-screen modals. It is **static by default** (a painted background), animating only in reduced-motion-safe signature moments (§1.10).

#### 1.2.1 Dark mesh recipe (canonical)

Applied as a stacked `background-image` on the app root (below content, above `--bg-base`):

```css
--mesh-dark:
  radial-gradient(58% 42% at 80% 6%,  rgba(67,198,172,.15), transparent 70%),  /* jade, top-right */
  radial-gradient(48% 40% at 10% 20%, rgba(15,148,130,.13), transparent 72%),  /* deep, upper-left */
  radial-gradient(44% 48% at 92% 84%, rgba(231,182,124,.06), transparent 74%), /* honey warm counterpoint, lower-right */
  radial-gradient(60% 60% at 32% 102%,rgba(95,212,196,.08), transparent 76%),  /* aqua, bottom */
  linear-gradient(162deg, #08110E, #060B0A, #080F0D);                          /* base wash */
```

Plus a grain overlay layer on top of the mesh, below content:

```css
.mesh-grain::after {
  content: "";
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,…3px dot pattern…"); /* 3px dot-grain tile */
  background-size: 3px 3px;
  opacity: .40;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

- The grain is a 3px repeating dot texture at ~40% opacity, `mix-blend-mode: overlay`, to kill banding on the smooth radials and add a tactile film-grain feel. Ship it as an inline `data:` SVG or a tiny tiled PNG — never a network request.
- Content sits above both layers; both layers are `pointer-events: none`.

#### 1.2.2 Light mesh recipe

The light mesh is far subtler — brand tints at very low alpha over the soft off-white base, no visible grain (or grain at ≤15% opacity):

```css
--mesh-light:
  radial-gradient(58% 42% at 80% 6%,  rgba(67,198,172,.10), transparent 70%),
  radial-gradient(48% 40% at 10% 20%, rgba(15,148,130,.07), transparent 72%),
  radial-gradient(44% 48% at 92% 84%, rgba(231,182,124,.05), transparent 74%),
  radial-gradient(60% 60% at 32% 102%,rgba(95,212,196,.05), transparent 76%),
  linear-gradient(162deg, #F5F9F6, #F3F7F4, #EFF4F1);
```

#### 1.2.3 Macro-tinted mesh variants

For focused surfaces that belong to a single macro (e.g. a protein detail sheet, a macro celebration burst), swap the top-right radial's color to that macro's base hue at the same alpha. These are named `--mesh-dark-protein`, `--mesh-dark-carbs`, `--mesh-dark-fat` and used sparingly for context.

---

### 1.3 Glassmorphism recipe

Glass is the material for cards, sheets, and the floating nav — a blurred, faintly-lit pane that lets the mesh glow through. Two blur tiers.

#### 1.3.1 Card glass (standard)

```css
.glass-card {
  background: var(--glass-fill);          /* dark: rgba(16,26,22,.50) · light: rgba(255,255,255,.62) */
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-card);       /* 22px */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.05),   /* top inner glint */
    0 18px 34px -28px rgba(0,0,0,.9);       /* soft grounding drop */
}
```

#### 1.3.2 Floating nav / overlay glass (heavier)

Same recipe with **`backdrop-filter: blur(24px)`** and a slightly stronger border (`--border-strong`), used for the floating bottom nav, the top bar when scrolled, and modal chrome. It reads as "closer to the viewer."

#### 1.3.3 Rules and fallbacks

- **Light-mode inner glint:** the `inset 0 1px 0 rgba(255,255,255,.05)` is barely visible on white; keep it (it's harmless) but rely on `--border-glass` for definition. Add `inset 0 -1px 0 rgba(12,58,50,.04)` on light for a faint bottom edge.
- **No `backdrop-filter` support / low-power:** fall back to a solid tint — dark `#101A16` at ~92% opacity, light `#FFFFFF` at ~92% — so text contrast never degrades. Provide via `@supports not (backdrop-filter: blur(1px))`.
- **Never nest glass on glass.** A glass card's children use solid `--surface-*` tones, not more blur, to avoid muddy stacking and blur cost.
- **Performance:** cap the number of simultaneously-blurred layers on screen (target ≤4). Offscreen glass should not force compositing where avoidable.

---

### 1.4 Elevation & shadow scale

Elevation is expressed through surface tone first, border second, shadow third. Shadows are soft, tight, and downward — they ground, they don't spotlight. All shadows are defined dark-first; light adjusts alpha down.

| Level | Token | Dark shadow | Use |
|---|---|---|---|
| 0 — flush | `--shadow-0` | `none` | Backgrounds, list rows on surface |
| 1 — raised | `--shadow-1` | `0 4px 12px -8px rgba(0,0,0,.7)` | Tiles, chips, quiet cards |
| 2 — card | `--shadow-2` | `inset 0 1px 0 rgba(255,255,255,.05), 0 18px 34px -28px rgba(0,0,0,.9)` | Glass cards (the canonical card shadow) |
| 3 — floating | `--shadow-3` | `0 24px 48px -24px rgba(0,0,0,.95)` | Floating nav, FAB, sheets, popovers |
| 4 — modal | `--shadow-4` | `0 40px 80px -32px rgba(0,0,0,.95)` | Full modals, paywall, voice overlay |
| glow — accent | `--shadow-glow` | `0 0 0 1px rgba(67,198,172,.5), 0 8px 28px -10px rgba(67,198,172,.35)` | Focused/active jade elements, primary CTA hover, live orb halo |

Light-theme shadows use the same offsets/blur with alpha reduced (`rgba(12,58,50,α)` at roughly one-third the dark alpha) so they read as gentle grounding on white, never heavy. The accent glow in light uses `--brand-deep` in the ring for contrast.

---

### 1.5 Typography

The type system pairs a characterful variable grotesque for display with a clean variable grotesque for body/UI. **We deliberately avoid Inter and Space Grotesk** (the AI-default look). All faces are variable fonts, self-hosted and preloaded — no runtime network fetch, no FOIT.

#### 1.5.1 Font families

| Role | Font | Notes |
|---|---|---|
| Display / headings / hero stats | **Bricolage Grotesque** (variable) | Characterful, slightly warm grotesque with real personality. Used for hero digits, screen titles, section heads. Tight tracking. |
| Body / UI | **Hanken Grotesk** (variable) — or **Geist** (variable) as the alternate | Clean, legible, neutral-modern. Used for all body, labels, buttons, inputs, captions. Pick one and hold it app-wide. |
| System fallback stack | `'SF Pro Display', ui-sans-serif, -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif` | Applies to both roles before the variable fonts load and on failure. |

Declared as tokens:

```css
--font-display: "Bricolage Grotesque", 'SF Pro Display', ui-sans-serif, -apple-system, system-ui, sans-serif;
--font-body:    "Hanken Grotesk", 'SF Pro Display', ui-sans-serif, -apple-system, system-ui, sans-serif;
```

Loading: `@font-face` with `font-display: swap`, `<link rel="preload">` the two primary weights (display 800, body 400/500), subset to Latin. Because both fallback and primary are grotesques, the swap is visually quiet.

#### 1.5.2 Type scale

Sizes in px, mobile-first. Line-height 1.5 for body copy; tighter for display. All headings and body copy are **sentence case**.

| Token | Size | Weight | Line-height | Tracking | Font | Use |
|---|---|---|---|---|---|---|
| `--text-hero` | 34 (30 compact) | 800 | 1.0 | -.03em | display | Hero stat — calories left, big numbers, orb center |
| `--text-title` | 27 | 700 | 1.1 | -.02em | display | Screen title (top bar / page header) |
| `--text-section` | 20 | 600 | 1.2 | -.01em | display | Section head ("Today", "Your macros", "Up next") |
| `--text-body-lg` | 15 | 500 | 1.5 | 0 | body | Primary body, list titles, input text |
| `--text-body` | 14 | 400/500 | 1.5 | 0 | body | Default body copy, meal names |
| `--text-secondary` | 13 | 400 | 1.45 | 0 | body | Secondary copy, meta, helper text |
| `--text-caption` | 11 | 500 | 1.3 | .01em | body | Captions, chip labels, timestamps |
| `--text-micro` | 10 | 600 | 1.2 | .16–.24em | body | **Micro-label only** — uppercase section eyebrows |

> Hero stat and screen title only ever use the display face. Body-lg down is always the body face. Never mix a display weight into running copy.

#### 1.5.3 Numerics

- `font-variant-numeric: tabular-nums` **everywhere digits align or update** — calorie counters, macro grams, ring centers, stat tiles, weight log, timers. This prevents digit jitter as values change.
- Hero stats: display face, **800 weight, `letter-spacing: -.03em`**, tabular-nums. Pair a large number with a small sage unit label (e.g. `1,240` big / `kcal left` in `--text-micro`).
- Deltas (+/−) use the semantic color (`--success` up-good / `--danger` over) and keep tabular alignment in stat rows.

#### 1.5.4 Micro-labels

- **10px, uppercase, `letter-spacing: .16–.24em`, `--text-secondary` (sage), weight 600.**
- Used exclusively as eyebrows/section tags and tiny unit labels (e.g. `TODAY`, `PROTEIN`, `KCAL`). This is the *only* place uppercase appears in the product.
- Everything else — buttons, headings, labels, empty-state copy, nav labels — is **sentence case**. Never Title Case, never ALL CAPS outside the micro-label.

---

### 1.6 Spacing scale

An 8px base rhythm with a curated ramp. Reference by token; do not use off-scale values.

| Token | Value | Typical use |
|---|---|---|
| `--space-0` | 2px | Hairline nudges, icon-to-text micro-gaps |
| `--space-1` | 4px | Tight inline gaps |
| `--space-2` | 6px | Chip padding, dense list gaps |
| `--space-3` | 8px | Base unit — default small gap |
| `--space-4` | 10px | Control inner padding |
| `--space-5` | 12px | Card inner padding (compact), row gaps |
| `--space-6` | 16px | Standard card padding, section gaps |
| `--space-7` | 20px | Comfortable card padding, group spacing |
| `--space-8` | 24px | Screen edge gutters, major block spacing |
| `--space-9` | 32px | Section-to-section separation |
| `--space-10` | 44px | Large hero spacing, top-of-screen breathing room |

- **Screen gutters:** 24px (`--space-8`) left/right on the 430px content column; 16px on very small viewports.
- **Bottom safe-area pad:** reserve **~104px** at the bottom of every scroll view to clear the floating glass nav (`--space-safe-bottom: calc(104px + env(safe-area-inset-bottom))`).
- **Top safe area:** honor `env(safe-area-inset-top)` under the contextual top bar.

---

### 1.7 Radii

Rounded, organic, consistent. Reference by token.

| Token | Value | Applied to |
|---|---|---|
| `--radius-card` | 22px | Cards, sheets, modals |
| `--radius-tile` | 20px | Large bento tiles, quick-add grid cells |
| `--radius-control` | 16px | Inputs, buttons, segmented controls, list rows |
| `--radius-pill` | 9999px | Pills, chips, toggles, macro-tag badges, premium pill |
| `--radius-fab` | 21px | Center FAB (superellipse-leaning squircle) |
| `--radius-avatar` | 13px | Avatars, thumbnails, app-icon-style images |

> Prefer these over ad-hoc values so corners feel like one family. The 22/20/16 trio keeps nested elements visually concentric (outer card 22, inner tile 20, control 16).

---

### 1.8 Iconography

- **Line icons, single-weight, consistent stroke.** Use a cohesive outline set — **Lucide** is the recommended base (tree-shakeable, MIT, matches the clean-grotesque tone). Do not mix icon families.
- **Stroke width 1.75px** at the default 24px canvas (scales to ~1.5px optical at 20px). Round line caps and joins to match the soft radii.
- **Sizing:** 24px default (nav, actions), 20px inline/compact, 16px dense (chips, meta rows), 28–32px feature/empty-state.
- **Color:** icons inherit `currentColor` — `--text-secondary` at rest, `--text-primary` when active/emphasized, `--interactive-primary` (jade/deep) for the active nav item and primary affordances, semantic colors for status.
- **Filled variants** are reserved for active states (active bottom-nav tab may use a subtly filled/tinted glyph) and for macro dots. Everything else stays outline.
- Provide `aria-hidden` on decorative icons; icon-only buttons get an `aria-label`.

---

### 1.9 Fluid / organic shape usage

The brand leans organic — living, cellular, softly asymmetric — to offset the precise grotesque type and grid.

- **Blobs & orbs:** the Macro Orb (§1.10) and empty-state illustrations use soft, animated blob geometry filled with duotone gradients (macro hues → forest). Blobs are asymmetric superellipses, never perfect circles, and drift subtly (motion-gated).
- **Fluid dividers & masks:** section transitions and card headers may use a gentle wave/blob mask rather than a straight line for hero areas (kept subtle, not skeuomorphic).
- **Squircle affordances:** FAB (`--radius-fab`) and primary buttons lean superelliptical rather than pill/rounded-rect where a "physical" feel helps.
- **Duotone illustration language:** all illustrations (empty states, onboarding spot art) are two-tone gradients from a macro/brand hue to `--brand-forest`, on transparent, so they sit naturally on both mesh backdrops. No photographic art, no flat clip-art.
- Organic shapes are decorative: they never carry information alone and always respect reduced-motion (they freeze, they don't disappear).

---

### 1.10 Motion tokens

Motion is quick, decelerating, and physical. It confirms and guides; it never blocks. All animation honors `prefers-reduced-motion`.

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 140ms | Taps, hovers, toggles, chip selection, micro-feedback |
| `--dur-base` | 240ms | Standard transitions, sheet open, page transition, card enter |
| `--dur-slow` | 420ms | Emphasis, expand/collapse, larger surface changes |
| `--ease-out` | `cubic-bezier(.22,.61,.36,1)` | Default easing — decelerate into rest |
| `--spring` | stiffness 320 / damping 30 | Framer Motion spring for playful/physical moves (FAB, orb, drag) |
| `--tap-scale` | .97 | Active-state scale on pressable elements |
| `--stagger` | 60ms / item | List/grid entrance stagger |

Named motion patterns (reuse these; don't reinvent):

- **Page transition:** fade + 12px slide, `--dur-base`, `--ease-out`. Direction follows nav depth (forward slides up-in, back slides down-out).
- **Tap:** scale to `--tap-scale` on press-down, spring back on release; pair with haptic where available.
- **Ring / orb fill:** 800ms decelerate — calorie ring and Macro Orb fill animate over 800ms with `--ease-out` when values change or on first paint.
- **Stagger:** lists and bento grids enter with `--stagger` per item (cap total stagger so long lists don't feel slow — clamp to first ~8 items).
- **Toast / banner:** slide-in from top or bottom, `--dur-base` in, `--dur-fast` out.
- **Celebration:** streak/milestone mesh bursts are haptic-timed and use the spring; strictly a signature-moment behavior (§1.10.1).

#### 1.10.1 Signature 3D moments (the only heavy WebGL/Spline)

Everything else is CSS depth. Heavy 3D is confined to these four:

1. **The Macro Orb** — a living WebGL sphere on Home that fills with light as macros are logged.
2. **Plan Reveal** — onboarding "building your plan" blooms into a 3D Spline scene as macros lock in.
3. **Empty states** — fluid duotone illustrations (may be lightweight 3D or animated SVG blobs).
4. **Streak & milestone celebrations** — mesh bursts with haptic-timed motion.

**Performance budget (mandatory):** lazy-load all 3D; ship a static gradient/PNG fallback that renders first; pause rendering when offscreen or tab-hidden; and fully respect `prefers-reduced-motion` and low-power/save-data conditions by falling back to the static asset. No 3D on the critical first paint.

#### 1.10.2 Reduced motion

Under `prefers-reduced-motion: reduce`:

- Disable float, parallax, orb animation, mesh drift, and celebration bursts — swap to static equivalents.
- Keep essential state feedback (opacity fades, color changes) but drop transforms/slides, or shorten to ≤100ms.
- Page transitions become a plain cross-fade.

---

### 1.11 Theming mechanics (light / dark)

- **Strategy: `data-theme` attribute on `<html>`.** `<html data-theme="dark">` (default) or `data-theme="light"`. All tokens are declared as CSS variables under `:root` (dark defaults) with a `[data-theme="light"]` override block. Components read variables only — they never branch on theme in JS or hardcode a per-theme hex.

```css
:root, [data-theme="dark"] {
  --bg-base:#070D0C; --surface-2:#121C19; --text-primary:#EAF1EF;
  --interactive-primary:var(--brand-jade); /* …full dark set… */
}
[data-theme="light"] {
  --bg-base:#F3F7F4; --surface-1:#FFFFFF; --text-primary:#0E1614;
  --interactive-primary:var(--brand-deep); /* …full light set… */
}
```

- **Source of truth:** a **tri-state** preference `plato.theme = system | light | dark` (persisted in `localStorage`, default `system`), replacing the legacy `AppContext.dark` boolean. Settings exposes a 3-way **System / Light / Dark** control. `system` resolves via `prefers-color-scheme`, and **for new installs resolves dark-first** to match the reference design. On mount, on toggle, and on `prefers-color-scheme` change (while `system`), resolve to an effective `'dark' | 'light'` and set `document.documentElement.dataset.theme` accordingly.
- **No flash:** set `data-theme` in an inline head script before first paint. The script reads `plato.theme` from localStorage synchronously; if it is `system` (or unset) it resolves the effective theme via `window.matchMedia('(prefers-color-scheme: light)')` (defaulting to dark), so there's no light-on-dark flash. `<meta name="color-scheme" content="dark light">` and update `<meta name="theme-color">` per effective theme so the mobile browser chrome matches.

```html
<script>
  (function () {
    try {
      var pref = localStorage.getItem('plato.theme') || 'system';
      var effective = pref === 'light' || pref === 'dark'
        ? pref
        : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.dataset.theme = effective;
    } catch (e) {
      document.documentElement.dataset.theme = 'dark';
    }
  })();
</script>
```
- **Brand ramp is theme-invariant** — only surfaces, text, borders, glass, mesh, and `--interactive-primary` swap. This keeps macro/data colors identical across themes (a protein bar is aqua→jade in both).
- **Every screen spec must state both themes.** Where a screen relies on the dark mesh, its light note must specify the light mesh (§1.2.2) and the `deep`-based interactive substitution.

---

### 1.12 Token → CSS variables → Tailwind v4 mapping

Tailwind v4 is configured via CSS-first `@theme`. Tokens flow: **canonical value → CSS custom property → `@theme` binding → utility class.** This gives us `bg-surface-2`, `text-secondary`, `border-glass`, `rounded-card`, `shadow-2`, `duration-base`, `ease-out`, etc., all resolving to the variables above.

```css
/* app.css */
@import "tailwindcss";

/* 1. Canonical tokens (dark defaults) */
:root, [data-theme="dark"] {
  --bg-base:#070D0C; --bg-base-2:#0A1210;
  --surface-1:#0E1614; --surface-2:#121C19; --surface-3:#17231E;
  --border-hairline:rgba(160,205,190,.09);
  --border-glass:rgba(160,215,200,.12);
  --border-strong:rgba(160,215,200,.18);
  --glass-fill:rgba(16,26,22,.50);
  --text-primary:#EAF1EF; --text-secondary:#94A9A3; --text-muted:#5F726D; --text-on-accent:#04231C;
  --brand-forest:#0C3A32; --brand-deep:#0F9482; --brand-jade:#43C6AC; --brand-mint:#8CE0CE;
  --interactive-primary:var(--brand-jade);
  --macro-cal:#43C6AC; --macro-protein:#5FD4C4; --macro-carbs:#E7B67C; --macro-fat:#E1A0AB; --macro-accent:#AEA6EA;
  --success:#43C6AC; --warning:#E7B67C; --danger:#E1616C; --info:#5FD4C4;
  /* radii, spacing, motion, fonts as defined in §1.5–1.10 */
}

/* 2. Light overrides */
[data-theme="light"] {
  --bg-base:#F3F7F4; --bg-base-2:#EEF3F0;
  --surface-1:#FFFFFF; --surface-2:#F7FAF8; --surface-3:#EEF3F0;
  --border-hairline:rgba(12,58,50,.10);
  --border-glass:rgba(12,58,50,.08);
  --border-strong:rgba(12,58,50,.16);
  --glass-fill:rgba(255,255,255,.62);
  --text-primary:#0E1614; --text-secondary:#48605A; --text-muted:#7E938C; --text-on-accent:#04231C;
  --interactive-primary:var(--brand-deep);
}

/* 3. Bind tokens into Tailwind's theme so utilities generate */
@theme inline {
  --color-base: var(--bg-base);
  --color-base-2: var(--bg-base-2);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-primary: var(--text-primary);
  --color-secondary: var(--text-secondary);
  --color-muted: var(--text-muted);
  --color-on-accent: var(--text-on-accent);
  --color-brand-forest: var(--brand-forest);
  --color-brand-deep: var(--brand-deep);
  --color-brand-jade: var(--brand-jade);
  --color-brand-mint: var(--brand-mint);
  --color-interactive: var(--interactive-primary);
  --color-macro-cal: var(--macro-cal);
  --color-macro-protein: var(--macro-protein);
  --color-macro-carbs: var(--macro-carbs);
  --color-macro-fat: var(--macro-fat);
  --color-macro-accent: var(--macro-accent);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-info: var(--info);

  --radius-card: 22px;
  --radius-tile: 20px;
  --radius-control: 16px;
  --radius-fab: 21px;
  --radius-avatar: 13px;

  --font-display: "Bricolage Grotesque", 'SF Pro Display', ui-sans-serif, -apple-system, system-ui, sans-serif;
  --font-body: "Hanken Grotesk", 'SF Pro Display', ui-sans-serif, -apple-system, system-ui, sans-serif;

  --ease-out: cubic-bezier(.22,.61,.36,1);
}
```

Mapping conventions for downstream sections:

| Token family | Tailwind utility examples |
|---|---|
| Surfaces | `bg-base`, `bg-surface-1/2/3` |
| Text | `text-primary`, `text-secondary`, `text-muted`, `text-on-accent` |
| Brand / interactive | `text-brand-jade`, `bg-interactive`, `ring-brand-jade` |
| Macros | `bg-macro-protein`, `text-macro-carbs` (gradients applied via arbitrary `bg-[linear-gradient(...)]` using the §1.1.4 recipes) |
| Semantics | `text-danger`, `bg-success/10`, `border-warning` |
| Borders | `border-[color:var(--border-hairline)]`, `border-[color:var(--border-glass)]` (or aliased utilities `border-hairline`, `border-glass`) |
| Radii | `rounded-card`, `rounded-tile`, `rounded-control`, `rounded-fab`, `rounded-avatar`, `rounded-full` |
| Motion | `duration-[140ms|240ms|420ms]`, `ease-[var(--ease-out)]` |
| Spacing | native Tailwind scale, but constrain to the §1.6 ramp; expose `pb-safe` = `--space-safe-bottom` |

- **Composite recipes** (glass card, mesh backdrop, elevation shadows) ship as small `@utility`/component classes (`.glass-card`, `.glass-nav`, `.mesh-dark`, `.shadow-2`, `.shadow-glow`) rather than long arbitrary strings repeated across the app — components reference the class, the class references the tokens.
- **One rule for every downstream section:** if a value isn't in these tables, it doesn't exist. New needs get a new token added *here*, not a raw hex or magic number in a component.


## 2. Information architecture & navigation

This section defines the navigational skeleton of the redesigned Plato. It replaces the current state-based `activeTab` switch with a real URL router, introduces a floating glass bottom nav with a central log FAB, and makes the top-bar avatar navigate to a first-class **You** tab (no drawer), and specifies every screen, transition, safe-area rule, and responsive behavior. All colors, radii, spacing, and motion values reference the canonical "Elevated Verdant" tokens; no new values are introduced here.

### 2.1 IA principles

The redesign is governed by five rules that every downstream screen section inherits:

1. **One primary action per screen, one destination per URL.** Every meaningful state that a user can land on, bookmark, share, or reach via browser back must have a URL. Modals and sheets that represent a distinct task also get URLs so back/forward and refresh behave predictably.
2. **Logging is always one tap away.** The log hub is reachable from the persistent center FAB on every top-level screen, regardless of which tab is active.
3. **Five destinations, no more.** The bottom nav exposes exactly Home, Plans, the FAB, Explore, and You. Everything secondary (Profile, Weight, Insights, Achievements, Settings, Billing, Account) lives inside the **You** tab; Grocery lives under Plans (`/plans/grocery`). There is no drawer.
4. **Depth is shallow.** Most flows are one or two levels deep. Detail screens push over the tab; the Plans segmented control (Week / Recipes / Restaurant / Grocery) is a UI affordance backed by **real nested routes** (`/plans/week`, `/plans/recipes`, `/plans/restaurant`, `/plans/grocery`), not query params (see §0 canonical route table).
5. **Mobile-first, single column, 430px.** The app is a centered 430px column on any viewport. Larger screens frame that column rather than reflowing it into multi-pane layouts (see §2.9).

### 2.2 Full screen inventory

The table below is the definitive map of every screen, modal, and sheet. "Type" is one of: **Tab** (top-level, in bottom nav), **Push** (full screen pushed over a tab, has a back affordance), **Sheet** (bottom sheet over dimmed backdrop), **Modal** (centered dialog over dimmed backdrop), **Overlay** (full-bleed immersive layer), **System** (error/404/offline). "Nav shell" indicates whether the floating bottom nav and contextual top bar are visible.

| # | Screen | Type | Route | Nav shell | Premium | Purpose (one line) |
|---|--------|------|-------|-----------|---------|--------------------|
| 1 | Home / Today | Tab | `/home` | Both | — | Daily dashboard: macro orb, streak, macro bars, logged + planned meals, water, quick stats. |
| 2 | Plans (Week) | Tab | `/plans/week` | Both | — | 7-day meal plan, day switcher, per-meal detail. |
| 3 | Plans → Recipes | Tab (segment) | `/plans/recipes` | Both | — | Saved recipe book, browse & save. |
| 4 | Plans → Restaurant | Tab (segment) | `/plans/restaurant` | Both | Restaurant Mode | Restaurant menu macro matching. |
| 5 | Recipe detail | Push | `/plans/recipes/:recipeId` | Top only | — | Full recipe: ingredients, steps, macros, add-to-log. |
| 6 | Restaurant detail | Push | `/plans/restaurant/:placeId` | Top only | Restaurant Mode | One venue's menu with best-fit picks. |
| 7 | Explore | Tab | `/explore` | Both | — | Discovery tab — quick-add grid, trending foods, entry points. Fully specified in §5B. Explore. |
| 8 | You (hub) / Profile & stats | Tab | `/you` | Both | — | Profile summary, editable profile/goal/activity, computed macro targets + list of secondary destinations. |
| 9 | Insights | Push | `/you/insights` | Top only | Insights Pro (depth) | Trends & correlations; current week+month free, deeper history `insights_pro`. |
| 10 | Weight | Push | `/you/weight` | Top only | — | Weight history chart, log new weight, goal line. |
| 11 | Grocery list | Tab (segment) | `/plans/grocery` | Both | — | Aggregated shopping list from the active plan. |
| 12 | Achievements | Push | `/you/achievements` | Top only | — | Streaks, milestones, badges. |
| 13 | Settings | Push | `/you/settings` | Top only | — | Theme (system/light/dark), units, notifications, water goal, data. |
| 14 | Billing / subscription | Push | `/you/billing` | Top only | — | Trial status, plan, Stripe manage-subscription, invoices. |
| 15 | Account | Push | `/you/account` | Top only | — | Email, password, sign-out, delete account, legal links. |
| 16 | Log hub | Sheet | `/log` | Sheet only | — | Entry hub: in-sheet Search · Quick · Manual + overlay Voice · Scan · Photo. |
| 17 | Log → Search (in-sheet) | Sheet | `/log` (search mode) | Sheet only | — | USDA food search + add. |
| 18 | Log → Quick (in-sheet) | Sheet | `/log` (quick mode) | Sheet only | — | Common-foods quick add. |
| 19 | Log → Manual (in-sheet) | Sheet | `/log` (manual mode) | Sheet only | — | First-class manual macro-entry form (6th mode). |
| 20 | Log → Voice | Overlay | `/log/voice` | Overlay | `voice_ai` | Voice capture → LLM macro extraction. |
| 21 | Log → Scan | Overlay | `/log/scan` | Overlay | — | Camera barcode scan → product macros (free). |
| 22 | Log → Photo | Overlay | `/log/photo` | Overlay | `photo_ai` | Camera photo → AI food recognition → macros. |
| 23 | Meal editor | Sheet | `/log/edit/:entryId` | Sheet only | — | Edit an existing logged entry (portion, macros, meal slot). |
| 24 | Onboarding | Overlay | `/welcome`, `/onboarding/:step` | None | — | Fast-but-coach setup, unified dark theme, ~60s to value. Steps: welcome · basics · goal · activity · preferences · reveal · ready. |
| 25 | Plan reveal | Overlay | `/onboarding/reveal` | None | — | Signature 3D plan bloom as macros lock (the `reveal` step). |
| 26 | Auth | Sheet | `/auth/:mode` (`login`/`signup`) | Sheet only | — | Sign in / create account — routable bottom GlassSheet. |
| 27 | Password reset | Sheet / Push | `/auth/reset/:token` | Sheet / standalone | — | Complete password reset from email link. |
| 28 | Paywall | Sheet | `/upgrade` (+ `?feature=`) | Sheet only | — | Plato Plus pitch + Stripe checkout — routable bottom GlassSheet. |
| 29 | Plan share (public) | Push (deep link) | `/share/plan/:shareId` | Minimal | — | Read-only shared plan view for recipients. |
| 30 | Toast | Ephemeral | (no route) | Above nav | — | Transient confirmations/errors. |
| 31 | 404 / not found | System | `*` fallback | Minimal | — | Unknown route. |
| 32 | Error boundary | System | (no route) | None | — | Caught render crash, recover CTA. |
| 33 | Offline / reconnect | System banner | (no route) | Below top bar | — | Network lost / restored. |

Photo logging uses the `photo_ai` entitlement and Voice uses `voice_ai` (distinct keys) — see §2.5 gating and §0 canonical entitlement enum.

### 2.3 Floating glass bottom nav

The bottom nav is a persistent floating glass bar present on all five top-level tabs. It is the app's spine.

**Structure (left → right):** Home · Plans · **[ + FAB ]** · Explore · You. Five slots: four labeled tab items and one raised center FAB.

**Visual spec.**

- Container floats above the page, not flush to the edge: `left`/`right` inset **16px** (spacing scale), sitting **16px** above the bottom safe-area inset. The page reserves **~104px** bottom padding (token) so content never hides behind it.
- Fill: glass surface fill `rgba(16,26,22,.50)` (dark) / `rgba(255,255,255,.62)` (light); border 1px glass border `rgba(160,215,200,.12)` (dark) / `rgba(12,58,50,.08)` (light); `backdrop-filter: blur(24px)` (the heavier floating-nav blur, not the 16px card blur); shadow `inset 0 1px 0 rgba(255,255,255,.05), 0 18px 34px -28px rgba(0,0,0,.9)`.
- Radius: pills/chips full — the bar itself is a full-radius stadium.
- Height: 64px of touch surface; each tab item is a min 44×44 target.

**Tab item spec.**

- Icon 24px (lucide-react) + micro-label beneath: 10px, uppercase-avoided — use sentence-case here per copy rules, so the labels read "home", "plans", "explore", "you" at 10px, letter-spacing .16em, sage `#94A9A3`.
- **Inactive:** icon + label in muted `#5F726D`.
- **Active:** icon + label in jade `#43C6AC` (dark) / deep `#0F9482` (light), with a soft jade underglow (a blurred jade radial behind the active icon at low opacity). No hard pill background — the glow is the indicator, keeping the glass clean.
- Active transition: icon color + glow animate in over dur-base 240ms, ease-out `cubic-bezier(.22,.61,.36,1)`; tap scale .97 on press.
- Badges: a small jade dot (top-right of icon) may appear on Plans (new plan ready) or You (billing action needed). Never a numeric badge on Home.

**Center FAB spec.**

- The FAB is raised: it overlaps the top edge of the bar by ~10px so it reads as a distinct floating button.
- Shape: radius **21** (FAB token) — a superellipse-feel rounded square, not a full circle, to differentiate from the pill tabs.
- Fill: jade→deep gradient using the brand ramp (`linear-gradient` from jade `#43C6AC` to deep `#0F9482`); glyph is a `+` in on-accent `#04231C`; subtle inset top highlight `inset 0 1px 0 rgba(255,255,255,.05)`.
- Size: 56px.
- Press: tap scale .97, spring (stiffness 320 / damping 30) on release.
- **Action:** opens the **Log hub sheet** (`/log`) — never navigates to a tab. It is a modal action layered over whatever tab is active, so the user returns to their exact place on dismiss.

**Reduced motion / low power.** Active-tab glow cross-fades without the blurred-orb pulse; FAB press uses opacity/scale snap without spring overshoot when `prefers-reduced-motion: reduce`.

### 2.4 The FAB and the Log hub

Tapping the FAB opens `/log` as a bottom sheet over a dimmed backdrop (`rgba(0,0,0,.9)`-derived scrim at reduced opacity so the underlying tab stays faintly visible). The sheet slides up 240ms ease-out; the FAB glyph rotates `+ → ×` and becomes the sheet's close affordance.

**Log hub layout (sheet, `/log`).** A grab handle, a title "log a meal" (screen-title scale is oversized here — use section-head 20px), then a 2-column bento of entry tiles (large-tile radius 20, glass recipe). Six entry methods total: three **in-sheet modes** that render inside the sheet (no route change) and three **overlay modes** that open a full-screen capture route (see §0.3 log-hub composition):

| Tile | Target | Icon | Gating | Notes |
|------|--------|------|--------|-------|
| Search foods | in-sheet: search mode | search | free | USDA search; default focus tile. |
| Quick log | in-sheet: quick mode | zap | free | Common-foods quick add. |
| Manual entry | in-sheet: manual mode | pencil | free | First-class 6th mode — distinct manual macro-entry form, not folded into Quick. |
| Voice log | overlay: `/log/voice` | mic | `voice_ai` | Shows lock chip if not entitled. |
| Scan barcode | overlay: `/log/scan` | scan-line | free | Camera → product lookup (barcode is never gated). |
| Snap a photo | overlay: `/log/photo` | camera | `photo_ai` | AI recognition; lock chip if not entitled. |

All six feed the shared meal-confirm sheet (slot, quantity, live macro preview, save). Below the grid, a "recent" strip shows the last 3 logged items as chips for one-tap re-log.

**Behavior.**

- Selecting an **in-sheet mode** (search, quick, manual) switches the sheet's mode in place (no route change) using an in-sheet slide; the sheet grows/settles to fit. Back within the sheet (swipe-down partial or the sheet's own back chevron) returns to the hub grid.
- **Voice**, **Scan**, and **Photo** promote to full **Overlay** (`/log/voice`, `/log/scan`, `/log/photo`) because they need the full viewport (waveform, camera). The overlay covers the sheet; dismissing it returns to the hub.
- Dismissing the whole sheet (swipe down past threshold, tap scrim, or FAB ×) pops back to the tab the user came from. The route returns to that tab's URL.
- **States:** default (grid), loading (skeleton tiles while recent items resolve), empty ("nothing logged yet — start with search"), error (a food add failing shows an inline toast, not a hub-level error), offline (Search + Voice + Photo overlays show a muted "needs connection" chip; Scan, Quick, and Manual stay enabled and queue locally — see §2.7 offline).
- **Light + dark:** identical layout. Dark uses surface-2 `#121C19` behind tiles over the mesh; light uses surface-1 `#FFFFFF` tiles on page base `#F3F7F4`. Lock chips use the honey `#E7B67C` warning role outline, not danger.

### 2.5 Where Profile / Settings / secondary screens live — recommendation

**Recommendation: a first-class "You" tab is the hub for all secondary screens — there is no drawer.** Justification:

1. **Discoverability.** A corner avatar tap hides Profile, Weight, Insights, Achievements, Settings, and Account behind an affordance many users never find. A labeled bottom-nav tab surfaces the whole secondary surface at the same tap-cost as Home. The avatar in the top bar simply navigates to the **You** tab (`/you`) — it never opens a drawer.
2. **Depth consistency.** Secondary screens need a natural "home" in the nav model. The **You** tab gives them a parent, so back-navigation and the URL tree (`/you/*`) are coherent.
3. **Billing needs a permanent home.** The new Stripe subscription/account screen, trial status, and premium management must be reliably reachable. A tab guarantees that.
4. **One-hand reach.** Bottom nav is thumb-reachable; a top-left corner trigger is the hardest corner to reach on a 430px phone.
5. **Fewer gesture conflicts.** Not carrying a drawer avoids an edge-swipe gesture that conflicts with browser back and with in-app horizontal segment swipes.

**You tab structure (`/you`).** The `/you` hub *is* Profile & stats: top is a profile summary card (avatar radius 13, name, goal chip, current streak) over the editable profile. Below: a grouped list of destinations, each a full-width row (control radius 16, hairline dividers `rgba(160,205,190,.09)`):

- Account group: **Billing & subscription** (`/you/billing`) — with a trial/plan status chip inline; **Account** (`/you/account`).
- Progress group: **Weight** (`/you/weight`), **Insights** (`/you/insights`), **Achievements** (`/you/achievements`).
- App group: **Settings** (`/you/settings`).

Grocery is **not** a You sub-route — it lives under Plans at `/plans/grocery`. Each You row pushes its screen (`Push` type) with a back chevron in the top bar. The avatar in the top bar navigates to the You tab; it is not a drawer trigger.

### 2.6 Contextual top bar

Every top-level tab and pushed screen has a contextual top bar. It is a lightweight glass strip (card glass recipe, blur 16px), not floating — it's pinned to the top and respects the top safe-area inset.

**Anatomy (3 zones):** leading · title · trailing.

| Screen | Leading | Title | Trailing |
|--------|---------|-------|----------|
| Home | Greeting + date ("good morning" / today's date, secondary sage) | — (no center title; greeting is the title) | Streak flame chip; premium/trial pill if applicable |
| Plans | — | "plans" (27 screen-title on scroll-collapse; large on rest) | Segmented control below bar: Week · Recipes · Restaurant · Grocery |
| Explore | — | "explore" | Search icon (opens `/log` in search mode) |
| You | — | "you" | Theme toggle (sun/moon), quick to `/you/settings` |
| Recipe detail | ← back | recipe name (truncates) | Save/bookmark; overflow (share, add to plan) |
| Restaurant detail | ← back | venue name | Filter icon |
| Grocery | ← back | "grocery" | Share/export |
| Insights | ← back | "insights" | — |
| Weight | ← back | "weight" | Add weight (+) |
| Achievements | ← back | "achievements" | — |
| Settings | ← back | "settings" | — |
| Billing | ← back | "billing" | — |
| Account | ← back | "account" | — |

**Rules.**

- **Leading affordance = navigation semantics.** Tabs have no back chevron (they are roots). Pushed screens always show `←` which triggers a router back to the parent (`/you`, `/plans/*`), not raw browser history, so a deep-linked entry still lands somewhere sensible.
- **Premium/trial pill** lives in the trailing zone on Home only, as a pill (full radius) reading e.g. "trial · 41h left" (honey `#E7B67C` when <12h, otherwise sage). Tapping it routes to `/you/billing` or `/upgrade`.
- **Scroll behavior:** large title on rest, collapses to a compact centered title on scroll (240ms). Home's greeting collapses into a compact "today" label.
- **Light + dark:** dark bar uses glass fill over the signature mesh; light uses `rgba(255,255,255,.62)`. Title text primary ink `#EAF1EF` / `#0E1614`. Never Title Case — "plans", "you", "profile" are all sentence/lower case per copy rules.

### 2.7 URL routing — replacing `activeTab`

The state-based `activeTab` string in AppContext is removed. Routing becomes URL-driven so screens are deep-linkable, shareable, and back/forward-correct, and so refresh restores exact position. Implement with a lightweight router (React Router or equivalent) mounted at the app root; AppContext keeps data state only (userProfile, plan, dailyLog, premium, streak), not navigation state. Theme is the tri-state `plato.theme` (system/light/dark, see §0.6), not the legacy boolean `dark`.

**Route table.** This mirrors the §0 canonical route table (source of truth); it adds only the per-route auth column. If anything here drifts, §0 wins.

| Route | Screen | Auth | Notes |
|-------|--------|------|-------|
| `/` | → redirect | — | Redirects to `/home` (or `/welcome` if not onboarded). |
| `/home` | Home | soft | Default landing. |
| `/plans` | → redirect | soft | Redirects to `/plans/week`. |
| `/plans/week` | Plans · Week | soft | `?day=YYYY-MM-DD` selects a day. |
| `/plans/recipes` | Plans · Recipes | soft | |
| `/plans/recipes/:recipeId` | Recipe detail | soft | Deep-linkable. |
| `/plans/restaurant` | Plans · Restaurant | premium (`restaurant_mode`) | Gated (see §2.5 table). |
| `/plans/restaurant/:placeId` | Restaurant detail | premium (`restaurant_mode`) | |
| `/plans/grocery` | Plans · Grocery | soft | Real nested route; derived from active plan. |
| `/explore` | Explore | soft | Discovery tab (§5B). |
| `/you` | You hub / Profile & stats | soft | Editable profile lives here. |
| `/you/weight` | Weight | hard | |
| `/you/insights` | Insights | soft | Current week+month free; depth is `insights_pro`. |
| `/you/achievements` | Achievements | soft | |
| `/you/settings` | Settings | soft | |
| `/you/billing` | Billing | hard | |
| `/you/account` | Account | hard | Email, password, sign-out, delete. |
| `/log` | Log hub (sheet over last tab) | hard-to-save | Opens as sheet; base tab stays mounted. In-sheet modes: search · quick · manual (no route change). |
| `/log/voice` | Log · Voice (overlay) | premium (`voice_ai`) | |
| `/log/scan` | Log · Scan / barcode (overlay) | hard-to-save | Barcode is free (never gated). |
| `/log/photo` | Log · Photo (overlay) | premium (`photo_ai`) | |
| `/log/edit/:entryId` | Meal editor (sheet) | hard-to-save | |
| `/welcome` | Onboarding start | — | Public; skip if onboarded. |
| `/onboarding/:step` | Onboarding step | — | Steps: `welcome`, `basics`, `goal`, `activity`, `preferences`, `reveal`, `ready`. |
| `/onboarding/reveal` | Plan reveal (3D) | — | The `reveal` step. |
| `/auth/login` | Auth (login) | — | Routable bottom GlassSheet; `?next=` preserves target. |
| `/auth/signup` | Auth (signup) | — | Routable bottom GlassSheet. |
| `/auth/reset/:token` | Password reset complete | — | From email link. |
| `/upgrade` | Paywall (sheet) | — | `?feature=voice\|restaurant\|photo\|swaps` tailors the pitch. |
| `/share/plan/:shareId` | Public shared plan | — | Read-only; no nav shell chrome beyond a minimal top bar. |
| `*` | 404 | — | Not-found fallback. |

**Auth semantics.**

- **soft** — usable in the freemium/trial and even anonymous local state; no redirect.
- **hard** — requires an account; navigating there while signed out opens `/auth/login?next=<route>` as a routable bottom GlassSheet, and completing auth returns to `<route>`.
- **hard-to-save** — the screen renders and lets the user compose, but the terminal save action requires auth; only then does the auth GlassSheet appear (so we don't gate exploration).
- **premium** — requires the corresponding entitlement; navigating there without it opens `/upgrade?feature=…` (see §2.5). Server also enforces (client gating is UX only).

**The `/log` sheet + base-tab preservation.** `/log*` and `/upgrade` are **overlay routes**: the router keeps the previously matched tab route mounted underneath and renders the sheet on top. On dismiss, the router pops back to that base route. Implementation note for Claude Design/handoff: model this with a "background location" pattern (the location the sheet was opened from is stashed; the sheet reads it to render the correct base screen).

### 2.8 Browser back/forward, shareable links, transitions, error/404

**Browser back / forward.**

- Each tab switch, push, and sheet-open is a history entry, so hardware/browser back does the intuitive thing: close the sheet → return to the tab; from a pushed detail → return to its list.
- **Sheets close on back** rather than navigating the underlying tab. Opening `/log` pushes one entry; back closes it. Switching to an in-sheet mode (search/quick/manual) does not change the route; opening an overlay mode (`/log/voice` · `/log/scan` · `/log/photo`) pushes another entry, and back returns to the hub grid, back again closes the sheet.
- **Tab switches replace-or-push:** switching top-level tabs pushes history (so back returns to the prior tab), but re-tapping the *current* tab does not stack duplicate entries — it scrolls-to-top / pops the tab's own inner stack to root instead.
- **Deep-linked entry into a detail** (e.g. opening `/plans/recipes/:id` from a shared link) synthesizes a sensible parent: the top-bar `←` and browser back both land on `/plans/recipes`, not a dead end.
- Forward re-applies the popped entry as expected.

**Shareable links.**

- Public, no-auth: `/share/plan/:shareId` (read-only plan snapshot generated server-side; the `shareId` is an opaque token, not the user id), `/welcome`, `/auth/reset/:token`.
- Recipe deep links (`/plans/recipes/:recipeId`) are shareable; recipients who aren't onboarded get the onboarding gate first, then land on the recipe.
- Plan share also feeds **Plan export/share (PDF)** from `/plans/grocery`/Plans overflow: the share action can produce either a `/share/plan/:shareId` link or a generated PDF.
- Links carrying `?feature=` / `?next=` params round-trip through auth and paywall without loss.

**Page transitions.**

- **Tab ↔ tab:** cross-fade + subtle slide, page-transition token (fade+slide 240ms, ease-out). Direction is neutral (no left/right implication between peer tabs) to avoid implying order.
- **Push (list → detail):** detail slides in from the trailing edge, parent parallaxes back slightly; reverse on back. dur-base 240ms.
- **Sheet:** slides up from bottom, scrim fades in; spring settle (stiffness 320 / damping 30). Dismiss reverses.
- **Overlay (voice/photo/onboarding/reveal):** full-bleed fade-through 240ms; the Plan Reveal is the one place a heavier 3D Spline bloom plays (lazy-loaded, PNG fallback).
- **Segmented control (Plans Week/Recipes/Restaurant/Grocery):** these are real nested routes (`/plans/week` … `/plans/grocery`); content cross-slides horizontally within the tab and the URL updates via `replace` (not push), so browser back leaves Plans rather than cycling segments.
- **Reduced motion:** all of the above degrade to a plain 140ms (dur-fast) opacity fade; no slide, no parallax, no spring, no 3D bloom (static PNG shown instead).
- **Staggered content** inside a freshly-entered screen animates in at 60ms/item, capped so long lists don't cascade for seconds.

**Error boundary.**

- A top-level React error boundary wraps the routed view. On a caught render crash it shows the **Error boundary** screen: a fluid duotone illustration (empty-state style), heading "something broke on our end", body "we've noted it. try again, or head back home.", and two buttons — "reload" (re-mounts the boundary) and "go to home" (routes `/home` and resets the boundary).
- It never shows a raw stack to the user; the error is captured for analytics/event tracking.
- Dark: surface-1 `#0E1614` over mesh, danger accent `#E1616C` used only on the illustration, not the whole screen. Light: surface-1 `#FFFFFF`, deep `#0F9482` primary button.

**404 / not found (`*`).**

- Minimal shell (top bar with the Plato mark, no bottom nav). Duotone "lost plate" illustration, heading "we couldn't find that", body "the link may be old or mistyped.", primary button "go to home" (`/home`), secondary "open the log" (`/log`).
- Same light/dark treatment as the error boundary. Reachable directly (e.g. a stale shared link) so it must render without any app state loaded.

**Offline / reconnect banner.**

- A thin banner slides in below the top bar when the network drops: "you're offline — changes are saved on this device" (info aqua `#5FD4C4` left rule). On reconnect: "back online — syncing" then auto-dismiss after sync completes.
- The banner never blocks interaction; §2.4 governs which log tiles disable offline.

### 2.9 Safe-area handling & responsive behavior

**Safe areas.**

- Use `env(safe-area-inset-*)` throughout. The top bar adds `padding-top: env(safe-area-inset-top)`; the floating nav sits `16px + env(safe-area-inset-bottom)` from the bottom.
- Scrollable content reserves **~104px** (token) of bottom padding so nothing hides behind the floating nav; add `env(safe-area-inset-bottom)` on top of that on notched devices.
- Sheets and overlays extend their fill fully into the bottom inset (the grab handle/CTA sits above the inset) so there's no bare gap under a sheet on a home-indicator device.
- Onboarding overlays are edge-to-edge but keep interactive controls within safe insets.

**Responsive / breakpoints.**

- **Mobile-first, single column, `max-width: 430px`, centered.** This is the design target and the layout column at every width.
- **< 430px (typical phones):** the 430px column shrinks to viewport width; the floating nav's 16px side insets keep it clear of the edges. Bento grids on Home/Insights collapse 2-col tiles to 1-col where a tile would fall below its min legible width.
- **≥ 430px and up (large phones, tablets, desktop, PWA on laptop):** the content column stays pinned at 430px and centers horizontally. The surrounding "gutter" is filled with the **signature mesh** (dark) or a calm surface-2/`#F7FAF8` wash (light) plus the 3px dot-grain overlay, so wide screens read as an intentional framed app rather than a stretched mobile page. The floating nav also caps at ~430px − 32px and centers with the column.
- **Very wide / desktop:** no second pane, no sidebar. Optionally the mesh gutter can host a subtle static Plato mark watermark; no functional chrome moves out of the column. This preserves a single codepath between the PWA and any future native shell and matches the "it stays a mobile-first React web app" constraint.
- **Landscape phones:** the column stays 430px wide and vertically scrolls; the floating nav remains bottom-anchored. Overlays that need the camera (barcode/photo) use the full viewport regardless of the column.
- **Reduced-motion & low-power** interplay with responsive: parallax framing of the gutter mesh is disabled; the mesh renders static.

**Handoff note.** For Claude Design: build every screen inside a single 430px `.app-column` wrapper with the mesh/gutter as a fixed background layer behind it, the top bar pinned inside the column, and the floating nav as a fixed element horizontally centered on the column. Route the whole thing through the §2.7 table with the background-location sheet pattern for `/log*` and `/upgrade`.


## 3. Onboarding (fast + coach hybrid)

Onboarding is Plato's first impression and its most important conversion surface. Today it is functional but broken in three ways: it renders in a **light lavender-to-mint gradient** (`linear-gradient(160deg,#f0fdf4,#eff6ff,#faf5ff)`) that hard-cuts to the dark app the moment it finishes — a jarring theme jump; it uses the **three conflicting legacy palettes** (indigo `#6366f1`, emerald `#10b981`, amber/rose accents) the redesign is retiring; and it is a form-wall, not a coach — four dense screens of fields with no reactivity, no reassurance, and a `TOTAL_STEPS = 3` label that disagrees with the five actual screens.

This section respecs onboarding as a **fast-but-coach hybrid**: born-dark in Elevated Verdant, one focused decision per screen, smart defaults on every field, a lightweight **Coach** presence that reacts to each input in real time, and a signature **Plan Reveal** 3D moment as the payoff. Target: **first meaningful value (a locked macro plan) in ~60 seconds**, roughly **8–14 taps** on the fast path.

**Design principles for this flow**
- **One focused thing at a time.** Each step asks for a single conceptual decision. Related low-friction fields are grouped only when they read as one thought (e.g., height + weight + sex on the "basics" card).
- **Smart defaults, always.** Nothing starts blank. Every control has a sensible pre-selection so a user can tap "Continue" straight through and still get a real plan. Typing is opt-in, not required.
- **The Coach reacts, it doesn't nag.** A single-line, warm, specific reaction under the header updates on every input change. It never blocks, never scolds, and never uses more than one sentence.
- **Progressive disclosure.** Advanced fields (training split, restrictions, cook time) live behind optional expanders so the default path stays short.
- **Defer the account.** No login is required to reach value. Account creation is offered *after* the plan is revealed, framed as "save this plan," with a clear "continue without account" escape.

---

### 3.1 Flow map & step count

The redesigned flow is **7 screens**, of which **4 are intake decisions** (the accurate, honest count — replacing today's mislabeled "3"):

| # | Screen | Key | Kind | Coach present | Counts toward progress bar |
|---|--------|-----|------|---------------|----------------------------|
| 0 | Welcome | `welcome` | Splash | No | No |
| 1 | Basics | `basics` | Intake 1/4 | Yes | Yes (1) |
| 2 | Goal | `goal` | Intake 2/4 | Yes | Yes (2) |
| 3 | Activity | `activity` | Intake 3/4 | Yes | Yes (3) |
| 4 | Food & preferences | `preferences` | Intake 4/4 | Yes | Yes (4) |
| 5 | Building your plan → **Plan Reveal** | `reveal` | 3D moment | Coach voiceover | No (indeterminate) |
| 6 | Plan ready (summary + save) | `ready` | Summary + account | No | No |

**Progress bar** shows **4 segments** (intake steps 1–4 only). Welcome, Reveal, and Ready are outside the counter — this keeps the "how much is left" honest and short. Segment label reads `step 2 of 4`, sentence case, sage `#94A9A3`, tabular-nums.

**Why this grouping.** The legacy flow split "goal" and "training/diet/days" awkwardly across steps 2–3 and dumped six preference fields into a final wall. The regrouping is:
- **Basics** = who you are physically (needed for the BMR math). One card.
- **Goal** = the single most motivating decision (needed for the calorie delta). One choice, big.
- **Activity** = the TDEE multiplier. One choice, big. (Kept separate from Goal so each screen is one tap on the fast path.)
- **Food & preferences** = everything that shapes the *plan* but not the *targets* (diet style, meals/day, and — collapsed — cook time, cuisines, restrictions). Grouped because none of it changes the macro math; it only personalizes recipe selection, so it can be one screen with smart defaults and optional depth.

This yields **4 intake taps minimum** (one per screen, using every default) plus Welcome's "Get started" and Ready's "Start tracking" — a **6-tap absolute-minimum path** to a plan, ~45–60 s including animation.

---

### 3.2 The Coach

The Coach is the warmth layer. It is **not** an avatar-heavy chatbot — it is a persistent, quiet presence that makes the flow feel guided rather than transactional.

**Coach component (`CoachLine`)**
- **Placement:** directly under the screen title on every intake screen, above the input card.
- **Anatomy:** a small `13px` sage-mint orb (a mini, non-WebGL CSS gradient dot — jade `#43C6AC` → mint `#8CE0CE`, `9px`, soft `0 0 12px rgba(67,198,172,.35)` glow) + one line of `14px` text, ink `#EAF1EF` on dark / `#0E1614` on light.
- **Behavior:** the text **crossfades** (`dur-fast 140ms`, `ease-out`) whenever the relevant input changes. The orb does a subtle single pulse (`scale 1 → 1.12 → 1`, `dur-base`) on each reaction to signal "I heard that." Honors `prefers-reduced-motion` (crossfade → instant swap, no pulse).
- **Tone:** warm, specific, second person, one sentence, sentence case, never Title Case. Reacts to the *actual value*, not generic praise.
- **Not a blocker:** the Coach never gates "Continue." Even nonsense input gets a gentle, forward-moving line.

The reactive copy for each screen is specified inline below in the "Coach copy" tables.

---

### 3.3 Theme, background & shell (applies to all onboarding screens)

Onboarding now **shares the app's Elevated Verdant shell** so there is zero theme jump into Home.

- **Background:** the **signature mesh (dark)** — the exact layered radial + linear stack from the tokens, over page base `#070D0C`, with the 3px dot-grain overlay at ~40% opacity, `mix-blend-mode: overlay`. This is the same mesh Home uses; the transition from Ready → Home is a straight `fade 240ms` with **no background change**.
- **Content column:** mobile-first, `max-width: 430px`, centered, horizontal padding `20px`. Bottom safe-area pad `24px` (no floating nav during onboarding — nav appears only after `onComplete`).
- **Cards:** the **glassmorphism recipe** — fill `rgba(16,26,22,.50)`, `1px` glass border `rgba(160,215,200,.12)`, `backdrop-filter: blur(16px)`, inset top highlight + `0 18px 34px -28px rgba(0,0,0,.9)` drop shadow. Card radius `22px`; input radius `16px`; chips full radius.
- **Typography:** display face Bricolage Grotesque (variable) for titles; Geist/Hanken Grotesk for body/UI; system fallback `'SF Pro Display', ui-sans-serif, -apple-system, system-ui`. Screen title `27px`; body `14–15px`; micro-labels `10px` uppercase `letter-spacing .18em` sage; hero stats `34/30px` weight 800 `letter-spacing -.03em` tabular-nums.
- **Primary CTA (dark):** jade fill — `linear-gradient(135deg,#43C6AC,#0F9482)`, text on-accent `#04231C`, radius `16px`, full width, `56px` tall, `tap scale .97`, subtle `0 10px 30px -18px rgba(67,198,172,.6)` lift.
- **Page transitions:** `fade + slide` `240ms` `ease-out`, `x: 24 → 0` forward, `-24 → 0` on back. `AnimatePresence mode="wait"`. Reduced-motion → fade only.

**Light theme (secondary, must be honored):**
- Background: page base `#F3F7F4`; the mesh is dropped to a **static soft wash** — `radial(58% 42% at 80% 6%, rgba(67,198,172,.10))` + `radial(48% 40% at 10% 20%, rgba(15,148,130,.08))` over `#F3F7F4`, no dot-grain. Cards use glass fill `rgba(255,255,255,.62)`, border `rgba(12,58,50,.08)`.
- Text: primary `#0E1614`, secondary `#48605A`, muted `#7E938C`.
- **Primary interactive color shifts to deep `#0F9482`** for AA contrast on light (jade `#43C6AC` is decorative-only on light). CTA fill `linear-gradient(135deg,#0F9482,#0C3A32)`, text `#EAF1EF`.
- The Coach orb, macro duotones, and Plan Reveal palette are unchanged across themes.

Theme selection: onboarding **respects the same `dark` flag** as the app (defaults to dark, the primary theme). If a returning user had light mode, onboarding renders light — but the mesh/wash keeps continuity either way.

---

### 3.4 Screen 0 — Welcome (`welcome`)

**Purpose.** Establish the brand in one breath, promise speed + personalization, and get one tap to start. No decisions, no scroll.

**Layout (top → bottom, vertically centered).**
1. **Logo mark** — the new Plato mark (from the current build) at `72×72`, radius `20px`, sitting on a jade-glow plate (`radial(60% 60% at 50% 30%, rgba(67,198,172,.28), transparent)`), single spring entrance (`stiffness 320 / damping 30`, `scale .82 → 1`).
2. **Wordmark** — "Plato" in Bricolage, `34px`, weight 800, `letter-spacing -.03em`, ink `#EAF1EF`. **No gradient-fill text** (retires the legacy indigo→emerald gradient wordmark).
3. **Tagline** — `15px` sage `#94A9A3`: "Your plan, your macros, your pace." (one line).
4. **Value line** — `13px` muted `#5F726D`, `max-width 280px`, centered: "Answer four quick questions and we'll build a nutrition plan around you — in under a minute."
5. **Primary CTA** — "Get started".
6. **Reassurance** — `11px` caption, muted: "Free to start · no account needed".
7. **Secondary link** — `13px` sage text button: "I already have an account" → opens **Auth (sign-in)** modal in dark Elevated Verdant. On success, skip intake and route to app (see 3.11).

**Inputs:** none. **Smart defaults:** n/a. **Coach:** not present on Welcome (the Coach is introduced at Basics with a self-introducing line).

**Buttons (exact copy):** `Get started` (primary) · `I already have an account` (text link).

**States.**
- *Default:* as above.
- *Loading:* n/a (static, no fetch). 3D and heavy assets are **not** loaded here — the Plan Reveal Spline scene is prefetched lazily starting the moment the user taps "Get started" (idle prefetch), never on Welcome paint.
- *Error / offline:* Welcome is fully local; if offline, still fully functional. "I already have an account" surfaces an inline offline note in the Auth modal (see 3.11) but never blocks the no-account path.

---

### 3.5 Screen 1 — Basics (`basics`) · Intake 1/4

**Purpose.** Collect the physical inputs the BMR math needs — name (for warmth/personalization), sex, age, height, weight — as one calm card. This is the only screen with free-text/number entry, so it leads with the friendliest field (name).

**Header.** Title "Let's start with you" · Coach line below.

**Layout — single glass card, grouped as one thought:**
1. **Name** — text input, radius `16px`, placeholder "First name (optional)". Optional; used only to personalize copy.
2. **Sex** — segmented pill pair `Male` / `Female` (labels sentence case). *Rationale for the field:* Mifflin-St Jeor uses a sex-based constant (+5 / −161). A `13px` muted helper: "Used only for the calorie formula." No third option is required for the math, but if unspecified the flow defaults to the higher-BMR path and lets the user adjust targets later on the plan screen.
3. **Age** — number stepper + input, unit "yrs".
4. **Height** — dual field: `ft` + `in` (imperial default), with a small unit toggle chip `ft/in ⇄ cm`. Storing both; the toggle converts live.
5. **Weight** — number input with unit toggle chip `lb ⇄ kg`.

**Inputs & smart defaults:**

| Field | Control | Default | Range/validation |
|-------|---------|---------|------------------|
| `name` | text | "" (empty, optional) | any; trimmed; ≤ 40 chars |
| `sex` | segmented | `male` | `male` \| `female` |
| `age` | stepper+number | `28` | 13–100; clamps; non-numeric → last valid |
| `height` | ft/in or cm | `5 ft 9 in` (`175 cm`) | 120–220 cm equivalent |
| `weight` | number + unit | `165 lb` (`75 kg`) | 30–250 kg equivalent |
| `units` | toggle | `imperial` | `imperial` \| `metric` |

> Defaults are chosen to produce a believable ~2,200 kcal maintenance plan for the median user, so a straight-through tapper still sees a sensible plan.

**Coach copy (reacts on change):**

| Trigger | Coach line |
|---------|-----------|
| Screen enters | "Hi — I'm your Plato coach. A few quick things and I'll size your plan." |
| Name entered | "Nice to meet you, {name}. This all stays on your device." |
| Weight changed | "Got it. I'll use this as your starting point — you can update it anytime." |
| Age > 55 | "Thanks — I'll keep your metabolism estimate realistic for your age." |
| Height/weight at range edge | "That's a bit outside the usual range — double-check if that looks off." |

**Buttons:** `Continue` (primary, enabled by default since all fields have defaults) · `Skip setup` (text link, muted `11px`, bottom — see 3.10 skip path).

**States.**
- *Default:* pre-filled with defaults; Coach shows the intro line.
- *Filled/valid:* Continue always enabled (defaults are valid).
- *Invalid entry:* out-of-range numbers clamp on blur with a `13px` honey `#E7B67C` inline note ("Age must be 13–100"); never blocks Continue (clamped value is used).
- *Loading/offline:* none (fully local).

**Light vs dark:** card + inputs per 3.3; segmented "active" pill uses jade fill on dark, deep `#0F9482` fill on light.

---

### 3.6 Screen 2 — Goal (`goal`) · Intake 2/4

**Purpose.** The single most motivating decision, given its own screen. Drives the calorie delta applied to TDEE.

**Header.** Title "What's your goal?" · Coach line.

**Layout.** A **2×2 bento** of large goal tiles (radius `20px`, glass). Each tile: a duotone icon plate, title, one-line descriptor, and the **directional calorie hint** (so the choice feels consequential). Selected tile gets a jade ring (`1.5px` jade `#43C6AC` on dark / deep on light) + inset jade glow; unselected are neutral glass.

| Tile | Value | Descriptor | Calorie delta shown | Icon |
|------|-------|-----------|---------------------|------|
| Lose fat | `lose-fat` | "Steady, sustainable deficit" | "−500 kcal/day" | trending-down |
| Maintain | `maintain` | "Hold steady, dial in habits" | "±0 kcal/day" | scale |
| Build muscle | `build-muscle` | "Lean surplus for growth" | "+300 kcal/day" | dumbbell |
| Recomp / athletic | `athletic` | "Fuel performance" | "+200 kcal/day" | bolt |

**Inputs & defaults:**

| Field | Control | Default |
|-------|---------|---------|
| `goal` | single-select tile | `maintain` |

**Coach copy:**

| Selection | Coach line |
|-----------|-----------|
| `lose-fat` | "Good call — I'll set a 500-calorie deficit and keep your protein high to protect muscle." |
| `maintain` | "Maintenance it is. I'll balance your macros so you feel steady all day." |
| `build-muscle` | "Let's grow. Slight surplus, protein-forward — the fun part is eating enough." |
| `athletic` | "Performance mode. I'll fuel your training days without overshooting." |

**Optional expander (progressive disclosure): "Fine-tune pace"** — collapsed by default. Expands to a 3-stop segmented control affecting deficit/surplus magnitude:
- Lose fat: `Gentle −250` · `Steady −500` (default) · `Aggressive −750`
- Build muscle: `Lean +200` · `Standard +300` (default) · `Fast +500`
- (Maintain / athletic hide the expander; delta is fixed.)
Coach reacts, e.g. `Aggressive −750`: "That's a faster cut — I'll bump protein and we'll watch your energy."

**Buttons:** `Continue` · `Skip setup`.

**States.** Default = `maintain` selected. No loading/error (local). Selecting a tile animates the ring in (`dur-base`, `ease-out`) and updates the Coach + the live delta chip.

---

### 3.7 Screen 3 — Activity (`activity`) · Intake 3/4

**Purpose.** Capture the TDEE multiplier. One vertical choice list, one tap.

**Header.** Title "How active are you?" · Coach line.

**Layout.** A vertical list of 5 selectable rows (glass, radius `16px`), each with a title, a plain-language descriptor, and — on the right — the **multiplier chip** (`×1.20` … `×1.90`, tabular-nums, sage) so the mapping is transparent. Selected row shows a jade check disc.

| Row | Value | Descriptor | Multiplier |
|-----|-------|-----------|-----------|
| Sedentary | `sedentary` | "Desk job, little exercise" | ×1.20 |
| Light | `light` | "Light exercise 1–3 days/week" | ×1.375 |
| Moderate | `moderate` | "Exercise 3–5 days/week" | ×1.55 |
| Very active | `very` | "Hard exercise 6–7 days/week" | ×1.725 |
| Elite | `elite` | "Intense daily training or physical job" | ×1.90 |

**Inputs & defaults:**

| Field | Control | Default |
|-------|---------|---------|
| `activity` | single-select row | `moderate` (×1.55) |

**Coach copy:**

| Selection | Coach line |
|-----------|-----------|
| `sedentary` | "No problem — we'll build your plan around real life, not the gym." |
| `light` | "Nice — a little movement goes a long way. I'll account for it." |
| `moderate` | "Solid routine. This is the sweet spot for most people." |
| `very` | "You move a lot — I'll make sure you're eating enough to recover." |
| `elite` | "Serious training load. I'll fuel it and we can refine on training days." |

**Buttons:** `Continue` · `Skip setup`.

**States.** Default = `moderate`. Local-only; no loading/error. On the last intake-derived number changing here, a tiny **live target preview** chip may appear on the Continue button label region — e.g. "≈ 2,240 kcal" (computed on the fly) — to build anticipation. Optional, reduced-motion-safe (no animation, just a value swap).

---

### 3.8 Screen 4 — Food & preferences (`preferences`) · Intake 4/4

**Purpose.** Personalize the *plan* (recipe selection, meal count, diet style) without touching the macro math. Grouped because none of it affects targets, so it can be one screen with strong defaults + collapsed depth. This is the "last question" screen.

**Header.** Title "How do you like to eat?" · Coach line. A `13px` sage subhead: "This shapes your recipes — your macros are already set."

**Layout — one card, two visible groups + one expander:**

**Group A — Diet style** (single-select chip row, full-radius pills):
`Balanced` (default) · `High protein` · `Lower carb` · `Keto` · `Plant-based`

**Group B — Meals per day** (segmented): `3` (default) · `4` · `5` · plus a `+ snacks` toggle chip that adds 1–2 snack slots.

**Expander — "More preferences" (collapsed by default):**
- **Cook time:** `Quick (≤20 min)` · `Moderate` (default) · `Any`.
- **Cuisines you love:** multi-select chips — `Italian` · `Asian` · `Mexican` · `Mediterranean` · `American` · `Indian` (none selected by default = "surprise me / all").
- **Avoid / allergies:** text input, placeholder "e.g. peanuts, shellfish, dairy". Free text, parsed to a tag list on blur.

**Inputs & defaults:**

| Field | Control | Default |
|-------|---------|---------|
| `dietStyle` | single chip | `balanced` |
| `mealsPerDay` | segmented | `3` |
| `snacks` | toggle | `false` |
| `cookTime` | segmented (in expander) | `moderate` |
| `cuisines` | multi-chip (in expander) | `[]` (all) |
| `restrictions` | text (in expander) | "" |

**Coach copy:**

| Trigger | Coach line |
|---------|-----------|
| Screen enters | "Last one. Tell me how you like to eat and I'll pick recipes to match." |
| `plant-based` | "Plant-based — I'll make sure you still hit that protein target." |
| `keto` | "Keto mode. I'll flip your macros carb-low and fat-forward." |
| `high-protein` | "Protein-forward — perfect for holding onto muscle." |
| `restrictions` added | "Noted — I'll steer clear of {list} in your plan." |
| `mealsPerDay` = 5 or snacks on | "Five touchpoints — great for staying full and steady." |

**Buttons:** `Build my plan` (primary — this is the commit CTA, kicks off Screen 5) · `Skip setup`.

**States.**
- *Default:* balanced / 3 meals, expander collapsed.
- *Diet style vs macro coupling:* selecting `keto` / `lower carb` overrides the goal-derived protein/carb ratios (see 3.9 note) and the Coach flags it; other styles only change recipe filtering.
- *Loading/offline:* local-only until "Build my plan."

---

### 3.9 The macro calculation (Mifflin-St Jeor + activity + goal delta)

Targets are computed **client-side, instantly**, at the moment the user taps "Build my plan." No network is required — this is what makes ~60s-to-value achievable offline. The math is the same Mifflin-St Jeor pipeline the current app uses, cleaned up and made transparent to the user.

**Step 1 — BMR (Mifflin-St Jeor).** Inputs converted to metric (kg, cm):

```
BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + s
  where s = +5   if sex = male
            −161 if sex = female
```

**Step 2 — TDEE (activity multiplier).**

```
TDEE = BMR × activityFactor
  sedentary ×1.20 · light ×1.375 · moderate ×1.55 · very ×1.725 · elite ×1.90
```

**Step 3 — Calorie target (goal delta).**

```
calories = round( TDEE + goalDelta )
  lose-fat −500 · maintain 0 · build-muscle +300 · athletic +200
  (delta overridden by the "fine-tune pace" expander when used)
```
A safety floor is applied: `calories = max(calories, sex = female ? 1200 : 1500)` so aggressive-deficit + small-body combinations never drop below a safe minimum; if the floor engages, the Coach notes it on the Ready screen ("I raised your target to a safe minimum").

**Step 4 — Macro split.** Ratios are goal-driven, then overridden by low-carb/keto diet styles:

| Goal | Protein % | Carb % | Fat % (remainder) |
|------|-----------|--------|-------------------|
| lose-fat | 40% | 30% | 30% |
| maintain | 30% | 40% | 30% |
| build-muscle | 35% | 40% | 25% |
| athletic | 30% | 45% | 25% |

Diet-style overrides (applied after goal ratios):
- `lower-carb` → carbs 25%, protein +5%, remainder fat.
- `keto` → carbs 5–10%, fat 65–70%, protein the rest.
- `high-protein` → protein floor of 40% (raises if goal ratio is lower).
- `plant-based` / `balanced` → no ratio change (recipe filter only).

**Step 5 — Grams.**

```
protein_g = round(calories × proteinPct / 4)
carbs_g   = round(calories × carbPct   / 4)
fat_g     = round(calories × fatPct     / 9)
```

**Worked example (defaults).** Male, 28, 175 cm, 75 kg, moderate, maintain:
`BMR = 10×75 + 6.25×175 − 5×28 + 5 = 750 + 1093.75 − 140 + 5 = 1708.75`
`TDEE = 1708.75 × 1.55 ≈ 2648` → `calories ≈ 2648` (delta 0)
maintain split 30/40/30 → `protein ≈ 199g · carbs ≈ 265g · fat ≈ 88g`.

**Where it runs.** Pure function `calcMacros(profile)` in `useMacros`/`mealGenerator` land, no side effects, memoized. The result feeds both `plan.macros` and, when a user is logged in, the **fire-and-forget backend sync** (`PUT /profile` with `calorie_target`, `protein_target`, `carb_target`, `fat_target`, `weight_kg`, `height_cm`) wrapped in a `4s` `AbortController` timeout, guarded by `HAS_BACKEND` — it **never blocks the reveal** (matching the existing non-blocking sync guarantee). Failures are silent; local state is source of truth.

---

### 3.10 Screen 5 — Building your plan → **Plan Reveal** (`reveal`) · Signature 3D moment #2

This is one of Plato's four sanctioned heavy-3D moments. It transforms "loading" from dead time into the emotional peak of onboarding — the instant abstract answers become a tangible plan.

**Purpose.** Perform (real, sub-second) macro computation + meal-plan generation, and stage it as a **bloom**: a set of macro particles/energy coalescing into a living 3D form that resolves into the user's numbers.

**Two-phase choreography.**

**Phase A — "Coalescing" (~1.2–1.8 s, indeterminate).**
- A **Spline/WebGL scene** boots (already idle-prefetched since Welcome): a dark jade-lit void with slow-drifting duotone particles in the four macro colors — energy jade `#43C6AC`, protein aqua `#5FD4C4`, carbs honey `#E7B67C`, fat rose `#E1A0AB`.
- The **Coach voiceover** (text, no audio) narrates in sequence, one line at a time (crossfade, `stagger 60ms` feel):
  1. "Crunching your numbers…"
  2. "Setting your daily targets…"
  3. "Picking recipes you'll actually want…"
  4. "Almost there…"
- These lines are cosmetic pacing over already-complete local math; total dwell is capped so a fast device never feels padded (min 900 ms so the moment lands, max ~2.2 s).

**Phase B — "Bloom / lock" (~0.8–1.0 s).**
- Particles rush inward and **fuse into the Macro Orb form** — the same living sphere that lives on Home — which pulses once (`ring/orb fill 800ms decelerate`) and "ignites," seeding continuity: the object the user sees born here is the object they'll return to on Home.
- The four macro values **count up** from 0 to target (tabular-nums, `dur-slow 420ms` decelerate) as the orb fills.
- A single haptic-timed pulse on lock (where supported).

**Inputs:** none. **Smart defaults:** n/a. **Buttons:** none (auto-advances to Ready on bloom complete).

**Performance budget & fallbacks (mandatory).**
- **Lazy-load** the Spline scene; begin idle-prefetch on Welcome "Get started" tap, not before.
- **Static fallback:** if WebGL is unavailable, low-power mode is on, the device is low-end, or the scene fails to load within `1.5s`, render a **CSS/PNG duotone fallback** — a static jade-mesh gradient plate with a CSS-only radial "orb" that fills via a conic-gradient sweep and the same count-up numbers. Indistinguishable in intent, zero WebGL.
- **`prefers-reduced-motion`:** disable particle drift, parallax, and the count-up animation → numbers appear resolved instantly on a static orb; keep only a single gentle fade. No haptics.
- **Offscreen/backgrounded:** pause the scene; resume on focus. Dispose the WebGL context on unmount (before Ready) to free GPU memory before Home mounts its own orb.

**States.**
- *Default:* Phase A → B as above.
- *Compute error* (should be near-impossible for local math, but guarded): if `calcMacros` or `generateMealPlan` throws, skip the bloom, fall through to Ready with **default targets** and a Coach note on Ready ("I used a sensible starter plan — you can fine-tune it in Profile."). Never dead-end.
- *3D load failure:* silent → static fallback (above).
- *Offline:* fully functional (all local); only the logged-in profile sync is deferred/queued.

**Light theme:** same scene; the void base uses the light static wash (`#F3F7F4` + soft jade radials) behind the orb; particle colors unchanged; count-up numbers in `#0E1614`.

---

### 3.11 Screen 6 — Plan ready (summary + account) (`ready`)

**Purpose.** Deliver the payoff, make the plan feel *theirs*, and offer — not demand — account creation to save it. This is where deferred auth lives.

**Header.** No progress bar. Title (personalized): "Your plan's ready{, name}." · a `13px` sage line: "Optimized for {goal, humanized} · {mealsPerDay} meals a day."

**Layout (top → bottom):**
1. **Plan summary card** (glass, radius `22px`) — the four macro stats as a 4-up row, each with its duotone value and a `10px` micro-label:
   - Calories — jade `#43C6AC`
   - Protein — aqua `#5FD4C4`
   - Carbs — honey `#E7B67C`
   - Fat — rose `#E1A0AB`
   Values are `30px`, weight 800, tabular-nums. A hairline divider, then a footer line: "{n} recipes · 7-day plan · {calories} kcal/day."
2. **A single-row "what's next" hint** — `13px` muted: "Log your first meal and your Macro Orb comes to life."
3. **Primary CTA:** `Start tracking` → `onComplete()` → app Home (fade `240ms`, same mesh, no theme jump).
4. **Account block (deferred auth):** a subtle glass sub-card below the CTA, not a modal:
   - Title `14px`: "Save this plan across devices"
   - `13px` muted: "Create a free account to back up your plan, streak, and logs."
   - Buttons: `Create account` (secondary, jade outline) · `Continue without account` (text link, sage).
   - `Create account` opens the **Auth modal** in dark Elevated Verdant (email + password, or provider buttons if configured). On success, the just-computed plan + profile are synced (`PUT /profile`, plus plan persistence via the new **meal-plan/recipe backend sync** the redesign adds); on skip, everything stays in localStorage (source of truth) and the account offer resurfaces contextually later (e.g., first time they try premium or when the 48h trial nears its end, shown in hours — e.g. `trial · 8h left`).

**Account placement decision (explicit): DEFER.**
- **Value first, account second.** The account is never required to reach or use the plan. This maximizes activation and honors the "free · no account needed" promise on Welcome.
- **Framed as backup, not gate.** Copy sells the benefit (cross-device, backup) rather than demanding signup.
- **Escape hatch always present.** "Continue without account" is a first-class, visible option — never buried.
- **Server sync is opportunistic.** With no account, `HAS_BACKEND` sync is skipped entirely and the flow is 100% local. With an account, sync is fire-and-forget with the `4s` timeout guard and never blocks navigation.

**Inputs (Ready screen):** none required; optional account fields live in the Auth modal.

**Coach:** the Coach recedes here (job done) — replaced by the plan itself. One optional Coach line may appear above the summary if a safety adjustment fired in 3.9 (floor engaged, keto override, etc.), e.g. "Heads up — I raised your calories to a safe minimum." Otherwise no Coach line.

**Buttons (exact copy):** `Start tracking` (primary) · `Create account` (secondary) · `Continue without account` (text).

**States.**
- *Default:* plan summary populated from local compute.
- *Signed in already* (came via Welcome "I already have an account", or created account here): the account sub-card collapses to a single confirmation chip — "Synced to {email}" with a jade check.
- *Sync pending/failed* (logged in, backend slow/down): the plan is shown immediately regardless; a tiny `11px` sage status "Saving…" → on timeout/failure silently becomes "Saved on this device" (never an error blocker). Retphrasing avoids alarm since local is source of truth.
- *Offline:* plan fully shown; account block shows `Create account` disabled with a `13px` muted note "Connect to the internet to create an account" — `Continue without account` and `Start tracking` remain fully enabled.
- *Empty/degraded plan* (compute fell back to defaults): summary still renders with default targets + the Coach safety note; identical CTAs.

**Light theme:** summary card uses light glass fill; macro duotone values unchanged (they read on light); `Create account` outline uses deep `#0F9482`.

---

### 3.12 Skip paths, resumability & all-states matrix

**Skip.** Every intake screen (1–4) shows a muted `Skip setup` text link. Tapping it opens a small confirm sheet (glass, radius `20px`):
- Title: "Skip and use a starter plan?"
- Body `13px` muted: "We'll set balanced targets you can fine-tune anytime in Profile."
- Buttons: `Use starter plan` (primary) → runs `calcMacros` with **whatever has been entered so far + defaults for the rest**, skips remaining intake, and jumps straight to a lightweight Plan Reveal → Ready. · `Keep going` (text) → dismiss.

This means skipping still produces a *real, personalized-as-far-as-possible* plan, never an empty state.

**Resumability.** Onboarding progress is checkpointed to `localStorage` (`plato.onboarding` = `{ step, form, units }`) on every field change (debounced `300ms`). If the user backgrounds/refreshes the PWA mid-flow:
- On next launch, if `hasOnboarded !== true` and a checkpoint exists, resume at the saved step with the saved `form` — a one-line Coach note: "Welcome back — picking up where we left off."
- On successful `onComplete` (or account creation), the checkpoint is cleared and `hasOnboarded = true` is set (with the existing App.jsx safety guard checking **name + hasOnboarded** so completion never re-triggers onboarding).
- Back navigation (screen ← screen) is supported via the header back affordance on screens 2–4 and preserves entered values (no data loss). Reveal (5) and Ready (6) have no back — the plan is committed.

**Deep-linking note (ties to the routing gap).** Under the redesign's new URL router, onboarding maps to `/welcome` and `/onboarding/:step` where `step ∈ welcome · basics · goal · activity · preferences · reveal · ready` (see §0 canonical route table). `/onboarding/reveal` and `/onboarding/ready` are **not directly linkable** — hitting them without a completed `form` redirects to the earliest incomplete step. Browser back/forward walk the intake steps naturally; the error boundary + 404 route catches malformed onboarding URLs and drops the user at `/welcome`.

**Consolidated states matrix.**

| State | Welcome | Basics/Goal/Activity/Prefs | Reveal | Ready |
|-------|---------|----------------------------|--------|-------|
| Default | Static splash | Defaults pre-filled, Coach active | Bloom animation | Plan + account offer |
| Empty | n/a | n/a (defaults ≠ empty) | n/a | n/a (always a plan) |
| Loading/skeleton | none (no fetch) | none (local) | **is** the loading moment (choreographed) | Sync "Saving…" chip if logged in |
| Error | n/a | Inline clamp notes (honey), non-blocking | Compute error → fallback to defaults + Coach note | Sync fail → "Saved on this device" |
| Offline | Fully works | Fully works | Fully works (local) | Plan shown; `Create account` disabled w/ note |
| Over-target | n/a | n/a | n/a | n/a (targets not yet logged against) |
| 3D unavailable | n/a | n/a | CSS/PNG duotone fallback | n/a |
| Reduced-motion | Instant fade | Instant Coach swap, no pulse | Static orb, resolved numbers | Instant |

---

### 3.13 Exact data collected

The complete set of fields captured across onboarding, their storage, and their downstream use:

| Field | Screen | Type | Default | Persisted to | Feeds |
|-------|--------|------|---------|--------------|-------|
| `name` | Basics | string (opt) | "" | `userProfile.name` (localStorage) + `PUT /profile.name` | Coach copy, greetings |
| `sex` | Basics | enum male\|female | `male` | `userProfile.gender` | BMR constant |
| `age` | Basics | int | `28` | `userProfile.age` | BMR |
| `height` | Basics | {feet,inches} or cm | `5'9"` / `175cm` | `userProfile.height` + `height_cm` | BMR |
| `weight` | Basics | number + unit | `165lb` / `75kg` | `userProfile.weight` + `weight_kg` | BMR, starting weight |
| `units` | Basics | enum imperial\|metric | `imperial` | `userProfile.units` | display/conversion |
| `goal` | Goal | enum lose-fat\|maintain\|build-muscle\|athletic | `maintain` | `planConfig.goal` | calorie delta, macro split |
| `pace` (delta override) | Goal (expander) | enum | goal-standard | `planConfig.pace` | calorie delta |
| `activity` | Activity | enum sedentary\|light\|moderate\|very\|elite | `moderate` | `userProfile.activityLevel` + `activity_level` | TDEE multiplier |
| `dietStyle` | Prefs | enum balanced\|high-protein\|lower-carb\|keto\|plant-based | `balanced` | `planConfig.dietStyle` | macro override, recipe filter |
| `mealsPerDay` | Prefs | int 3–6 | `3` | `planConfig.mealsPerDay` + plan | plan structure |
| `snacks` | Prefs | bool | `false` | `planConfig.snacks` | plan structure |
| `cookTime` | Prefs (expander) | enum quick\|moderate\|any | `moderate` | `planConfig.cookTime` | recipe filter |
| `cuisines` | Prefs (expander) | string[] | `[]` (all) | `planConfig.cuisines` | recipe filter |
| `restrictions` | Prefs (expander) | string → tags | "" | `planConfig.restrictions` | recipe exclusion |

**Derived (computed, not asked)** — written to `plan.macros` and, if logged in, synced: `calories`, `protein_g`, `carbs_g`, `fat_g`, `bmr`, `tdee`. Also written: `plan.meals` (from `generateMealPlan`), `plan.createdAt`, and app flags `hasOnboarded = true`, cleared `plato.onboarding` checkpoint.

**Not collected in onboarding (deliberately deferred to reduce friction):** email/password (offered on Ready only), water target (uses a smart default; set later on Home), premium/trial (48h trial starts on first premium-feature touch, not here).


## 4. Home / daily dashboard

### 4.1 Purpose

Home is the daily heartbeat of Plato. It answers one question in under two seconds — "am I on track today?" — and makes logging the next thing effortless. It is the default screen after onboarding and the tab the user opens most. Everything else (Plans, Explore, You) is a detour from here.

Home is built as a **bento grid** of glass tiles floating over the signature mesh. The emotional anchor is the **Macro Orb**: a living WebGL sphere that fills with light as the day's macros are logged — Plato's signature 3D moment #1. The grid balances that hero moment against dense, glanceable data (macro cards, streak, water) and a friction-free path to the next log (quick-log row, today's plan cards, insights peek).

Home is read-first, act-second. It never demands input; it invites it.

---

### 4.2 Screen anatomy (top → bottom)

```
┌──────────────────────────────────────────┐
│  TOP BAR (contextual, sticky-on-scroll)   │
│  [avatar]  good morning, Maya  [◐] [plus] │
├──────────────────────────────────────────┤
│                                            │
│         HERO — MACRO ORB (WebGL)           │
│         1,340 / 2,150 kcal  · 810 left     │
│                                            │
├───────────────┬───────────────┬───────────┤
│  protein      │  carbs        │  fat      │  ← macro cards row (3-up)
│  94 / 165 g   │  148 / 240 g  │ 41 / 72 g │
├───────────────┴───────┬───────┴───────────┤
│  streak · 12 days      │  water · 5 / 8    │  ← streak + water tiles (2-up)
├───────────────────────┴───────────────────┤
│  QUICK-LOG ROW  (horizontal scroll)        │
│  [＋ search] [🎙 voice] [📷 photo] [▥ scan] │
├────────────────────────────────────────────┤
│  today's plan                    edit ›     │
│  ┌──────────────────────────────────────┐  │
│  │ breakfast · greek yogurt bowl  ＋ log │  │
│  │ lunch · chicken & quinoa       ✓ done │  │
│  │ dinner · salmon, greens        ＋ log │  │
│  │ snack · almonds                ＋ log │  │
│  └──────────────────────────────────────┘  │
├────────────────────────────────────────────┤
│  insights peek                   see all ›  │
│  "you hit protein 5 days running." ▁▃▅▇▅▃   │
├────────────────────────────────────────────┤
│         (bottom safe-area pad ~104px)       │
└────────────────────────────────────────────┘
        ╰─ floating glass bottom nav ─╯
   Home · Plans · [＋ FAB] · Explore · You
```

Content is centered in a **max-width 430px** column. Below the fold, the layout scrolls; the top bar and bottom nav are the only fixed chrome. Bottom padding reserves ~104px so the last tile clears the floating nav.

---

### 4.3 Greeting / top bar

**Purpose:** orient the user (who am I, what time is it, what can I toggle) without stealing vertical space from the data.

| Slot | Content | Spec |
|---|---|---|
| Left | **Avatar** (`Avatar`) | 32px, radius 13, navigates to the **You** tab (`/you`). 1px glass border. Falls back to monogram initial on jade→deep gradient when no photo. |
| Center-left | **Greeting** | Time-aware: "good morning, {firstName}" / "good afternoon, {firstName}" / "good evening, {firstName}". Sentence case. 20px section-head weight 600, ink. If no name yet: "good morning". Truncates with ellipsis at container edge. |
| Right | **Theme control** (`IconButton`) | 32px, radius full, `◐` glyph. Opens/cycles the tri-state theme setting (`plato.theme = system \| light \| dark`, default `system`) per §0.6 — not a boolean toggle. Animates icon 240ms ease-out. The full 3-way System / Light / Dark control lives in Settings; the Home glyph reflects the resolved theme. |
| Right | **Premium pill** (`PremiumPill`) | If trial active: "trial · {n}h left" honey text (always **hours**, never days — trial is 48h per §0.4). If Plus: small jade "plus" pill. If lapsed/free: "go plus" → paywall. Radius full, 11px caption, tabular-nums for the hour count. |

- The bar sits over the mesh with **no solid background** at scroll-top. On scroll past ~12px it gains the glass recipe (blur 16px, glass fill, hairline bottom border) so titles stay legible over tiles — a `TopBar` "condensed" state. Greeting shrinks 20→15px and the row height eases from 56→48px over dur-base.
- A second micro-line under the greeting shows the date in muted 11px: "tue · jul 8" (tabular-nums). Hidden in condensed state.

**Light + dark:** dark uses ink `#EAF1EF` greeting on transparent→glass `rgba(16,26,22,.50)`; light uses `#0E1614` on `rgba(255,255,255,.62)`. Premium pill honey/jade unchanged both themes.

---

### 4.4 Hero — the Macro Orb (signature WebGL moment)

The Orb is the single most important pixel-area on Home. It is a **living sphere that fills with light as calories/macros are logged** — the day's progress made physical. It replaces the legacy calorie ring as the primary energy indicator.

#### 4.4.1 What it shows

- **Fill level = calories logged ÷ target.** At 0% the orb is a dark, dormant glass sphere with only a faint internal ember; at 100% it is a fully luminous jade globe. The "liquid light" surface rises from bottom to top as the fill fraction increases (like a glass filling).
- **Surface hue is a macro blend.** The internal caustic light is tinted by the day's macro ratio: aqua (`#5FD4C4`, protein), honey (`#E7B67C`, carbs), rose (`#E1A0AB`, fat), all resolving toward brand jade (`#43C6AC`, energy) as the dominant. A protein-heavy day skews the glow cooler/aqua; a carb-heavy day skews warmer/honey. This is subtle — a tint, not a pie chart.
- **Center readout (over/in front of the orb):**
  - Line 1 — hero stat: **`1,340`** kcal logged, 34px, weight 800, letter-spacing -.03em, tabular-nums, ink.
  - Line 2 — target + remaining: "of 2,150 · 810 left", 13px secondary sage, tabular-nums.
  - Micro-label above: "energy" — 10px uppercase, letter-spacing .18em, sage.
- The orb is ~200–220px diameter, centered, with generous 24px breathing room above the macro cards.

#### 4.4.2 How it animates as you log

| Event | Motion |
|---|---|
| App open (data present) | Orb fills from 0 → current fraction once, 800ms decelerate (ring/orb fill token), so returning users watch the day "pour in". Numbers count up in sync. |
| New food logged | Fill rises by the delta over 800ms decelerate; a soft light pulse ripples across the surface; the macro tint re-blends toward the new ratio. Hero number counts up. Haptic: light tap on commit. |
| Crossing 100% | One-time bloom — surface brightens, a thin jade rim-light traces the equator, subtle mesh burst behind (celebration, §4.10.5). |
| Idle | Very slow internal caustic drift + a ~4s breathing scale (1.00 ↔ 1.008). Pauses when offscreen. |
| Reduced motion / low power | All drift, breathing, and fill animation disabled — orb snaps to final fill, numbers set instantly. |

Tapping the orb opens a **day detail sheet** (`DaySheet`): full macro breakdown, calories in vs. target, logged items list, and an "adjust target" shortcut.

#### 4.4.3 Orb states

| State | Appearance |
|---|---|
| **Dormant (0 logged)** | Dark glass sphere, faint jade ember at core, "0" hero number, copy "of 2,150 · let's begin". |
| **Filling (1–99%)** | Liquid-light level rises; hue blended by macro ratio; rim glow proportional to fill. |
| **On target (100%)** | Fully luminous jade globe, equator rim-light, "on target" replaces "left" (see over-target for the >100% case). |
| **Over target (>105%)** | Fill saturates; hue shifts warm toward honey→rose-red `#E1616C` at the crown; copy turns to "310 over" in danger color. Not alarming — informative. See §4.10.4. |
| **No plan yet** | If macros aren't set, orb shows a neutral "set your target" CTA instead of a fraction (edge case for users who skipped plan generation). |

#### 4.4.4 CSS / gradient fallback (required)

The WebGL orb is **lazy-loaded** and gated by capability + power. The fallback must be visually first-class, not a placeholder.

- **Fallback = radial-gradient sphere + conic progress rim.**
  - Sphere body: `radial-gradient(120% 120% at 32% 26%, #17231E 0%, #0E1614 60%, #070D0C 100%)` for the glass shell, with an inner `radial-gradient(80% 80% at 50% 92%, jade→deep)` "fill" clipped to the logged fraction via a masked height (bottom-up).
  - Progress rim: a `conic-gradient` ring (deep `#0F9482` → jade `#43C6AC` → mint `#8CE0CE`) sweeping the logged fraction, 6px thick, with the remainder in hairline `rgba(160,215,200,.18)`. This guarantees a readable progress read even with zero shaders.
  - Inner highlight: `box-shadow inset 0 1px 0 rgba(255,255,255,.06)` + a soft top-left specular via a small white radial at ~8% opacity.
  - Fill transition animates `clip-path`/mask height over 800ms decelerate — same feel, no GPU cost.
- **Static PNG/gradient fallback** (no-JS, print, or hard-blocked WebGL): a pre-baked duotone orb image on the mesh with the conic rim rendered in CSS.
- Fallback tiers are chosen in order: WebGL → CSS gradient+conic → static PNG. Reduced-motion uses the CSS tier with transitions stripped.

**Light + dark:** dark is the canonical luminous-on-dark look. Light theme renders the orb shell on `#FFFFFF`/`surface-3 #EEF3F0` with the fill still jade→deep; the internal glow reads as tinted liquid rather than emitted light. Rim uses **deep `#0F9482`** as the leading color on light for AA contrast. Text switches to `#0E1614` ink / `#48605A` secondary.

---

### 4.5 Macro cards row (protein · carbs · fat)

**Purpose:** the exact per-macro accounting the orb only hints at. Three equal glass cards in a 3-up row directly under the hero.

**Component:** `MacroCard` ×3. Each card:

- **Micro-label** top: "protein" / "carbs" / "fat" — 10px uppercase, letter-spacing .16em, sage.
- **Value / target** stat: e.g. **`94`**`/165 g`. Logged number 20px weight 700 tabular-nums ink; `/165 g` in 13px secondary. All digits tabular so the three cards' numbers align vertically across the row.
- **Same-family progress bar** (`MacroBar`): full-width, 6px tall, radius full. Track = hairline. Fill uses the canonical §1 macro-gradient tokens (light tint → base color, each bar staying in its own color family) per §0.7:
  - protein: `--macro-protein` (aqua `#5FD4C4` → jade `#43C6AC`)
  - carbs: `--macro-carb` (`--macro-carb-lite #F0CC9C` → honey `#E7B67C`)
  - fat: `--macro-fat` (`--macro-fat-lite #ECBFC6` → rose `#E1A0AB`)
  - Fill width animates to fraction over 800ms decelerate, staggered 60ms after the orb.
- **Remaining caption** (optional, appears on tap/expand): "71 g left" muted 11px.

**Colors are fixed by macro (never re-themed):** protein aqua `#5FD4C4`, carbs honey `#E7B67C`, fat rose `#E1A0AB`. These base colors and their `--macro-*` gradient tokens (§1 / §0.7) are the single canonical palette.

**Interactions:** tap a card → macro detail in the `DaySheet` scrolled to that macro. Long-press → quick "log X grams of {macro}" shortcut (protein powder, etc.).

**Over-target per macro:** when a macro exceeds target, its bar fills 100% and a thin overflow segment in danger `#E1616C` extends past a notch at the 100% mark; the value number turns danger-tinted. E.g. fat `88/72 g` shows red overflow.

**Light + dark:** `--macro-*` gradients identical both themes. Track hairline dark `rgba(160,205,190,.09)` / light `rgba(12,58,50,.10)`. Card = glass recipe (dark fill `rgba(16,26,22,.50)` / light `rgba(255,255,255,.62)`).

---

### 4.6 Streak & water tiles

A 2-up row of large tiles (radius 20) under the macro cards.

#### 4.6.1 Streak tile (`StreakTile`)

- **Purpose:** reinforce the daily habit loop.
- Micro-label "streak"; hero-ish number **`12`** (30px, weight 800, tabular-nums, jade) + "days" 13px secondary.
- A 7-dot week strip beneath: filled jade dots for logged days, hairline dots for missed/upcoming; today's dot pulses. `WeekDots` component.
- **Copy:** "12 days · keep it going". If today isn't logged yet: "log today to keep your streak" in honey warning tone.
- **Tap:** opens Achievements (`/you/achievements`).
- **At-risk state:** if it's evening (after ~8pm local) and nothing logged today, tile gets a honey `#E7B67C` hairline glow and copy "don't break your 12-day streak".
- **Milestone (7/30/100…):** on reaching a milestone, tile triggers a mesh burst + haptic (celebration, §4.10.5) and shows "🎉 30-day streak".

#### 4.6.2 Water tile (`WaterTile`) — now goal-based

- **Purpose:** hydration tracking against a **daily goal/target** (new — closes a spec gap).
- Micro-label "water"; value **`5`**`/8` with unit toggle (cups | ml | oz per user pref); default cups. Tabular-nums.
- **Progress:** a segmented droplet meter — 8 segment pills (or dynamic to goal) that fill aqua `#5FD4C4` (info role) left-to-right. Alternatively a vertical fill droplet icon for compact width. `WaterMeter` component.
- **Quick-add:** a `+` chip logs one cup; tap the tile body opens a stepper sheet to set an exact amount and to **edit the daily goal** (default 8 cups / 2000 ml per §0.5, editable). Writes to `POST /api/water`; goal stored on profile (`water_goal_ml`).
- **Goal reached:** meter turns full aqua→jade, copy "goal reached 💧", subtle single ripple. No nagging past goal — extra cups still count, shown as "9/8".
- **Data:** reads `GET /api/water` for today's total; optimistic increment on tap with rollback on failure.

**Light + dark:** aqua fill unchanged. Dark tiles use surface-2/glass; light uses `#FFFFFF` with hairline `rgba(12,58,50,.10)`. Streak jade number uses deep `#0F9482` on light for contrast; aqua meter darkens one step on light backgrounds for AA on small fills.

---

### 4.7 Quick-log row

**Purpose:** the fastest paths to add food, always one thumb-reach away — parallel to (not replacing) the global FAB.

A horizontally scrolling row of `QuickLogChip`s (radius full, glass), each icon + label, 44px tall:

| Chip | Icon | Action | Gating |
|---|---|---|---|
| search | `＋` / magnifier | Opens Log → USDA search | free |
| voice | `🎙` | Opens AI voice overlay (LLM macro extraction) | **premium** — shows lock, routes to paywall if free |
| photo | `📷` | Camera → AI photo food recognition → macros | **premium** — lock if free |
| scan | `▥` barcode | Barcode scanner → food match → macros | free (basic) |
| quick add | `⚡` | Manual quick macros entry (no search) | free |

- Chips tap-scale .97, spring on press. Row edges fade (mask) to hint scrollability.
- Premium chips show a small honey lock glyph; tapping opens the paywall with the relevant feature pre-highlighted. Do not disable them — the tap is the upsell.
- On very narrow screens the row stays a single scroll; it never wraps.

**Light + dark:** chip glass fill per theme; icons in ink, labels 13px secondary. Locked chips' lock glyph honey both themes.

---

### 4.8 Today's plan — one-tap-log meal cards

**Purpose:** turn the generated meal plan into the day's actionable checklist. This is the highest-conversion logging surface: the food is already chosen, so logging is a single tap.

**Header row:** "today's plan" (20px section head) + "edit ›" text button (opens Plans → today, enables meal editing — not just delete).

**Component:** `PlanMealCard` list (stacked, radius 22 container, hairline dividers between rows or individual glass cards with 8px gaps).

Each meal card:

| Element | Spec |
|---|---|
| Slot label | "breakfast" · "lunch" · "dinner" · "snack" — 10px micro-label sage. |
| Meal name | "greek yogurt bowl" — 15px ink, weight 600, truncates. |
| Macro/kcal line | "410 kcal · 32p 44c 12f" — 11px caption, tabular-nums, muted. |
| Thumbnail | 44px rounded (radius 13) meal image or duotone glyph fallback. |
| Action | **`＋ log`** primary chip → one-tap logs the planned meal to the day, fires orb fill + haptic. On success flips to **`✓ done`** with jade check and card dims to 70% opacity. |

- **One-tap log:** tapping `＋ log` writes the meal's macros to `dailyLog` (`POST /api/log`), optimistic, updates orb + macro cards + insights instantly. Undo toast appears 4s.
- **Swap:** long-press or a `⋯` reveals "swap meal" (premium Concierge Swaps → paywall if free) and "log a different portion" (½×, 1×, 2× stepper — free).
- **Edit:** the header "edit" and per-card `⋯` → "edit meal" opens the editor (rename, adjust macros, change portion) — closes the "delete-only" gap.
- **All done:** when every planned meal is logged, the list collapses to a single celebratory summary row (see all-logged state §4.10.5).
- **No plan:** if the user has no plan (skipped generation or free-form user), this whole block is replaced by an empty-state prompt: "no plan yet — build one" → Plans, or "just log freely" hint.

**Light + dark:** card glass per theme; `＋ log` chip = primary (dark jade `#43C6AC` on `#04231C` text; light deep `#0F9482` fill, `#04231C`/white text for AA). `✓ done` jade check both themes; dimmed done-cards drop to secondary text.

---

### 4.9 Insights peek

**Purpose:** a single, earned, glanceable insight — a teaser into the full Insights screen, not a dashboard.

**Component:** `InsightPeek` — one glass card:

- Micro-label "insights".
- **Headline insight** in ink 15px: real, data-derived copy, e.g. "you hit protein 5 days running." / "carbs trend up this week." / "you're most consistent on weekdays."
- A tiny inline **sparkline / mini-bars** (`Sparkline`, ~7 bars) tinted to the relevant macro's duotone color (e.g. aqua for a protein insight).
- "see all ›" → Insights screen.
- **Empty/low-data:** before ~3 days of data: "log a few more days and we'll spot your patterns." with a flat placeholder spark.
- Never shows more than one insight on Home; rotation/priority handled by Insights logic.

**Light + dark:** sparkline uses macro duotone; headline ink per theme; card glass per theme.

---

### 4.10 States (complete)

#### 4.10.1 Default (returning user, mid-day)
Orb partially filled and animating in; macro cards populated; streak active; water partial; plan cards mixed logged/unlogged; one insight. This is the reference layout in §4.2.

#### 4.10.2 Empty / first-run (fresh from onboarding, nothing logged today)
- Orb in **dormant** state, 0 fill, copy "of 2,150 · let's begin"; a gentle inner ember invites the tap.
- Macro cards show `0/target g`, empty tracks.
- Streak "day 1 · welcome" (or 0 if truly new).
- Water `0/8`.
- Quick-log row fully present (the primary CTA surface).
- Today's plan: all cards unlogged with `＋ log` — this is the guided path. A one-time coach line above the list: "tap ＋ log on your first meal to fill your orb."
- Insights peek in its low-data copy.
- Fluid duotone empty illustration only appears if there is **also no plan** (rare) — otherwise the plan cards are the content.

#### 4.10.3 Loading / skeleton (cold open before data resolves)
- Every tile renders a **skeleton with shimmer**: glass surfaces with a sweeping `linear-gradient` highlight (`SkeletonShimmer`), 1.4s loop, honoring reduced-motion (static dim state, no sweep).
- Orb: dark glass sphere with a shimmering rim, no number (or a dashed "— / —").
- Macro cards: label + shimmer blocks for number and bar.
- Streak/water/plan/insights: shimmer placeholder rows.
- Skeletons resolve tile-by-tile with 60ms stagger as data arrives; because localStorage is the source of truth, most tiles hydrate near-instantly and only network-dependent bits (streak, water, insights) may briefly shimmer.

#### 4.10.4 Over-target
- **Orb:** fill saturates past full, crown hue shifts warm toward danger `#E1616C`; center copy "310 over" in danger color; micro-label stays "energy". Rim uses a warmer honey→red sweep. Tone is informative, not punitive.
- **Macro cards:** any exceeded macro shows the red overflow segment past the 100% notch and a danger-tinted value (§4.5).
- **Insights peek** may surface a relevant note: "you're 310 over today — heavier lunch than planned."
- Not an error; no blocking UI.

#### 4.10.5 All-logged celebration
- Triggered when the day's plan is fully logged **or** calories cross target.
- **Orb:** one-time bloom + equator rim-light; behind it a **mesh burst** (radial jade/mint particles) timed to a haptic success pattern (celebration signature moment #4). Respects reduced-motion (static bloom, no particles) and low-power (skip WebGL burst, use CSS glow).
- **Today's plan** collapses into a single summary card: "all meals logged · 2,150 / 2,150 kcal · nice work" with a jade check.
- **Streak tile** ticks up if this completes the day; may fire a milestone burst.
- A dismissible toast: "day complete — see tomorrow's plan ›".

#### 4.10.6 Offline
- A slim **offline banner** (`OfflineBanner`) docks under the top bar: "you're offline — changes will sync" on `surface-3` with a honey dot. Non-blocking.
- All logging still works against localStorage (source of truth); queued writes (log, water, streak) sync on reconnect with optimistic UI.
- Network-only tiles that lack cache (fresh insights, avatar image) show their empty/low-data state rather than a spinner.
- Orb and all local computations remain fully live.
- On reconnect: banner slides away, queued syncs flush, a brief "synced" micro-toast confirms.

#### 4.10.7 Error (data fetch failed but cache exists)
- Silent — cached values render; a subtle "couldn't refresh" text link with a retry appears only in the affected tile (e.g. insights). No full-screen error on Home; the global error boundary + 404 handle route-level failures elsewhere.

---

### 4.11 Pull-to-refresh

- A native-feel **pull-to-refresh** on the scroll container: pulling past ~72px reveals a jade **orb-glyph spinner** (a mini version of the Macro Orb that spins/pulses), releasing triggers a refetch of streak, water, log, and insights.
- Motion: rubber-band overscroll, spinner scales in with spring (stiffness 320 / damping 30). On success the orb-glyph does a single satisfied pulse; on failure it settles and shows the offline/error affordance.
- Reduced-motion: replace the pulsing orb-glyph with a static jade arc + label "refreshing".
- Disabled while a modal/sheet is open.

---

### 4.12 Interactions summary

| Target | Tap | Long-press / secondary |
|---|---|---|
| Avatar | Navigate to You (`/you`) | — |
| Theme control | Cycle theme (system → light → dark, §0.6) | — |
| Premium pill | Paywall / manage subscription | — |
| Macro Orb | Open `DaySheet` day detail | — |
| Macro card | `DaySheet` at that macro | "log grams of {macro}" quick shortcut |
| Streak tile | Achievements | — |
| Water tile | Stepper + edit goal sheet | `+` chip = quick add one cup |
| Quick-log chip | Route to that log method (paywall if premium-gated) | — |
| Plan meal card `＋ log` | One-tap log → orb fill + haptic + undo toast | `⋯`: swap (premium) / portion / edit |
| Plan "edit ›" | Plans → today (edit mode) | — |
| Insight peek | — | "see all ›" → Insights |
| FAB (nav) | Global add-food menu | — |
| Pull down | Refresh | — |

All taps use tap-scale .97 with spring; page/sheet transitions fade+slide 240ms ease-out; list items stagger 60ms/item on first paint.

---

### 4.13 Bento composition & responsive stacking

**Exact bento grid (mobile, ≤430px — the canonical target):** a single-column stack of full-width blocks, with two internal multi-column rows:

| Row | Columns | Span | Radius | Height (approx) |
|---|---|---|---|---|
| Top bar | — | full | — | 56 → 48 (condensed) |
| Hero orb | 1 | full | — (orb is round) | ~260 incl. readout |
| Macro cards | **3** equal | full | 22 | ~104 |
| Streak · Water | **2** equal | full | 20 | ~116 |
| Quick-log row | scroll | full-bleed to edges w/ 16px inset start | full (chips) | 44 |
| Today's plan | 1 | full | 22 | auto (list) |
| Insights peek | 1 | full | 22 | ~92 |

- **Grid engine:** CSS grid, `gap: 12px`, page padding 16px sides, 8px base rhythm between logical groups (larger 20–24px gaps around the hero).
- **Full-bleed exception:** the quick-log row extends past the 16px gutter at its trailing edge so chips scroll off-screen naturally (mask fade), while the leading chip aligns to the gutter.

**Responsive stacking:**

- **Small phones (≤360px):** macro cards stay 3-up but numbers may drop the unit inline ("94/165"); streak+water stay 2-up. Orb scales to ~180px. Nothing wraps to more rows.
- **Large phones (390–430px):** reference layout; comfortable spacing.
- **Tablet / desktop PWA (>640px):** content stays centered at max-width 430px by default (mobile-first fidelity). Optional wide variant: a **2-column bento** where the orb hero spans the left column full-height and the macro cards / streak / water / plan stack in the right column — but this is a progressive enhancement, not required for v1. Never let the page body scroll horizontally; wide tables/rows scroll within their own container.
- **Landscape:** orb shrinks, hero readout moves beside the orb rather than under it (row layout) to preserve vertical space; rest stacks normally.

---

### 4.14 Light + dark notes (consolidated)

**Dark (default/primary):**
- Page base `#070D0C` under the **signature mesh** (layered radials + 3px dot-grain overlay ~40%, mix-blend overlay).
- All tiles use the glassmorphism recipe: fill `rgba(16,26,22,.50)`, glass border `rgba(160,215,200,.12)`, `backdrop-filter blur(16px)`, inset top highlight + deep drop shadow. Bottom nav blur(24px).
- Text: ink `#EAF1EF`, secondary sage `#94A9A3`, muted `#5F726D`. Orb glows as emitted light; macro duotones at full vibrance.

**Light (secondary, fully specified):**
- Page base `#F3F7F4`; the mesh is dialed down to a soft tint (lower-opacity radials) so glass reads on light; dot-grain reduced.
- Tiles: fill `rgba(255,255,255,.62)`, glass border `rgba(12,58,50,.08)`, hairline `rgba(12,58,50,.10)`, same blur/shadow (softer shadow).
- Primary interactive (log chips, rim leads, streak number) uses **deep `#0F9482`** instead of jade `#43C6AC` for AA contrast on light.
- Text: primary `#0E1614`, secondary `#48605A`, muted `#7E938C`. On-accent `#04231C`.
- Macro duotone gradients unchanged (aqua/honey/rose); track hairlines swap to the light hairline value. Aqua water fill steps one shade darker on very light fills for legibility.
- Orb reads as tinted liquid inside a glass shell rather than pure emitted light; celebration bursts soften.

---

### 4.15 Data & API bindings

| Surface | Reads | Writes |
|---|---|---|
| Orb + macro cards | `dailyLog` (localStorage source of truth) → `plan.macros` targets | — (derived) |
| Plan meal cards | `plan.meals` (local; **now backend-synced** per §9 `meal_plans.meals_json`) | `POST /api/log` on one-tap log; meal edits via plan endpoints |
| Streak tile | `GET /api/streak` + local `streak` | updated server-side on log |
| Water tile | `GET /api/water` today total; `profile.water_goal_ml` | `POST /api/water` (+1 or exact); `PUT /api/profile` for goal |
| Insights peek | derived from `GET /api/log` history + local | — |
| Premium pill / gated chips | `premium{status,trialExpiresAt}` | routes to Stripe-backed paywall |

- **Optimistic everywhere:** every log/water write updates UI first, reconciles on response, rolls back with an inline undo/toast on failure. Offline writes queue (§4.10.6).
- **Analytics:** each Home interaction emits a tracked event (`home_orb_tap`, `plan_meal_logged`, `quick_log_{method}`, `water_add`, `insight_peek_tap`) for the analytics gap-fix.

---

### 4.16 Performance & accessibility

- **3D budget:** the Macro Orb is the only WebGL on Home. Lazy-load its bundle after first paint; render the CSS-gradient+conic fallback immediately so the hero is never blank. Pause the orb's render loop when the tab is backgrounded or the orb scrolls offscreen. Respect `prefers-reduced-motion` (no drift/breathing/fill animation) and low-power mode (force CSS tier). Static PNG for no-WebGL.
- **Everything else is CSS depth** — no per-tile 3D.
- **Accessibility:** the orb exposes an `aria-label` / live-region text ("1,340 of 2,150 calories, 810 remaining") that updates on log; the visual fill is decorative. Macro bars have `role="progressbar"` with value/max. All tap targets ≥44px. Color is never the only signal — over-target shows text ("310 over") alongside the danger hue; done meals show a check glyph, not just dimming. Tabular-nums keep all aligned digits screen-reader-consistent. Contrast meets AA in both themes via the deep-`#0F9482`-on-light substitutions.


## 5. Logging hub & meal entry

The logging hub is where the app earns its daily habit. Every path a person might reach for — typing a food, tapping a favorite, talking, scanning a label, snapping a plate, or keying in raw macros — lives behind one entry point (the center FAB) and resolves into one shared **meal-logger sheet** that confirms the entry, previews its macros against the day's targets, and closes the loop with a toast. This section specifies that hub end to end: the surface, all six input modes, the shared confirm sheet, editing and deleting logged meals, premium gating, and every interstitial state (permissions, no-match, low-confidence, offline).

Today's Log screen conflates six concerns into a flat tab strip with dead tabs (`manual`/`scan` reachable only by code), a light-on-dark theme clash, three different macro color palettes, and a heuristic "voice" that never calls an LLM. This redesign unifies all of it on the "Elevated Verdant" tokens, promotes logging to a modal surface that floats over whatever screen invoked it, and specifies the real AI pipelines (LLM voice extraction, barcode lookup, vision photo estimation) as first-class flows with confidence and edit affordances.

---

### 5.1 Purpose

- Make logging the single fastest action in the app — sub-second for a recent/frequent tap, under ~15s for a novel food.
- Meet the user wherever their intent is: precise (USDA search, manual), fast (quick log, recents), or hands-busy (voice, photo, barcode).
- Always end in a **confirmable, editable** entry — never silently commit a guess. Every AI estimate is a draft the user approves.
- Attribute every entry to a meal slot (breakfast/lunch/dinner/snack) and a source so Home, Insights, and history stay honest.
- Degrade gracefully: offline, no camera permission, no mic, no USDA match, low model confidence — each has a designed state, never a dead end.

---

### 5.2 Entry point & surface

**Invocation.** The center **[+] FAB** in the floating glass bottom nav (`Home · Plans · [+] · Explore · You`) opens the logging hub at `/log`. The FAB uses radius 21, jade `#43C6AC` fill, `on-accent #04231C` glyph, tap scale `.97`, and a soft mesh-tinted glow. It is available from every primary screen; the sheet floats over the current screen (Home stays visible, dimmed) so logging never feels like a full context switch. A long-press on the FAB is a shortcut that opens the hub directly on the **Quick log** tab (power-user affordance; discoverable via a one-time coach tip).

**Composition (see §0.3 canonical Log hub composition).** The `/log` sheet exposes **six** entry methods split by surface. **In-sheet modes** render inside the sheet: **Search** · **Quick** · **Manual** (Manual is a first-class 6th mode — a distinct manual-entry form, not folded into Quick). **Overlay modes** open a full-screen capture route and are *not* rendered inside the sheet: **Voice** → `/log/voice`, **Scan** (barcode) → `/log/scan`, **Photo** → `/log/photo`. All six feed the shared **meal-confirm sheet** (5.8).

**Surface = bottom sheet, escalating to full-height.** The hub is a `SheetModal` presented from the bottom:

- **Default height:** ~86% of viewport, rounded top corners (radius 22), a `4px × 40px` drag handle in `rgba(160,215,200,.18)` centered at top.
- **Drag behavior:** drag-down dismisses (spring stiffness 320 / damping 30); a downward fling over threshold closes; tapping the scrim closes. Camera-based modes (barcode, photo) and the confirm sheet **lock** drag-to-dismiss to avoid accidental loss of an in-progress capture or unsaved edit — those require an explicit Close/Cancel.
- **Scrim:** page dims to `rgba(7,13,12,.62)` with a `blur(2px)` behind the sheet.
- **Enter/exit:** fade + slide 240ms, `ease-out cubic-bezier(.22,.61,.36,1)`. Honors `prefers-reduced-motion` (fade only, no slide).
- **Safe area:** bottom pad ~104px baseline so the sticky confirm bar clears the home indicator; keyboard-open shrinks content and pins the confirm bar above the keyboard.

**Header.** A compact contextual top bar inside the sheet:

- Left: `Close` (X) icon button, 44×44 hit target.
- Center: title `Log food` (screen-title scale 27 is reserved for full screens; here use section-head 20, weight 700, tracking `-.01em`).
- Right: **today pill** showing remaining calories, e.g. `1,240 left` in tabular-nums, jade when under target / honey `#E7B67C` when within 10% / danger `#E1616C` when over. Tapping it scrolls-reveals a slim day-progress strip (calorie ring mini + macro chips) so users see the impact context of what they're about to log.

**Mode selector (pills).** Directly under the header, a horizontally scrollable pill row — six modes, left-aligned, `whitespace-nowrap`, `overflow-x:auto` with fade-mask edges. The `Surface` column marks whether tapping the pill switches the mode **in-sheet** or navigates to a full-screen **overlay** route:

| Order | Mode | Label | Icon (lucide) | Surface | Gating |
|---|---|---|---|---|---|
| 1 | Search | `Search` | `search` | In-sheet | Free |
| 2 | Quick log | `Quick` | `zap` | In-sheet | Free |
| 3 | Manual | `Manual` | `pencil` | In-sheet | Free |
| 4 | Voice AI | `Voice` | `mic` | Overlay → `/log/voice` | **Premium** (`voice_ai`) |
| 5 | Scan | `Scan` | `scan-barcode` | Overlay → `/log/scan` | Free (never gated) |
| 6 | Photo AI | `Photo` | `camera` | Overlay → `/log/photo` | **Premium** (`photo_ai`) |

- Active pill: jade fill `#43C6AC`, `on-accent #04231C` text, weight 700. Inactive: `surface-2 #121C19` (dark) / `surface-3 #EEF3F0` (light), `secondary/sage #94A9A3` text, glass border.
- Micro-label casing: pill labels are sentence case, never uppercase.
- **In-sheet pills** (Search, Quick, Manual) swap the sheet body in place. **Overlay pills** (Voice, Scan, Photo) navigate to their full-screen capture route (`/log/voice`, `/log/scan`, `/log/photo`); those overlays feed the same shared confirm sheet on completion.
- Premium modes (Voice, Photo) show a tiny **lock chip** (10px, `lock` glyph) top-right of the pill when the user is not entitled; the pill is still tappable but routes to the paywall (see 5.9). **Scan is never gated** — it carries no lock chip.
- The hub remembers the **last-used mode** per user (persisted) and opens there; first-run defaults to **Search**. Long-press-FAB always forces **Quick**.

**Light + dark.** Dark is primary: sheet fill uses the glass recipe (`background rgba(16,26,22,.50)`, `border 1px rgba(160,215,200,.12)`, `backdrop-filter blur(24px)` for this floating surface, inset top highlight `inset 0 1px 0 rgba(255,255,255,.05)`, drop `0 18px 34px -28px rgba(0,0,0,.9)`). Light theme swaps to `rgba(255,255,255,.62)` fill, `rgba(12,58,50,.08)` border, `#0E1614` text, and interactive jade steps to deep `#0F9482` for AA contrast.

---

### 5.3 Mode: USDA Search

The precise path — real food data from USDA FoodData Central via the existing `GET /api/food/search` and `GET /api/food/:id` endpoints.

**Layout.**

1. **Search field** (`SearchInput`), sticky at top of the mode body: radius 16, `surface-2` fill, leading `search` glyph in sage, trailing spinner while loading / clear (X) when populated. Placeholder: `Search foods — try "greek yogurt" or "chicken breast"`. Auto-focus on entering the mode (200ms delay so the sheet finishes animating first). Debounced 350ms; queries fire at ≥2 chars.
2. **Segmented sub-filter** below the field: `All · Verified · Branded · My favorites`. `Verified` = USDA Foundation/SR Legacy (generic, high-trust); `Branded` = branded food line; `My favorites` = starred foods (persisted, see below).
3. **Results list** (`FoodResultRow` × up to 12): each row shows name (weight 600, `ink #EAF1EF`), brand/owner on a secondary line (`muted #5F726D`), the reference serving (e.g. `per 170 g`), and a right-aligned macro cluster — calories in tabular-nums (weight 700) with jade `kcal` unit, then `P·C·F` chips colored aqua `#5FD4C4` / honey `#E7B67C` / rose `#E1A0AB`. A trailing **star** toggles favorite (fills honey `#E7B67C` when saved). Tapping the row opens the **detail/confirm sheet** (5.8).
4. **Footer attribution:** `Data from USDA FoodData Central` (caption, muted).

**Serving / quantity + macro preview.** Selecting a result loads its full nutrient profile from `GET /api/food/:id` and opens the shared confirm sheet with a **serving selector** (dropdown of USDA-provided portions plus `g`/`oz`/`ml` and `container`) and a **quantity stepper** (see 5.8). The macro preview recomputes live from `per-serving × quantity`.

**States.**

| State | Treatment |
|---|---|
| Default (empty query) | Show `My favorites` (if any) then `Recent searches` (last ~8 queries, persisted, tap to re-run). If both empty, a fluid duotone empty illustration + `Search millions of foods` copy. |
| Loading | Inline spinner in the field; result area shows 3–4 skeleton rows (shimmer over `surface-2`, radius 16). Never blank-flash. |
| Typing (<2 chars) | Keep favorites/recents visible; no network call. |
| No match | Card: `No results for "{query}"` + hint `Try a simpler term — "chicken" instead of "grilled chicken breast"`. Offer two actions: **Log manually** (jumps to Manual pre-filled with the query as the name) and **Try photo** (Premium; jumps to Photo AI). |
| Error (USDA/API 5xx or timeout) | Non-destructive banner `Couldn't reach the food database. Retry?` with a retry button; preserves the query. Falls back to the on-device common-food set so search is never fully dead offline. |
| Offline | Field shows an `offline` chip; searches run against the on-device common-food set only, labeled `Offline results` so the user knows coverage is limited. USDA rows queue nothing — search is read-only. |

**Light + dark.** Rows use `surface-1`/`surface-2` in dark, white/`surface-2` in light; hover/press raises to `surface-3`. Star and macro chips keep the same macro palette in both themes.

---

### 5.4 Mode: Quick log

The fastest path — one-tap logging of common foods, no search, no confirm sheet by default.

**Layout.**

- **Filter field** (optional): `Filter foods…` narrows the grid in place.
- **Category chips** (hidden while filtering): `All · Breakfast · Protein · Carbs · Snacks`, full-radius pills, active = jade.
- **Food grid**, 2-up (`QuickFoodTile`): each tile is a glass card (radius 20) with a small duotone food glyph/thumbnail, name (weight 600), calories in jade (weight 700, tabular-nums), and a `P·C·F` micro-line. `tap scale .97`.

**Interaction — one-tap by design.** Tapping a tile logs it **immediately** into the currently inferred slot (from time of day) at quantity 1 and fires the confirm toast (5.10). This is intentional: quick log optimizes for speed, so it commits first and lets the user adjust after. The toast's **Edit** action reopens that entry in the confirm sheet (change slot/quantity) and its **Undo** removes it. A **long-press** on a tile bypasses the instant-log and opens the confirm sheet first (for when the user knows they want 2 servings or a different slot).

**Recents & frequents.** Above the category grid, two horizontally scrollable rails when data exists:

- **Recent** — last ~8 distinct logged foods across days, most-recent first, one-tap re-logs.
- **Frequent** — top foods by log count (rolling 30-day), so a user's real staples float up ahead of the static list.

Both rails use compact `RecentChip`s: name + calories, tap to log, long-press to open confirm.

**States.**

| State | Treatment |
|---|---|
| Default | Category `All`, full grid, recents/frequents rails on top if populated. |
| Filtering | Chips hide; grid filters live; header reads `Results for "{q}"`. |
| Empty filter result | `No foods match "{q}"` + **Log manually** shortcut. |
| First run (no recents/frequents) | Rails hidden; only the curated common-food grid shows. |
| Offline | Fully functional — quick foods are on-device. New logs queue for sync (5.7). A subtle `offline` chip in the header signals queueing. |

---

### 5.5 Mode: Voice AI  · Premium (`voice_ai`)

Presented as a **full-screen overlay route** at `/log/voice` (not an in-sheet mode) that opens the mic capture UI and, on completion, feeds the shared confirm sheet (5.8). Real LLM macro extraction, replacing today's Web Speech + keyword heuristic. The user talks; we transcribe, parse to a structured meal (possibly multi-item), and hand them an editable draft to confirm.

**Pipeline.**

```
record (mic) → transcribe (STT) → parse (LLM → structured meal[])
             → review/edit draft → confirm → log
```

1. **Record.** Big circular mic button (96px), jade at rest, danger `#E1616C` while recording, with a live waveform/orb pulse driven by input amplitude (CSS/canvas; pauses & goes static under `prefers-reduced-motion` / low-power). Copy at rest: `Tap and describe your meal`. Example hint: `"a bowl of oatmeal with blueberries and a scoop of protein"`. A running timer and a **Stop** affordance appear while recording; auto-stops after a short trailing silence.
2. **Transcribe.** On stop, show the interim/final transcript in an editable text area (`Voice transcript`, sparkles glyph). The user can fix mis-hears before parsing. STT runs server-side for accuracy (Web Speech is a same-session fallback only, never the LLM substitute).
3. **Parse (LLM).** `POST /api/log/voice` (new) sends the transcript; the LLM returns a **structured, multi-item** result: an array of `{ name, quantity, unit, calories, protein, carbs, fat, confidence, assumedSlot }`, plus an overall confidence. Parsing shows a labeled loading state (see below). The LLM is prompted to split compound descriptions ("chicken with rice and a coke") into separate line items and to surface assumptions ("assumed 1 cup rice").
4. **Review/edit draft.** Results render as an **editable item list** — each row is a mini confirm card with inline quantity stepper, per-item macros, a slot chip, and a delete (swipe or trailing X). A summary bar totals calories + macros across items. Low-confidence items are flagged (see states). The user can add another item (drops into Manual-style inline add) or re-record.
5. **Confirm.** A single `Log {n} items` primary button commits all items in one batch to the selected slot(s), then toasts (5.10).

**States.**

| State | Treatment |
|---|---|
| Mic permission not asked | Rest state with a friendly primer: `Voice logging needs your microphone` + `Allow microphone` button that triggers the OS prompt. |
| Mic permission denied | Blocking card: `Microphone access is off. Turn it on in Settings to log by voice.` + **Open settings** deep link + fallback **Type it instead** (routes the transcript box to accept typed input → same LLM parse). |
| Recording | Waveform active, timer, Stop button, danger mic. |
| Transcribing / parsing | Labeled skeleton: `Transcribing…` then `Understanding your meal…` with a shimmer over the item rows. Never a bare spinner. |
| Low confidence (overall or per-item) | Item rows below a confidence threshold get a honey `#E7B67C` `Double-check` chip and an inline note (e.g. `assumed 1 cup`). The confirm button copy softens to `Review & log` and the low-confidence fields are visually nudged for editing. Nothing commits silently. |
| No speech / empty transcript | `Didn't catch that — try again` with a re-record button; mic stays primed. |
| Parse returned nothing usable | `Couldn't turn that into a meal. Edit the text or log manually.` + editable transcript + **Log manually**. |
| Offline | Voice capture + transcript editing work, but LLM parse requires network. Show `Voice AI needs a connection to understand your meal` and offer to **save the transcript** as a queued draft that parses automatically when back online (surfaces as a pending item in the offline queue). |
| Error (LLM 5xx/timeout) | `Our AI hit a snag. Retry?` preserving the transcript. |

**Premium gate.** Non-entitled users see the overlay's content replaced by the upsell card (5.9). Entitlement (`voice_ai`) is checked **client and server** — the client hides/locks; `POST /api/log/voice` also enforces entitlement server-side and returns `402` if spoofed.

**Light + dark.** Mic orb glow tints from the signature mesh in dark; in light the orb uses deep `#0F9482` with a softer glow. Confidence chips keep honey/danger semantics in both.

---

### 5.6 Mode: Barcode scan  · Free (never gated)

Presented as a **full-screen overlay route** at `/log/scan` (not an in-sheet mode) that opens the camera and, on a successful lookup, feeds the shared confirm sheet (5.8). Camera → lookup → macros. Fastest path for packaged foods. Barcode scanning is **free and never gated** — it deliberately drives the logging habit (see §0.4).

**Layout & flow.**

1. **Camera viewport** fills the mode body with a centered scan reticle (rounded frame, jade corner ticks that pulse subtly) and helper copy `Point at a barcode`. A torch toggle and a `Enter barcode manually` link sit below.
2. On a successful decode, a soft haptic + jade flash confirms capture, and we call the product lookup (`GET /api/food/barcode/:upc`, new — resolves UPC/EAN against the branded food DB / a barcode provider, normalized to the same food shape as USDA results).
3. Result opens the **confirm sheet** (5.8) pre-filled with the product's name, brand, serving, and macros — user sets quantity/slot and logs.

**States.**

| State | Treatment |
|---|---|
| Camera permission not asked | Primer card `Scanning needs your camera` + `Allow camera`. |
| Camera permission denied | `Camera access is off. Turn it on in Settings to scan.` + **Open settings** + fallback **Enter barcode manually** (numeric field → same lookup). |
| Scanning (searching) | Reticle animates; on decode, an inline `Looking up {upc}…` chip with spinner. |
| Found | Transitions to confirm sheet with the product. |
| Not found | `We couldn't find that product` + the decoded number for reference + **Log manually** (name pre-fillable) and **Try photo** (Premium). Offer `Report missing product` (queues UPC for catalog improvement; analytics event). |
| Bad/blurry decode | `Hold steady — couldn't read the barcode` overlay; keeps scanning. |
| Offline | Decode works on-device but lookup needs network: `Connect to look up this product` + save the UPC as a queued draft that resolves on reconnect, or **Enter macros manually** now. |

**Light + dark.** The viewport chrome (reticle, controls) stays legible over live camera in both themes via a fixed dark scrim gradient at top/bottom; the confirm sheet then follows the active theme.

---

### 5.7 Mode: AI Photo logging  · Premium (`photo_ai`)

Presented as a **full-screen overlay route** at `/log/photo` (not an in-sheet mode) that opens the camera/upload UI and, on completion, feeds the shared confirm sheet (5.8). Camera/upload → food recognition → estimated macros with confidence, always editable.

**Layout & flow.**

1. **Two capture affordances** at top (2-up glass tiles): **Take photo** (`camera`, opens camera with `capture="environment"`) and **Upload** (`image-plus`, gallery/file picker).
2. **Preview** area shows the captured/selected image (radius 20, object-cover) with a **Retake/Replace** control. Empty state is a dashed `surface-2` drop zone: `Add a meal photo`.
3. On confirm-to-analyze, `POST /api/log/photo` (new, multipart) sends the image to the vision model, which returns detected items with per-item macro **estimates and a confidence score**, e.g. `[{ name, portionEstimate, calories, protein, carbs, fat, confidence }]`.
4. **Results** render like the Voice draft: an editable multi-item list with quantity/portion steppers, per-item macros, slot chips, and add/delete — every value editable. A prominent **confidence banner** frames the whole estimate.
5. **Confirm** logs the (possibly edited) items in a batch and toasts.

**Confidence UX (required).** Photo estimates are inherently uncertain, so confidence is front-and-center:

- **High** (≥ ~0.75): jade `#43C6AC` `Looks confident` chip; standard confirm.
- **Medium** (~0.5–0.75): honey `#E7B67C` `Estimate — please check portions` banner; portion steppers pre-highlighted.
- **Low** (< ~0.5): danger-tinted `#E1616C` `Low confidence — we may be off. Edit before logging.` banner; confirm copy becomes `Review & log`; we never auto-commit.
- Each item shows its own confidence as a subtle 3-dot/segmented meter so the user knows which line to trust.

**States.**

| State | Treatment |
|---|---|
| Camera/library permission not asked | Primer + `Allow camera` / `Allow photos`. |
| Permission denied | `Camera/Photos access is off…` + **Open settings** + fallback **Search** or **Manual**. |
| Analyzing | Skeleton item rows + label `Analyzing your plate…`; the preview stays visible with a scanning shimmer. |
| No food detected | `We didn't spot any food in that photo. Try another angle, or log manually.` + **Retake** + **Log manually**. |
| Low confidence | Banner + per-item meters as above; editing encouraged, nothing silent. |
| Offline | Capture/preview work; analysis needs network. `Photo AI needs a connection to analyze` + **save as queued draft** (analyzes on reconnect) or **Log manually** now. |
| Error (vision 5xx/timeout) | `Analysis failed. Retry?` preserving the image. |
| Oversized/invalid image | Client compresses before upload; if still invalid, `That image won't upload — try another`. |

**Premium gate.** Same client+server enforcement as Voice; entitlement key is `photo_ai` and `POST /api/log/photo` returns `402` for non-entitled callers. Non-entitled users see the upsell card (5.9).

---

### 5.8 Mode: Manual entry & the shared meal-logger (confirm) sheet

**Manual** is a **first-class in-sheet mode** (the 6th mode, per §0.3) — a distinct manual-entry form, not folded into Quick. It is the always-available escape hatch and the destination of every "log manually" fallback. It renders the confirm-sheet form directly in **manual mode** with an empty, fully editable food.

**The confirm sheet is shared** by Search (per result), Barcode (per product), Quick log (long-press / toast-Edit), Voice/Photo (per drafted item), and Manual. It is the one surface that turns an intent into a committed entry. Structure top-to-bottom:

1. **Food identity.** Name field (editable in manual; read-only label with an edit affordance for USDA/barcode items so users can rename, e.g. `Chicken breast → Lunch chicken`). Brand/source line beneath (`from USDA`, `scanned`, `voice`, `photo`, `manual`) — this feeds the entry's `source`.
2. **Serving selector.** For USDA/barcode items: a dropdown of provided portions + `g`/`oz`/`ml`/`container`. For manual: a simple unit label. Changing serving recomputes macros from the base per-100g/per-serving profile.
3. **Quantity stepper** (`QuantityStepper`): `−` / value / `+`, step 0.5, min 0.5, tabular-nums, 44px targets. Long-press to accelerate; a tap on the number opens a numeric keypad for exact entry (e.g. `1.75`).
4. **Meal-slot selector** (`SlotSegmented`): four segments `Breakfast · Lunch · Dinner · Snack`, full-pill, active = jade, sentence case. Defaults to the **time-inferred slot** (matching `inferSlotFromTime`) but always user-overridable. Slot is required (never null).
5. **Live macro preview** (`MacroPreviewRow`): four stats — calories (jade `#43C6AC`), protein (aqua `#5FD4C4`), carbs (honey `#E7B67C`), fat (rose `#E1A0AB`) — big weight-800 tabular-nums that **recompute on every serving/quantity change** with a subtle count-up (respects reduced motion). Below the numbers, a slim **target-impact** line: `Adds 12% of today's calories · protein → 68/140g`, coloring honey/danger if this entry pushes a macro over target (over-target state).
6. **Manual macro fields** (manual mode only): a 4-up grid of numeric inputs `Cal · Protein · Carbs · Fat`, tabular-nums, radius 16. Calories auto-suggest from the 4/4/9 rule when left blank but are user-overridable.
7. **Notes** (optional, collapsible): free-text `Add a note` (e.g. "post-workout").
8. **Sticky confirm bar:** primary `Log meal` button (jade fill, `on-accent` text, full-width, radius 16), pinned above the safe area / keyboard. For multi-item drafts (Voice/Photo) it reads `Log {n} items`. `tap scale .97`.

**Interactions.**

- Editing any input updates the preview and the header today-pill live.
- Confirm commits via `logMeal(...)` (normalized to `{ name, calories, protein, carbs, fat, type/slot, loggedAt, source, notes }`), then the sheet either closes to a toast (single-item entries) or, for batch drafts, collapses the drafted list and toasts a summary.
- **Cancel/Close** on the confirm sheet discards the draft (with a confirm-discard prompt only if the user edited macros/notes, to prevent silent loss).

**States.**

| State | Treatment |
|---|---|
| Default | Slot pre-selected by time; quantity 1; preview live. |
| Manual empty | Name focused; macro fields `0`; `Log meal` disabled until name present (calories may be 0 but name is required). |
| Over-target | Target-impact line + affected macro chip turn honey (within 10%) or danger (over); confirm still allowed (logging truth > nagging), with a soft `You'll be {n} over on carbs` note. |
| Saving | Confirm button shows an inline spinner + `Logging…`; optimistic UI still updates Home immediately (write is local-first). |
| Save error (backend) | Entry stays logged locally (source of truth is local); a quiet `Saved on device — will sync` chip. No blocking error. |

---

### 5.9 Editing & deleting logged meals

Logged meals are managed both from the hub's recents and from Home's "logged today" list. This closes two current gaps: **editing** (today only delete exists) and the **delete-scope bug** (today's list currently deletes by array index, which is unsafe across days).

**Edit.** Any logged entry exposes **Edit** (tap the entry, or swipe-left → `Edit`). Edit reopens that entry in the **confirm sheet** pre-filled with its current name, serving, quantity, slot, macros, and notes. Saving updates the entry in place: it **re-derives totals** and updates Home's ring/bars and Insights. Editing preserves the original `loggedAt` (so timeline position is stable) and stamps `editedAt`.

**Delete.** Swipe-left → `Delete` (danger `#E1616C`), or the trailing menu. Deleting removes the entry and re-derives the day's totals (`totalCalories`/`protein`/`carbs`/`fat` recomputed from the remaining meals, matching `removeMeal`). A toast offers **Undo** (~5s) that restores the exact entry.

**Fix — today-only delete & stable identity.** The current `removeMeal(index)` splices `dailyLog.meals` by position, which is only correct for the current day and is fragile if the list reorders. The redesign requires:

- Every logged entry carries a stable **`id`** (uuid at log time) in addition to `loggedAt`.
- Edit/delete operate **by `id`**, not array index — eliminating the reorder/off-by-one risk.
- Edit and delete are permitted only for entries whose `loggedAt` date **equals today**. Past days are read-only in the log UI (history is immutable from the hub); this is the intended "today only" scope, now enforced by date comparison rather than implied by which list you're in. Entries from prior days render without swipe actions and show a muted `Logged {date}` label.
- Deletes/edits sync via `PUT/DELETE /api/log/:id` (new; today the log API only appends). Local-first: apply immediately, reconcile on sync, queue if offline.

**States.** Empty (no meals today) → duotone empty illustration + `Nothing logged yet — tap + to start`. Deleting the last meal returns Home's ring to 0 with a gentle reverse fill.

---

### 5.10 Confirm → toast loop

Every successful log resolves into a consistent, low-friction confirmation:

- **Toast** (`LogToast`) slides up above the bottom nav: a jade check disc, `Logged {name}` (or `Logged {n} items`), and the running remaining-calories delta (`1,240 → 1,015 left`). Glass surface, radius 16, auto-dismiss ~3.5s, `ease-out`.
- **Actions in the toast:** **Undo** (removes the just-logged entry / batch) and **Edit** (reopens it in the confirm sheet). For batch logs, Edit reopens the drafted list.
- **Haptic:** a light success tap on commit (where supported).
- **Home reaction:** the **Macro Orb** on Home fills incrementally toward the day's target as the entry lands (signature 3D moment; the toast's calorie delta narrates it). Macro bars animate the added segment (stagger 60ms). Under `prefers-reduced-motion`/low-power, the orb uses a static gradient step instead of the fluid fill.
- **Sheet behavior:** single-item logs close the hub to the toast (returning to the invoking screen); multi-item drafts keep the hub open, collapse the logged items, and toast a summary so users can keep adding.
- **Streak/milestone:** if this log completes a daily goal or extends a streak, the toast escalates to a brief mesh-burst celebration (haptic-timed), then settles.

**Offline confirm.** When offline, the toast reads `Logged — will sync` with a small cloud-off glyph; the entry is fully usable locally and enters the **offline queue**.

---

### 5.11 Offline queue (cross-mode)

All logging is **local-first**: entries commit to local state (source of truth) instantly, then sync. A shared queue handles deferred work:

- **Queued writes:** new logs, edits, deletes made offline → replayed in order on reconnect (`POST/PUT/DELETE /api/log`).
- **Queued AI drafts:** offline Voice transcripts, Barcode UPCs, and Photo images can be saved as **pending drafts** that auto-run their AI step (voice parse / product lookup / vision analysis) when connectivity returns, then surface a `Ready to review` toast so the user confirms them into real entries.
- **Surfacing:** a subtle `n pending` chip in the hub header (and a Home indicator) reveals the queue; tapping lists pending items with retry/discard. Conflicts (edited then failed) resolve local-wins with a quiet notice.
- **No data loss:** nothing the user captured is discarded due to being offline — it either logs locally or waits as a draft.

---

### 5.12 Components used

`SheetModal` (drag-dismiss, height escalation), `ModeSelectorPills`, `SearchInput`, `SegmentedFilter`, `FoodResultRow`, `QuickFoodTile`, `RecentChip`, `CategoryChips`, `VoiceOrbButton` + `Waveform`, `TranscriptField`, `DraftItemList` (shared by Voice/Photo), `CameraViewport` + `ScanReticle`, `PhotoDropZone`, `ConfidenceBanner` + `ConfidenceMeter`, the shared **confirm sheet** = `MealLoggerSheet` (`ServingSelector`, `QuantityStepper`, `SlotSegmented`, `MacroPreviewRow`, `TargetImpactLine`, `ManualMacroGrid`, `NotesField`, `StickyConfirmBar`), `LoggedMealRow` (swipe edit/delete), `LogToast`, `PermissionPrimerCard`, `EmptyStateIllustration`, `OfflineChip`, `PaywallUpsellCard`. All consume the canonical tokens; macro colors are fixed to the unified set (jade/aqua/honey/rose) everywhere — no legacy palette.

---

### 5.13 Premium gating summary

| Mode | Free? | Entitlement | Enforcement |
|---|---|---|---|
| USDA Search | Yes | — | — |
| Quick log | Yes | — | — |
| Manual | Yes | — | — |
| Barcode scan | Yes (never gated) | — | None — deliberately free to drive the logging habit (§0.4) |
| **Voice AI** | No | `voice_ai` | Client hides/locks pill → paywall; `POST /api/log/voice` server-side entitlement (`402` if spoofed) |
| **Photo AI** | No | `photo_ai` | Client hides/locks pill → paywall; `POST /api/log/photo` server-side entitlement (`402` if spoofed) |

**Upsell card (Voice/Photo, non-entitled).** Replaces the mode body: a `lock` glyph in a jade-tinted tile, `Voice logging is a premium feature` / `Photo logging is a premium feature`, subcopy `Start your 48-hour free trial to log by voice and photo`, and a primary **Start free trial** button (jade, `sparkles` glyph) opening the paywall. During an active trial, the modes are fully unlocked; on trial expiry they revert to this card and any queued AI drafts remain viewable but require re-entitlement to run. Entitlement source is the `premium{status,trialExpiresAt}` state, checked on mode entry and again server-side at request time.

---

### 5.14 Data & API notes

- **Log entry shape (extended):** `{ id (uuid), name, calories, protein, carbs, fat, type/slot, quantity, unit, loggedAt, editedAt?, source: 'usda'|'quick'|'voice'|'barcode'|'photo'|'manual', confidence?, notes }`. Adds `id`, `quantity`/`unit`, `editedAt`, richer `source`, optional `confidence` over today's shape.
- **Endpoints** (all under `/api`, per §0.5): existing `GET /api/food/search`, `GET /api/food/:id`, `POST/GET /api/log`. **New:** `GET /api/food/barcode/:upc` (product lookup, free/never gated), `POST /api/log/voice` (transcript → structured meal, `voice_ai`-gated), `POST /api/log/photo` (image → estimated meal, `photo_ai`-gated), `PUT /api/log/:id` (edit), `DELETE /api/log/:id` (delete). All log mutations are entitlement-agnostic except the two AI parse endpoints.
- **Local-first:** every write applies to local state first (source of truth), then syncs; offline writes queue and replay. AI drafts persist locally until confirmed.
- **Analytics events (per redesign gap):** `log_opened{mode,source}`, `log_mode_changed`, `food_searched`, `meal_logged{source,slot,calories}`, `meal_edited`, `meal_deleted`, `voice_parse{confidence,items}`, `barcode_scanned{found}`, `photo_analyzed{confidence,items}`, `ai_gate_hit{mode}`, `offline_log_queued`, `queued_draft_resolved`.


## 5B. Explore (discovery)

Explore is the fourth primary tab — `Home · Plans · [ + FAB ] · Explore · You` — routed at `/explore` (§0.2). It is the app's **discovery surface**: a browsable, editorial feed of trending and seasonal foods, recipe inspiration, restaurant options, and meal ideas. Its job is engagement and top-of-funnel — give the user a reason to open Plato when they aren't mid-log — and then funnel that curiosity back into the two action surfaces: **Log** (record what you ate) and **Plans** (build your plan). Explore itself never mutates a diary or a plan; it only *routes into* the surfaces that do.

### 5B.1 Purpose & how it differs from Log and Plans

Three surfaces, three verbs — kept deliberately distinct so the bottom nav reads as three different intents:

| Surface | Verb | User mindset | Mutates |
|---|---|---|---|
| **Log** (`/log`, via + FAB) | "record" | *I ate this, capture it now* | The diary (`/api/log`) |
| **Plans** (`/plans/*`) | "plan" | *This is my structured week / recipes / grocery* | `meal_plans`, `saved_recipes`, `grocery_json` (§9) |
| **Explore** (`/explore`) | "discover" | *Show me something new — what's good, what's in season, what's nearby* | **Nothing** — read-only browse |

- Explore is **pull, not push**: the user comes here to browse, not to complete a pending task. There is no target total, no ring, no "you're behind" pressure. Tone is editorial and calm, not corrective.
- Every card in Explore terminates in a handoff to Log or Plans (§5B.4). Explore is the *catalog*; Log and Plans are the *carts*.
- Explore is **free to browse in full**. The single premium touchpoint is Restaurant discovery deepening into **Restaurant Mode** (`restaurant_mode`, §0.4) — and even that shows a teased preview before gating (§5B.7).
- It reuses Home's atmosphere (mesh + glass bento) but *not* Home's data: no Macro Orb, no calorie hero. Explore leads with **content**, not the user's numbers.

### 5B.2 Layout — the discovery bento

Explore is a single vertical scroll on the 430px content column, 24px (`--space-8`) gutters, `--space-safe-bottom` (~104px) bottom pad to clear the floating glass nav. The mesh backdrop (`--mesh-dark` / `--mesh-light`, §1.2) sits behind; content is a stack of `.glass-card` bento blocks and horizontal carousels. Section entrances stagger at `--stagger` (§1.10), clamped to the first ~8 items.

**Top bar** — contextual glass top bar (heavier glass, `blur(24px)`, §1.3.2 when scrolled). Screen title "Explore" in `--text-title` (display face). The avatar sits top-right and routes to `/you` (§0.1) — never a drawer. No back affordance (Explore is a root tab).

The stack, top to bottom:

1. **Search bar (sticky).** A single `--radius-control` (16px) input on `--surface-2`, `--text-body-lg` placeholder "search foods, recipes, restaurants" in `--text-muted`, a leading 20px Lucide `search` glyph in `--text-secondary`. It is **sticky** below the top bar so discovery-by-typing is always one tap away. Focusing it transitions to the **search results state** (§5B.6). This bar is the discovery counterpart to the Log-hub search — it searches the *catalog* (foods + recipes + restaurants), not the diary.

2. **Category chips (horizontal scroll).** A single row of `--radius-pill` chips just under search — the taxonomy filter for the feed below. Chips: `all · trending · high-protein · quick · seasonal · recipes · restaurants · snacks · breakfast`. Rest state: `--surface-2` fill, `--text-secondary` label (`--text-caption`), `--border-hairline`. Selected: `--interactive-primary` fill, `--text-on-accent` label, `--shadow-glow`. Selection animates at `--dur-fast` with `--tap-scale`. Exactly one chip active at a time; `all` is default. Selecting a chip re-filters the sections below in place (no route change).

3. **Trending foods (carousel).** Section head "Trending now" (`--text-section`) with a `TRENDING` micro-label eyebrow (§1.5.4). A horizontally-scrolling row of compact food tiles (`--radius-tile`, `--surface-2`, `--shadow-1`): duotone spot thumbnail (§1.9), food name (`--text-body`), and a `--text-caption` meta line (e.g. "182 kcal · 24g protein" in tabular-nums, macro chips tinted with `--macro-protein` / `--macro-carbs` / `--macro-fat`). A small jade `plus` affordance in the tile corner is the **quick-add** entry to Log (§5B.4). Data: USDA popular/trending (§5B.5).

4. **Recipe inspiration (cards).** Section head "Recipe inspiration". Larger editorial cards (`.glass-card`, `--radius-card`) in a 2-wide bento or a scroll row: duotone hero image, recipe title (`--text-body-lg`), a macro-summary row (per-serving kcal + P/C/F in `--text-caption`, tabular-nums), and a `TIME` micro-label with prep minutes. Tapping the card opens the recipe — reusing the existing recipe detail route `/plans/recipes/:recipeId` (§0.2) — from which the user can **add to plan** or **log** (§5B.4). Data: curated recipe list (§5B.5).

5. **Restaurants near you (premium teaser).** Section head "Restaurants near you". A `.glass-card` that shows 2–3 **teased** restaurant tiles (name, cuisine, a duotone spot mark, "menu items with macros" caption) with the lower portion under a soft fade/scrim and a `--radius-pill` premium pill reading "Plato Plus" (`--warning` tint). The whole block is the **Restaurant Mode** touchpoint: tapping it opens the paywall GlassSheet at `/upgrade` scoped to `restaurant_mode` (§5B.7). This is the only gated block in Explore.

6. **Seasonal / editorial cards.** Section head "In season" (or a dated editorial title, e.g. "July · summer produce"). A wide `.glass-card` with a duotone illustration, a short editorial blurb (`--text-body`, sentence case), and a chip-list of seasonal foods each of which quick-adds to Log. This is the "magazine" slot — curated copy, refreshed on a schedule (§5B.5), giving Explore its editorial feel.

7. **Quick-add shortcuts (bento grid).** Section head "Quick add". A compact grid of `--radius-tile` cells (`--surface-2`, `--shadow-1`) for the user's most-logged and common foods — one-tap shortcuts straight into the meal-confirm sheet (§5B.4). This is the fastest path from Explore back into Log and rewards the user for browsing. Personalized from log history where available; falls back to curated common foods.

### 5B.3 Component & token usage

Only canonical components and tokens (§1):

- Blocks are `.glass-card` (§1.3.1); the top bar and any scrolled chrome use the heavier `.glass-nav` glass (§1.3.2). Never nest glass on glass — inner tiles use solid `--surface-2` / `--surface-3` (§1.3.3).
- Radii: cards `--radius-card` (22), tiles `--radius-tile` (20), search input / segmented controls `--radius-control` (16), chips & pills `--radius-pill`, thumbnails `--radius-avatar` (13).
- Shadows: tiles `--shadow-1`, cards `--shadow-2`, sticky search / nav `--shadow-3`, selected chip & primary affordances `--shadow-glow` (§1.4).
- Type: section heads `--text-section` (display), eyebrows `--text-micro` (the only uppercase, §1.5.4), titles `--text-body-lg`, meta `--text-caption`; all numerics `tabular-nums` (§1.5.3). All copy sentence case.
- Motion: chip select & tap `--dur-fast` + `--tap-scale`; section/carousel entrance `--dur-base` + `--stagger`; page transition per §1.10 (fade + 12px slide). Respect `prefers-reduced-motion` (§1.10.2) — carousels don't auto-advance, illustrations freeze.
- Macro chips/dots use exactly `--macro-protein` (aqua), `--macro-carbs` (honey), `--macro-fat` (rose), calories jade `--macro-cal` (§1.1.4). No rainbow.

### 5B.4 Entry points OUT — into Log and Plans

Explore's value is measured by these handoffs. Explore never writes; it routes into the surface that does.

**Into Log:**
- **Quick-add (`plus` affordance on a food tile / seasonal chip / quick-add cell)** → opens the shared **meal-confirm sheet** (§0.3) pre-populated with that food (slot defaulted by time of day, quantity 1, live macro preview). The user confirms → it lands in the diary via `/api/log`. This is a transient sheet (no route), returning the user to Explore on save/dismiss with a success toast.
- **"Open in Log"** (secondary action on a food, e.g. long-press or overflow) → routes to the Log hub `/log` in `search` mode pre-seeded with that food's query, for users who want to adjust before recording.

**Into Plans:**
- **Recipe card → "Add to plan"** → from the recipe detail (`/plans/recipes/:recipeId`) the existing add-to-plan flow appends the recipe into the active `meal_plans.meals_json` (§9) at a chosen slot. Saved recipes persist to `saved_recipes`.
- **"Save recipe"** (bookmark affordance on a recipe card) → writes to `saved_recipes` so it appears under `/plans/recipes`. Optimistic; syncs to backend (§9).

Handoff copy is sentence case: "add to log", "open in log", "add to plan", "save recipe". Each success emits a toast (§1.10 toast pattern) and the relevant analytics event (§5B.8).

### 5B.5 Data sources

| Block | Source | Notes |
|---|---|---|
| Search results | USDA food search + curated recipe index + restaurant index | Same USDA path as Log search; unified query fans across foods/recipes/restaurants. |
| Trending foods | **USDA trending/popular** (curated popularity ranking over USDA items) | Cached; refreshes daily. Falls back to a static curated "popular foods" list offline. |
| Recipe inspiration | **Curated recipe list** | App-owned editorial recipe set; each maps to a `recipeId` usable by `/plans/recipes/:recipeId`. |
| Restaurants near you | **Restaurant data** (location-scoped restaurant + menu-macro dataset) | Requires location permission; teased for free, full access is `restaurant_mode` (§5B.7). |
| Seasonal / editorial | Curated editorial content keyed by month/season | Scheduled refresh; drives the "magazine" feel. |
| Quick-add shortcuts | User log history (personalized) → curated common foods (fallback) | Read-only from history; no write. |

- All endpoints are `/api`-relative (§0.5). Content is **cached** for offline browse (§5B.6) — the last-fetched feed persists to localStorage so Explore renders instantly and works offline in a degraded form.
- Restaurant data is fetched only after the user engages the restaurant block (lazy), and only the *teaser* payload is fetched for free users; the full menu-macro payload is entitlement-gated server-side (HTTP 402 on `restaurant_mode`, §0.4).

### 5B.6 States

**Default (populated).** The full bento (§5B.2) with `all` chip active. Sections stagger in; carousels scroll horizontally; mesh backdrop behind.

**Loading (skeletons).** On first load / cache miss, each block renders skeleton placeholders matching its final geometry: skeleton food tiles in the trending row, skeleton recipe cards, skeleton chips. Skeletons use `--surface-2` → `--surface-3` shimmer (a slow gradient sweep, `--dur-slow`, gated by reduced-motion → static `--surface-2`). Search bar and category chips render immediately (they need no data) so the top of the screen is interactive while the feed loads. No spinner blocks the whole screen.

**Empty (no content for a filter).** If a selected category chip yields nothing (rare — only for a sparse taxonomy or a bad content fetch), show a centered duotone empty-state illustration (§1.9), a `--text-section` line "nothing here yet", `--text-body` sub "try another category", and a jade text action "back to all" that reselects the `all` chip. Never a dead blank screen.

**No-results (search).** When the sticky search returns zero matches, show inside the results area: a small duotone glyph, "no results for '{query}'" (`--text-body-lg`, the query in `--text-primary`), a `--text-secondary` hint "check spelling or try a simpler term", and a jade action "add it manually" that routes to the Log hub in `manual` mode (§0.3) so a genuine miss still ends in a log. Recent/suggested searches (chips) sit above for recovery.

**Offline.** If offline with cached content, render the last-fetched feed with a slim `--info`-tinted banner at top: "you're offline — showing saved picks" (`--text-caption`). Quick-add still works (writes queue to Log per the offline-log behavior). Restaurant "near you" collapses to a disabled state ("restaurants need a connection", `--text-muted`) since it's location- and network-bound. If offline with **no** cache, show the empty-state illustration with "you're offline" and a "retry" action.

**Location denied (restaurants).** If the user declined location, the restaurants block shows "turn on location to see restaurants nearby" with an "enable location" action — it does **not** show a paywall until location is granted and the user actually taps into the (gated) full experience.

**Error (feed fetch failed, online).** Per-block error tile (not full-screen): "couldn't load this" with a "retry" text action in jade, scoped to the failing block so the rest of the feed still renders. Failed sync/fetch uses `--danger` sparingly (icon/text), not a loud banner.

### 5B.7 Premium touchpoints

Explore has exactly **one** paid surface: **Restaurant discovery → Restaurant Mode** (`restaurant_mode`, §0.4).

- The "restaurants near you" block (§5B.2 item 5) is a **teaser**: free users see restaurant names, cuisines, and that "menu items with macros" exist, under a soft scrim with a "Plato Plus" `--radius-pill` (`--warning` tint). This is a deliberate value-tease, not a hard wall.
- Tapping the teaser (or any locked restaurant) opens the **paywall GlassSheet** at `/upgrade` (bottom sheet, §0.8) scoped to `restaurant_mode`, framed around restaurant benefits: "log restaurant meals with real macros", "find on-plan options nearby". Trial framing is **hours** (e.g. "trial · 41h left"), never days (§0.4).
- Gating is server-authoritative: the full restaurant menu-macro payload returns **HTTP 402** for non-entitled users (§0.4); the client shows the paywall on 402, never a broken state.
- No other Explore block is gated. Trending, recipes, seasonal, search, and quick-add are all **free** — Explore's role is engagement, and gating the browse would defeat it.

### 5B.8 Analytics events

Namespaced `explore_*`; every handoff is instrumented so we can measure Explore → Log/Plans conversion (the tab's core KPI). Property names are illustrative but stable.

| Event | When | Key properties |
|---|---|---|
| `explore_view` | Explore tab opened | `entry` (nav_tab), `theme` |
| `explore_search_submitted` | Search query run | `query_len`, `result_count`, `has_results` |
| `explore_search_no_results` | Search returns zero | `query_len` |
| `explore_category_selected` | Category chip tapped | `category` (all·trending·high-protein·…) |
| `explore_trending_impression` | Trending row viewed | `item_count`, `source` (usda_trending) |
| `explore_food_quick_added` | Quick-add → meal-confirm opened | `food_id`, `block` (trending·seasonal·quick_add), `source` |
| `explore_food_logged` | Meal-confirm saved from Explore | `food_id`, `slot`, `block` (**the core conversion event → Log**) |
| `explore_recipe_opened` | Recipe card tapped | `recipe_id`, `block` (inspiration·search) |
| `explore_recipe_added_to_plan` | Recipe added to a plan | `recipe_id`, `slot` (**conversion → Plans**) |
| `explore_recipe_saved` | Recipe bookmarked | `recipe_id` |
| `explore_seasonal_engaged` | Seasonal card / chip tapped | `content_id`, `action` (quick_add·read) |
| `explore_restaurant_teaser_view` | Restaurant teaser rendered | `restaurant_count`, `location_state` |
| `explore_restaurant_paywall_shown` | Paywall opened from restaurants | `feature` = `restaurant_mode`, `source` = explore_restaurants |
| `explore_restaurant_upgraded` | Upgrade completed from this touchpoint | `feature` = `restaurant_mode` |
| `explore_offline_shown` | Offline/cached feed rendered | `has_cache` |
| `explore_block_error` | A block failed to load | `block`, `reason` |

Conversion is tracked primarily via `explore_food_logged` (→ Log) and `explore_recipe_added_to_plan` (→ Plans); `explore_restaurant_paywall_shown` → `explore_restaurant_upgraded` measures the premium funnel.

### 5B.9 Light + dark notes

- **Dark (reference).** Mesh `--mesh-dark` behind; `.glass-card` blocks over it; `--interactive-primary` = jade (`#43C6AC`) for selected chips, quick-add `plus`, and jade text actions; `--shadow-glow` (jade) on the active chip and primary affordances. Restaurant scrim is a dark fade to `--bg-base` with the honey-tinted premium pill.
- **Light.** Mesh `--mesh-light` (§1.2.2); glass fill `rgba(255,255,255,.62)`; `--interactive-primary` resolves to **deep** (`#0F9482`) so selected chips, quick-add, and text links clear AA on the off-white surfaces (§1.1.3). Skeleton shimmer runs `--surface-2` → `--surface-3` on light. `--shadow-glow` uses the deep ring on light (§1.4). Restaurant scrim fades to `--surface-1` (white) instead of forest.
- **Theme-invariant:** macro chip hues (aqua / honey / rose), calorie jade, and duotone illustration ramps (macro hue → `--brand-forest`) are identical across themes — only surfaces, text, borders, glass, mesh, and `--interactive-primary` swap (§1.11). Emit `theme` on `explore_view`.
- Both themes honor `env(safe-area-inset-*)`, `--space-safe-bottom` for nav clearance, and the `@supports not (backdrop-filter)` solid-glass fallback (§1.3.3) so text contrast never degrades on low-power devices.


## 6. Plans, recipes, grocery & restaurant

The Plans tab is Plato's "what to eat" engine — the counterpart to the "what did I eat" logging loop on Home and Log. It houses the personalized 7-day meal plan, plan generation and regeneration, premium Concierge Swaps, the Recipe Book (imports + saved recipes, now backend-synced), the auto-generated Grocery List, and premium Restaurant Mode. Everything here is dark-theme first and rebuilt on the Elevated Verdant tokens; the three legacy palettes (`#10d9a0` / `#34E89E` / `#10b981` and the two conflicting macro sets) are retired in favor of jade `#43C6AC` for calories/energy, aqua `#5FD4C4` protein, honey `#E7B67C` carbs, rose `#E1A0AB` fat.

This section replaces the current `MealPlans.jsx` surface (`My Plan` / `Recipes` / `Restaurant` sub-tabs) and the modal components `GroceryList`, `RecipeBook`, `YouTubeImporter`, `SmartSwaps`, and `RestaurantBrowser`.

### 6.0 Information architecture & routing

The Plans tab is reachable from the floating glass bottom nav (`Home · Plans · [FAB +] · Explore · You`) and gets real deep-link routes, replacing state-based `activeTab`.

Routes for this tab are `/plans/week`, `/plans/recipes`, `/plans/recipes/:recipeId`, `/plans/restaurant` (premium), and `/plans/grocery`; the shared read-only view is `/share/plan/:shareId`. Plan config/regenerate is a **transient sheet with no route**. See the §0 canonical route table for the authoritative list.

Sub-tabs live in a segmented **`SegmentedTabs`** control (pills, `radius: full`, `surface-2` track, active pill jade `#43C6AC` fill with `on-accent #04231C` text). Tapping a locked tab (Restaurant while free) does **not** switch — it opens the paywall (`PremiumSheet`) and shows a `LockBadge` micro-label ("premium", 10px, uppercase, `.16em` tracking, honey `#E7B67C`) on the pill. Browser back/forward navigate sub-tabs and dismiss sheets in order (sheet → sub-tab → tab).

**Top bar (contextual):** avatar → **You** tab (`/you`) · title "Plans" · contextual action = **`Regenerate`** icon button (`RefreshCw`) on My plan, **`Import`** (`Plus`) on Recipes, **`Search`** on Restaurant · premium status pill (Free / Trial hours-left countdown / Active).

---

### 6.1 My plan — the 7-day meal plan

#### Purpose
Give the user a glanceable, actionable week of meals that hit their macro targets, with one-tap logging so the plan feeds the daily loop without retyping. The plan is a suggestion engine, not a contract — every meal can be logged, skipped, or swapped.

#### Data reality (today → redesign)
Today `plan` holds a flat `meals[]` of `mealsPerDay` items generated once and re-sliced by a computed `dayIndex` (`swapMeal` derives day from `createdAt`), so "7 days" is largely the same day repeated. The redesign makes the plan explicitly **7 distinct days** with per-day, per-slot meals and per-meal **status** (`planned | ate | skipped | swapped`). See the data model in 6.9.

#### Layout (top → bottom, mobile 430px max, `pb-[104px]` for nav)
1. **Plan header strip** — `27px` screen title "Your week", `13px` sage subline: `{calories} cal/day · {protein}g protein · 7-day plan`. A live status dot uses jade `#43C6AC`. Right side: **`Regenerate`** ghost icon button.
2. **`SegmentedTabs`** — My plan · Recipes · Restaurant (Restaurant carries `LockBadge` when free).
3. **Week selector** — horizontal `DayPills` row (`Mon…Sun`), `radius: full`, snap-scroll, `no-scrollbar`. Active day = jade fill; today gets a subtle jade `1px` ring even when not selected. Each pill shows the weekday label (10px micro-label) over a **completion dot ring** — a 3px conic ring that fills jade as that day's meals move to `ate` (e.g. 2/3 logged = ~66%). Tapping a day selects it within `/plans/week` (day held in view state, not a nested route).
4. **Per-day macro summary card** (`GlassCard`) — the day's planned totals as a 4-up bento of duotone stat tiles. Each tile: hero number (`30px`, weight 800, `-0.03em`, `tabular-nums`) in its macro color, 10px uppercase sage label, and a thin **`MacroBar`** underneath showing planned vs. the day target (fill uses the same-family gradient, e.g. protein `linear-gradient(90deg,#5FD4C4,#43C6AC)`). Calories jade, protein aqua, carbs honey, fat rose. When the day's logged intake diverges from plan, a caption reads `logged 1,840 · planned 2,050` in muted `#5F726D`.
5. **Meal cards list** (`MealCard`, one per slot) — stacked, `stagger 60ms`.
6. **Utility row** — two `TileButton`s: **Grocery list** (honey accent icon tile) and **Import recipe** (aqua accent icon tile). Full-width **`Regenerate plan`** secondary button below.

#### `MealCard` anatomy
A `GlassCard` (`radius: 22`, glass fill `rgba(16,26,22,.50)`, glass border `rgba(160,215,200,.12)`, `blur(16px)`, the signature inset+drop shadow). Contents:

- **Slot label row** — meal-type icon in its duotone tint + slot micro-label (`BREAKFAST` / `LUNCH` / `DINNER` / `SNACK 1…`), 10px uppercase sage.
- **Thumbnail** — `FoodImage` at `md` (rounded `16`); `lg` hero image above the row when `showMealImages` is on. Loading = shimmer skeleton; missing image = duotone `MealGlyph` fallback (fluid gradient blob keyed to meal type, not a broken image).
- **Title** — meal name, `15px` weight 700 ink, truncates to one line.
- **Macro chips** — inline row: `{calories} cal` (ink), `{protein}g P` aqua, `{carbs}g C` honey, `{fat}g F` rose, all `tabular-nums`, `13px`.
- **Ingredient preview** — first 4 ingredients joined by `·` + `+N` overflow, `13px` muted, on a hairline top divider.
- **Status pill** (top-right of card) — reflects meal status:
  - `planned` → no pill (default).
  - `ate` → jade `AtePill` with check, "logged".
  - `skipped` → muted `SkippedPill`, strikethrough treatment on the title, card drops to `~55%` opacity.
  - `swapped` → aqua `SwappedPill` "swapped" with a small `RefreshCw`; card shows a one-line "was: {original name}" caption in muted.
- **Actions (right rail, stacked):**
  - **`Log`** — primary jade button (`on-accent` text). One tap logs the meal into `dailyLog` via `logMeal`, sets meal status → `ate`, fires haptic + `tap scale .97`, and a `Toast` "Logged {name}". The button morphs to a **`Logged ✓`** ghost state; tapping again offers **Undo** (removes the log entry, reverts status → `planned`).
  - **`Swap`** — secondary ghost button (`RefreshCw`). Free users get the local shuffle swap (same-type meal from `MEAL_DATABASE`, macro-scaled to the slot target, status → `swapped`). Premium users get **Concierge Swaps** (6.3). A long-press or "…" overflow opens the meal action menu.
- **Overflow menu (`…`)** — Edit meal (adjust portion / macros — closes the "delete-only" gap), Mark skipped, View recipe, Add to grocery, Remove from day.

#### Key interactions
- **One-tap log** from any meal card; also from the "today's planned meals" module on Home (shared `MealCard` component).
- **Swipe** a `MealCard`: swipe-right = log (jade action reveal), swipe-left = skip (muted action reveal). Honors `prefers-reduced-motion` (disables swipe animation, keeps buttons).
- **Day completion** animates the day pill's conic ring (`ring/orb fill 800ms decelerate`), and completing all of a day's meals triggers a small mesh-burst micro-celebration (respects reduced-motion / low-power).
- Tapping a meal thumbnail/title opens the **Recipe viewer** (6.4) for that meal.

#### States (My plan)
| State | Behavior |
|---|---|
| **Default** | Full week, macro summary, `MealCard`s for selected day. |
| **Empty (no plan)** | `EmptyState`: fluid duotone illustration (jade→aqua mesh plate), headline "no plan yet", body "answer a few questions and we'll build your week in about a minute.", primary **`Build my plan`** → opens Plan config (6.2). If onboarding incomplete, routes into the onboarding plan step instead. |
| **Loading / generating** | `MacroSummarySkeleton` (4 shimmer tiles) + 3 `MealCardSkeleton`s. During generation specifically, show the **Plan Reveal** flow (6.2). |
| **Partial day (some ate/skipped)** | Mixed statuses render per meal; macro summary shows `logged vs planned`. |
| **Over-target** | If logged intake for the day exceeds the calorie target, the calorie tile's `MacroBar` turns honey `#E7B67C` (warning) past 100% and a caption reads "over by {n} cal"; not an error, just informative. |
| **Error (generation failed)** | Inline `ErrorCard` (rose-red `#E1616C` hairline): "we couldn't build your plan. try again." with **`Retry`** and **`Use a template`** fallback (a generic balanced plan from `MEAL_DATABASE`). |
| **Offline** | Plan renders from local cache (source of truth). Logging queues to the offline log queue and a `SyncChip` shows "will sync when online". Regeneration is disabled offline with tooltip "reconnect to regenerate". |

#### Light vs dark
- **Dark (default):** page mesh background (signature radial stack), `GlassCard`s on `surface-1/2`, ink `#EAF1EF` text, sage `#94A9A3` labels.
- **Light:** page base `#F3F7F4`, cards `surface-1 #FFFFFF` with glass fill `rgba(255,255,255,.62)`, primary interactive shifts to deep `#0F9482` for AA contrast; macro colors unchanged; text ink `#0E1614`.

---

### 6.2 Plan generation & regeneration

#### Purpose
Turn the user's profile + preferences into a macro-accurate week, on demand, without re-running full onboarding. Generation is deterministic on macros (Mifflin-St Jeor → targets) and stochastic on meal selection (scored + shuffled), so **Regenerate** always produces a fresh-feeling week that still hits the numbers.

#### Config sheet (`PlanConfigSheet`, slide-up `bottom-sheet`)
Opened by **`Build my plan`** or top-bar **Regenerate** (a transient sheet — no route; see §0). All fields default from `planConfig`; this is fast-but-coach — smart defaults pre-filled, edit only what matters. Fields:

| Field | Control | Options (values) | Default |
|---|---|---|---|
| Goal | `SegmentedTabs` | Lose fat · Maintain · Build muscle · Athletic (`lose-fat` / `maintain` / `build-muscle` / `athletic`) | `maintain` |
| Diet style | `ChipGroup` (single) | High protein · Balanced · Low carb · Keto · Plant-based (`high-protein` / `balanced` / `low-carb` / `keto` / `plant-based`) | `high-protein` |
| Meals/day | `Stepper` | 2–6 | `3` |
| Cook time | `SegmentedTabs` | Quick (≤15m) · Moderate · Any (`quick` / `moderate` / `any`) | `moderate` |
| Cuisines | `ChipGroup` (multi) | American · Italian · Mexican · Asian · Mediterranean · Any | `[]` (any) |
| Restrictions | `ChipGroup` (multi) + free text | Nuts · Dairy · Gluten · Soy · Shellfish · Fish · Vegetarian · Vegan + custom | `''` |

A live **`MacroPreview`** strip at the top of the sheet recomputes as goal/diet change: `{calories} cal · {protein}P / {carbs}C / {fat}F`, so the user sees the numbers move before committing. Footer: **`Generate week`** primary (jade) + **`Cancel`** ghost. On regenerate, a **`Keep meals I've logged today`** toggle (default on) preserves already-`ate` meals and only re-rolls the rest.

#### Generation behavior
- Compute targets (Mifflin-St Jeor BMR × activity + goal delta; see the onboarding/macros section).
- For each of 7 days, distribute calories across slots per `MEAL_DISTRIBUTIONS[mealsPerDay]`, then for each slot: filter `MEAL_DATABASE` by type, exclude restricted keywords (`parseRestrictions` / `isMealAllowed`), score by goal/diet/cook-time/cuisine fit, take top-5, random-pick, then macro-scale to the slot target. De-dupe within a day; allow repeats across the week but bias toward variety.
- Persist plan (locally + **sync to backend**, 6.9) with `createdAt`, `config` snapshot, and 7 `days[]`.

#### Plan Reveal (signature 3D moment #2)
On **Generate**, show the **PlanReveal** sequence, not a fake spinner:
1. `MacroPreview` numbers "lock in" one by one (`ring/orb fill 800ms decelerate`, `stagger 60ms`).
2. A lazy-loaded 3D Spline scene blooms (duotone plate/orb) as the week assembles — meal cards fade+slide in day by day behind glass.
3. Settles into My plan on day 0 (today).
- **Perf:** lazy-load the 3D bundle, static gradient PNG fallback, pause offscreen, and fully skip the Spline scene under `prefers-reduced-motion` / low-power — degrade to the numbers-lock animation + a quick card stagger.

#### States (generation)
| State | Behavior |
|---|---|
| **Loading** | PlanReveal (above) or reduced-motion fallback; blocks interaction with a `scrim`. Typical target < 2s; if it exceeds ~4s show "still working…". |
| **Success** | Toast "your week is ready", lands on My plan; `SyncChip` confirms backend save. |
| **Partial (regenerate w/ kept meals)** | Only re-rolled slots animate in; kept `ate` meals stay put with their status. |
| **Error** | ErrorCard as in 6.1; offer Retry / template fallback; never leave the user planless. |
| **Offline** | Generation runs fully client-side (meal DB is local), so it still works; sync is queued and a `SyncChip` notes "saved locally, will sync". |

#### Premium gating
Generation and regeneration are **free**. Concierge Swaps (6.3) and Restaurant Mode (6.7) are premium. No paywall blocks building a plan.

---

### 6.3 Concierge Swaps (premium)

#### Purpose
Replace a planned meal with a **macro-preserving** alternative that respects the user's diet, restrictions, and taste — the premium upgrade over the free "shuffle to a random same-type meal." Positioned as a smart, opinionated concierge, not a random dice roll.

#### Entry
- **`Swap`** on any `MealCard` for premium users routes here (free users get the local shuffle + a subtle "Concierge swaps" upsell chip).
- Replaces the current `SmartSwaps` modal, keeping its three lenses but unifying visuals on Verdant and fixing the missing premium check.

#### Layout (`ConciergeSwapSheet`, bottom-sheet, dark glass)
- **Header** — "Concierge swaps", subtitle "keep your macros, change the plate."
- **Current meal card** — name + macro chips (the target to preserve).
- **Lens selector** (`SegmentedTabs`): **Macro-match** (default) · **Health** · **Dietary**.
- **Swap candidates list** — each candidate is a `SwapCard` showing: name, macro chips, and a **`MacroDelta`** readout (`+2g P · −40 cal · same C/F`) color-coded (jade = closer to target, honey = drifts). Candidates are ranked by macro distance to the slot target under the active lens.
  - **Macro-match:** minimize Euclidean distance on (cal, P, C, F) vs. the slot target; only surface swaps within a tolerance band (e.g. ±10% cal, protein preserved or improved).
  - **Health:** surface swaps that improve fiber / lower saturated fat / lower calorie density while staying near macros (reuses the current health-improvement heuristics, re-skinned).
  - **Dietary:** enforce vegetarian/vegan/low-carb constraints from `planConfig` + restrictions.
- **Apply** — selecting a candidate expands it, shows the exact resulting macros, and a primary **`Swap in`** button. On apply: replace the meal in that day/slot, set status → `swapped`, keep the "was: {original}" caption, animate the card cross-fade, and re-sync the plan + regenerate that item's grocery contribution.

#### States
| State | Behavior |
|---|---|
| **Default** | Ranked candidates for the active lens. |
| **No improvement needed** | Friendly `EmptyState` with jade check: "this one's already dialed in — no {lens} swaps needed." |
| **Loading** | `SwapCardSkeleton` rows while candidates compute (fast; local DB). |
| **Error** | Inline retry; falls back to the free shuffle swap so the user is never stuck. |
| **Offline** | Works (local DB); sync queued. |
| **Not premium** | Sheet never opens for free users — `Swap` performs the local shuffle and shows a "Concierge swaps ⚡ premium" upsell chip that opens `PremiumSheet`. |

#### Premium gating
Hard-gated: `isPremiumActive()` client-side (entitlement `concierge_swaps`) **and** server-enforced on the plan-mutation endpoint (a `swapType: 'concierge'` PATCH is rejected **402** for non-entitled accounts). This closes the current gap where Concierge Swaps had no `isPremiumActive` check.

#### Light/dark
Standard sheet theming; `MacroDelta` uses jade/honey semantics in both themes; premium accents keep the honey `#E7B67C` "premium" micro-label.

---

### 6.4 Recipes — import, viewer, and the Recipe Book (now synced)

#### Purpose
Let users capture recipes from the wild (URL or pasted text), read them in a clean viewer, and keep a personal **Recipe Book** that follows them across devices (the redesign moves recipes from localStorage-only to backend-synced, closing a key data-loss gap).

#### 6.4.1 Recipe Book (Recipes sub-tab)
Layout:
- **Header** — "Recipe book", `13px` sage count "{n} saved". Top-bar action = **`Import`** (`Plus`).
- **`FilterChips`** — All · Imported · From plan · Favorites.
- **Recipe grid/list** — `RecipeCard`s: thumbnail (`FoodImage` / `MealGlyph`), title, macro chips, source badge (`URL import` / `From plan` / `Manual`), favorite heart (toggles `favorites`). Plan meals appear here as read-only "from plan" recipes; imported and manual recipes are editable/removable.
- **Sync footer** — `SyncChip` "synced" / "syncing…" / "saved offline".

**States:** Default grid · **Empty** ("no recipes yet — import one from a link or your plan will fill this in", primary `Import recipe`) · Loading skeleton grid · Error (retry) · Offline (renders cache, edits queue).

#### 6.4.2 Recipe import (`RecipeImportSheet`)
Generalizes today's YouTube-only importer into a multi-source importer.

- **Source tabs:** **Link** (any recipe/cooking URL, incl. YouTube) · **Paste text** (paste a recipe body) · **Photo** (snap a recipe card / cookbook page — reuses the AI photo pipeline from the logging section).
- **Link/paste flow:** input → **`Extract recipe`** → server-side LLM extraction returns `{title, servings, prepTime, ingredients[], instructions[], calories, protein, carbs, fat, sourceUrl}`. The current 5-step demo progress ("fetching…extracting…calculating nutrition…formatting") becomes real: fetch → parse/transcript → LLM structure → nutrition estimate → format. Nutrition is computed per serving (USDA lookups per ingredient where possible, LLM estimate otherwise, flagged as "estimated").
- **Review screen:** editable `title`, servings stepper, macro grid (`4-up`, editable), ingredient list (add/remove/edit rows), instruction steps (reorder/edit). Primary **`Save to book`** + **`Log now`** secondary + **`Try another`** ghost.

**States:** Input · **Validating** (bad/again URL → inline error "that doesn't look like a recipe link") · **Loading** (real progress checklist, jade check marks) · **Result/review** · **Error** (extraction failed → "we couldn't read that recipe. paste the text instead?" deep-links to Paste tab) · **Offline** (import requires network → disabled with "reconnect to import"; Paste-text extraction that's short can run a local heuristic fallback).

#### 6.4.3 Recipe viewer (`RecipeViewerSheet`)
Replaces the amber "book" skin with Verdant glass. Full-screen sheet:
- **Hero** — image or `MealGlyph`, title (`20px` weight 700), meta row (`⏱ {prepTime}m · {servings} servings · {source}`).
- **Macro grid** — 4-up duotone tiles (cal jade, P aqua, C honey, F rose), `tabular-nums`.
- **Ingredients** — bulleted, each with an **`Add to grocery`** affordance; **`Scale`** stepper (0.5×–4×) that live-rescales ingredient quantities and macros.
- **Instructions** — numbered steps with jade step chips; optional **cook mode** (keeps screen awake, large text, step-by-step).
- **Footer actions** — **`Log`** (jade, logs at current scale), **`Add to plan`** (choose day + slot; premium-independent), **`Favorite`**, **`Share`** (6.8), **`Edit`** (for owned recipes), overflow **`Delete`**.
- **Pager** — when opened from a list, `‹ ›` paging with dot indicators (retain the flip affordance, drop the skeuomorphic book).

**States:** Default · Loading (skeleton hero + rows) · Empty ("no recipes yet") · Error (failed to load a synced recipe → retry) · Offline (cache render; edits queue). Light/dark per tokens.

---

### 6.5 Grocery List

#### Purpose
Turn the week's plan into a de-duplicated, aisle-grouped shopping list the user can check off in-store, extend with custom items, and carry offline. Reachable from the Plans utility row and `/plans/grocery`.

#### Generation
- Aggregate ingredients across all planned meals (whole week by default; a **scope toggle** offers `This week` / `Selected day` / `Next 3 days`).
- Normalize quantities (strip leading `2 cups` / `6oz` / `1 tbsp` units), collapse duplicates with a **count badge** (`×3`), and drop pantry seasonings (salt, pepper, herbs) using `INGREDIENT_CATEGORIES.spices`.
- **Aisle grouping** (replaces emoji-prefixed labels with clean duotone section headers + a small aisle icon): Produce · Vegetables · Protein · Dairy · Grains · Nuts & oils · Pantry · Condiments · Other. Section headers are 10px uppercase micro-labels in sage with a hairline divider.

#### Layout (`GrocerySheet` / full route)
- **Header** — "Grocery list", progress subline "{checked} of {total} checked", scope toggle.
- **Progress bar** — thin `MacroBar`-style jade fill of checked ratio, `ring/orb fill` easing.
- **Sections** — each aisle group; each item is a `GroceryRow`: custom checkbox (jade fill + check when done), item name (strikethrough + `~55%` opacity when checked), count badge, and (for custom items) a remove `×`.
- **Add custom** — a persistent `AddItemRow` at the bottom of each section or a global **`+ Add item`** that lets the user type a name and pick an aisle; custom items persist in `groceryCustom[]` and survive plan regeneration.
- **Footer** — **`Clear checked`** ghost, **`Share list`** (6.8), **`Done`** primary. A **`Copy to clipboard`** / plain-text export is available for pasting into other apps.

#### Check-off & persistence
- Check state persists per item key in `groceryChecked` (already in context) and **syncs** with the plan so the list survives reloads and device changes. Regenerating the plan **preserves** custom items and re-diffs auto items (checked state kept for items that still appear).

#### States
| State | Behavior |
|---|---|
| **Default** | Grouped, checkable list with progress. |
| **Empty** | Duotone cart illustration: "no items yet — generate a plan and your list builds itself." + `Build my plan`. |
| **All checked** | Progress bar full jade + a mesh-burst micro-celebration; footer shows "list complete". |
| **Loading** | Section + row skeletons (rare; local compute). |
| **Offline** | Fully functional (local); check state queues to sync. |
| **Error (sync)** | Silent local success + `SyncChip` "saved offline"; retry on reconnect. |

#### Light/dark
Dark glass sections on mesh; light uses `surface-1` cards, deep `#0F9482` for the checkbox fill to hold AA contrast.

---

### 6.6 (reserved) — Plan ↔ log integration notes

The plan is not a silo: logging a meal from a `MealCard` writes to `dailyLog` (Home reflects it immediately via the shared macro state), sets meal status → `ate`, and increments streak logic where applicable. Home's "today's planned meals" module renders the **same** `MealCard` component filtered to today's remaining `planned` meals, so a log from either surface stays consistent. Skipping on the plan does **not** touch `dailyLog`.

---

### 6.7 Restaurant Mode (premium)

#### Purpose
When the user eats out, let them browse real chain menus, sort by what matters (protein, calories, macro quality), and log a menu item to a day in one tap — no manual macro entry. Premium-gated.

#### Layout (`RestaurantBrowser`, in-tab, dark)
Two levels:

**A. Chain browse (grid):**
- **Search bar** — "search restaurants…" (jade focus ring).
- **Category chips** — All · Fast casual · Fast food · Cafe · Grocery · Snacks (functional filters, not just search-string hacks like today).
- **Chain grid** (`2-col`) — `ChainCard`s: brand-colored logo tile (first-letter badge until real logos land), name, item count. `tap scale .97`.

**B. Menu (selected chain):**
- **Back** + chain header (logo tile + name).
- **Macro filter chips** (the four canonical filters): **Most protein** (`protein` desc) · **Lowest cal** (`calories` asc) · **Best macros** (protein-per-calorie desc) · **Balanced** (closest to a balanced P/C/F split — implement the currently-missing `balanced` sort as "minimize distance to a 30/40/30 kcal split"). Active chip = jade fill.
- **Item list** — `RestaurantItemCard`: name, macro chips (cal ink, P aqua, C honey, F rose), and **`Log`** jade button. Logging opens a tiny **`LogToDay`** popover: pick **day** (defaults to today) + **slot** (inferred from time), then writes to `dailyLog` (and, if a future day is chosen, adds it to that day's plan as a `swapped`/added entry). A **`Best pick`** ribbon flags the top item for the active filter.
- Optional **portion/side add-ons** where data supports it (e.g. add guac) recompute macros before logging.

#### States
| State | Behavior |
|---|---|
| **Default** | Chain grid. |
| **Chain selected** | Sorted menu with active macro filter. |
| **Empty menu** | "menu coming soon" `EmptyState` for chains without data. |
| **Search no-match** | "no restaurants match '{q}'" + clear. |
| **Loading** | Chain-tile + item-row skeletons (when menus move server-side, 6.9). |
| **Logged** | Toast "logged {item} from {chain}", `Log` → `Logged ✓`. |
| **Offline** | Static bundled menus still render; logging queues to sync. |
| **Error (remote menus)** | Fall back to bundled static data + `SyncChip` "showing saved menus". |
| **Not premium** | Tab shows the **premium lock state** (below) instead of the browser. |

#### Premium gating (lock state)
Free users see a `PremiumLockPanel` in the Restaurant sub-tab: honey-tinted `Lock` glyph, "Restaurant mode is premium", body "log real menu macros from 14+ chains, plus concierge swaps and voice logging.", primary **`Start free trial`** (48h) → `PremiumSheet`. Enforced client-side (`isPremiumActive()`, entitlement `restaurant_mode`) and server-side (restaurant menu/log-with-restaurant endpoints require the `restaurant_mode` entitlement, rejecting non-entitled accounts with **402**).

#### Light/dark
Dark glass on mesh (default); light uses `surface-1` cards + deep `#0F9482` interactive; brand tile colors are the chains' own and are exempt from the token palette (with a subtle hairline to keep them from clashing with the mesh).

---

### 6.8 Plan export / share (PDF & link)

#### Purpose
Let users take the plan out of the app — a printable PDF for the fridge, a read-only link to send a coach or partner. Closes the "no plan export/share" gap.

#### Entry
- **Share** action in the My plan overflow menu and in the Recipe viewer; **Share list** in Grocery.

#### `ShareSheet` options
| Option | Output | Gate |
|---|---|---|
| **Share link** | Server mints a tokenized, read-only URL `/share/plan/:shareId` (or `/share/recipe/:token`). Copy link + native share sheet. Revocable from Settings → Sharing. | Public |
| **Export PDF** | Server-rendered PDF: branded header, per-day meals with macros, weekly macro summary, and (optionally) the grocery list appended. Downloads as `plato-week-{date}.pdf`. | Public |
| **Share grocery list** | Plain-text or PDF of the checklist. | Public |

**Shared read-only view** (`/share/plan/:shareId`) uses the same tokens, no auth, a slim top bar ("shared from Plato"), no logging/edit actions, and a soft **`Get Plato`** CTA. Recipe share renders the viewer read-only.

#### States
Generating (spinner + "building your PDF…") · Ready (download/copy) · Error (retry) · Offline (share disabled with "reconnect to share"; local PDF generation may be offered as a fallback where feasible). Link revoked → shared page shows a friendly "this plan is no longer shared."

---

### 6.9 Backend sync — data model & endpoints

> **Superseded by §9.** §9 is the engineering source of truth for the data model and endpoints. The canonical persistence is a **JSON-blob model** — `meal_plans` (with `meals_json`), `saved_recipes`, and grocery state as `grocery_json` on the active plan — **not** the normalized relational tables sketched below. The `plans` / `plan_days` / `plan_meals` / `recipes` / `grocery_items` schemas here are **illustrative only** (they show the shape of the domain); where they differ from §9, §9 wins. Endpoints below are directional; the authoritative endpoint list also lives in §9.

Today meal plans and recipes are **localStorage-only** (`plato_plan`, `plato_recipes`, `plato_savedRecipes`, `plato_groceryChecked`) and lost on device change. The redesign keeps **localStorage as the offline source of truth** but adds authoritative backend sync with last-write-wins + `updatedAt` conflict handling, mirroring the existing log/profile sync pattern.

#### Data model (illustrative — see §9 for canonical JSON-blob model)

**`plans`**
```
id            uuid (pk)
user_id       uuid (fk → users)
name          text            -- e.g. "Week of Jul 8"
config        jsonb           -- snapshot of planConfig {goal,dietStyle,mealsPerDay,cookTime,cuisines[],restrictions}
calories      int             -- daily target
protein       int
carbs         int
fat           int
meals_per_day int
created_at    timestamptz
updated_at    timestamptz
is_active     bool            -- the currently-shown week
share_token   text nullable   -- for /share/plan/:shareId
```

**`plan_days`**
```
id        uuid (pk)
plan_id   uuid (fk → plans)
day_index int            -- 0..6
date      date nullable
```

**`plan_meals`**
```
id           uuid (pk)
plan_day_id  uuid (fk → plan_days)
slot_index   int
slot_label   text            -- Breakfast / Lunch / Dinner / Snack 1…
type         text            -- breakfast|lunch|dinner|snack
name         text
calories     int
protein      int
carbs        int
fat          int
ingredients  jsonb
instructions jsonb
status       text            -- planned|ate|skipped|swapped
swapped_from text nullable   -- original meal name when status=swapped
recipe_id    uuid nullable   -- link to a saved recipe
image_key    text nullable
```

**`recipes`**
```
id           uuid (pk)
user_id      uuid (fk → users)
title        text
source       text            -- url_import|paste|photo|plan|manual
source_url   text nullable
servings     int
prep_time    int
calories     int
protein      int
carbs        int
fat          int
ingredients  jsonb
instructions jsonb
is_favorite  bool
is_estimated bool            -- nutrition estimated vs. computed
share_token  text nullable
created_at   timestamptz
updated_at   timestamptz
```

**`grocery_items`**
```
id         uuid (pk)
user_id    uuid (fk → users)
plan_id    uuid nullable   -- null for custom items
name       text
aisle      text
count      int
is_custom  bool
is_checked bool
updated_at timestamptz
```

#### Endpoints (extend the existing Express API)

| Method & path | Purpose | Auth / gate |
|---|---|---|
| `POST /api/plans` | Create/generate a plan (persist a generated week). | Auth |
| `GET /api/plans` | List the user's plans (active + saved). | Auth |
| `GET /api/plans/:id` | Fetch a plan with days + meals. | Auth |
| `PUT /api/plans/:id` | Replace a plan (regenerate). | Auth |
| `PATCH /api/plans/:id/meals/:mealId` | Update a single meal (status, swap, edit). `swapType:'concierge'` ⇒ **entitlement-checked**. | Auth (+premium for concierge) |
| `DELETE /api/plans/:id` | Delete a saved plan. | Auth |
| `POST /api/plans/:id/share` | Mint `share_token`; returns share URL. | Auth |
| `DELETE /api/plans/:id/share` | Revoke share. | Auth |
| `GET /api/plans/:id/export.pdf` | Server-rendered PDF. | Auth |
| `GET /api/share/plan/:shareId` | Public read-only plan. | Public (token) |
| `POST /api/recipes` | Save a recipe. | Auth |
| `GET /api/recipes` | List saved recipes (filter by `source`, `favorite`). | Auth |
| `GET /api/recipes/:id` | Fetch a recipe. | Auth |
| `PUT /api/recipes/:id` | Edit a recipe. | Auth |
| `DELETE /api/recipes/:id` | Delete a recipe. | Auth |
| `POST /api/recipes/import` | Server-side URL/text → structured recipe + nutrition (LLM + USDA). | Auth |
| `POST /api/recipes/:id/share` / `GET /api/share/recipe/:token` | Share a recipe. | Auth / Public |
| `GET /api/grocery?planId=` | Fetch grocery items (auto + custom). | Auth |
| `POST /api/grocery` | Add a custom item. | Auth |
| `PATCH /api/grocery/:id` | Toggle checked / edit. | Auth |
| `DELETE /api/grocery/:id` | Remove a custom item. | Auth |
| `GET /api/restaurants` / `GET /api/restaurants/:id/menu` | Chain list + menu (moves static data server-side; still bundled as offline fallback). | Premium |

#### Sync semantics
- **Source of truth:** localStorage locally; server authoritative when online. On login/app-open, `GET /api/plans?active=1` + `GET /api/recipes` hydrate and reconcile against local by `updated_at` (last-write-wins; server wins ties). Guest (no auth) users stay fully local until they create an account, at which point local plan/recipes/grocery **migrate up** on first sync.
- **Writes:** optimistic local write → background `PUT/PATCH`; failures queue (reuse the offline log-queue pattern) and a `SyncChip` communicates state (`synced` / `syncing…` / `saved offline`).
- **Premium enforcement:** concierge swaps and restaurant endpoints validate entitlement server-side (**402** with an upsell payload if not entitled), so gating no longer depends on the client alone.

---

### 6.10 Premium gating summary (this tab)

| Feature | Free | Premium | Enforcement |
|---|---|---|---|
| Build / regenerate plan | ✅ | ✅ | — |
| One-tap log, skip, local shuffle swap | ✅ | ✅ | — |
| Recipe import / book / viewer (synced) | ✅ | ✅ | — |
| Grocery list | ✅ | ✅ | — |
| Plan / recipe export & share | ✅ | ✅ | — |
| **Concierge Swaps** | ✗ (shows upsell) | ✅ | client `isPremiumActive()` (`concierge_swaps`) + server 402 |
| **Restaurant Mode** | ✗ (lock panel) | ✅ | client tab-gate + server entitlement (`restaurant_mode`, 402) |

Trial: 48h from email capture (`startTrial`), countdown pill in the top bar; on expiry, Restaurant tab reverts to the lock panel and `Swap` reverts to the local shuffle, with data preserved.

---

### 6.11 Component inventory (defined in the component-library section)

`SegmentedTabs` · `DayPills` (with conic completion ring) · `MacroSummaryCard` · `MacroBar` · `MacroDelta` · `MealCard` (+ `AtePill` / `SkippedPill` / `SwappedPill`) · `MealGlyph` (duotone fallback) · `FoodImage` · `PlanConfigSheet` · `MacroPreview` · `PlanReveal` (3D) · `ConciergeSwapSheet` / `SwapCard` · `RecipeCard` · `RecipeImportSheet` · `RecipeViewerSheet` · `GrocerySheet` / `GroceryRow` / `AddItemRow` · `RestaurantBrowser` / `ChainCard` / `RestaurantItemCard` / `LogToDay` · `ShareSheet` · `PremiumSheet` / `PremiumLockPanel` · `LockBadge` · `SyncChip` · `EmptyState` · `ErrorCard` · skeleton variants (`MacroSummarySkeleton`, `MealCardSkeleton`, `SwapCardSkeleton`, `RecipeGridSkeleton`). All consume only the canonical Elevated Verdant tokens.


## 7. Tracking, profile & insights

The "You" area is Plato's system-of-record and its long-term retention engine. Where Home is the daily loop and Plans is the forward-looking scaffold, the You area is where the user sees *themselves* — who they are, what they're chasing, how far they've come, and what the data says about their trajectory. Every surface here is designed to reward continuity: the longer someone uses Plato, the richer and more personal these screens become. This section specs the six surfaces of the You area — **Profile & Stats**, **Weight Tracker**, **Water**, **Streaks**, **Achievements**, and **Insights/Trends** — plus the cross-cutting **analytics/event-tracking taxonomy** that instruments the entire product.

All surfaces are mobile-first, max content width 430px, dark theme by default, with full light-theme specifications. All copy is sentence case. All numerics use `tabular-nums`. All colors reference the canonical Elevated Verdant tokens — no new hexes are introduced anywhere in this section.

---

### 7.0 Information architecture & navigation

**Entry points.** The You area is the fifth item in the floating glass bottom nav (Home · Plans · [FAB +] · Explore · **You**). Tapping **You** lands on the **You hub** — a scrollable hub screen that replaces the old avatar → drawer pattern. The legacy drawer (Profile & Stats, Weight, Grocery, Achievements, Settings, Help) is dissolved into this hub plus Settings; the drawer no longer exists.

**Deep-link routes.** The canonical route table lives in §0.2 (single source of truth) — `/you`, `/you/weight`, `/you/insights`, `/you/achievements`, `/you/settings`, `/you/billing`, `/you/account` are defined there. The You area adds these surface-specific child routes (all under the `/you/*` tree — no drawer, per §0.1); every surface has a stable URL for shareability, browser back/forward, and analytics attribution:

| Surface | Route | Notes |
|---|---|---|
| You hub | `/you` | Landing screen for the tab (see §0.2 canonical route table) |
| Profile & Stats | `/you/profile` | Identity, goals, editable targets, plan config |
| Weight Tracker | `/you/weight` | Entries, trend, goal, projection |
| Water | Home widget + `/you/water` detail | Quick-add on Home; full history on detail |
| Streaks | `/you/streaks` | Current + longest, heatmap |
| Achievements | `/you/achievements` | Milestone grid, progress, unlock history |
| Insights/Trends | `/you/insights` | Weekly/monthly analytics |
| Settings | `/you/settings` | Account, billing, preferences (spec'd elsewhere) |

**You hub layout (bento).** A vertical bento stack inside the 430px column, top bar title "You", contextual action = Settings gear (routes to `/you/settings`).

1. **Identity header card** (full-width, radius 22): avatar (radius 13), name, goal label, premium status pill (Free / Trial · countdown / Premium). Tap → `/you/profile`.
2. **Stat strip** (3 tiles, radius 20): current weight, current streak, achievements unlocked (`n/total`). Each tile taps into its surface.
3. **Weight tile** (large tile, radius 20): sparkline of last 30 days + delta vs goal. Tap → `/you/weight`.
4. **Streak tile** (radius 20): flame glyph, current streak number, mini 7-day dot row. Tap → `/you/streaks`.
5. **Insights promo tile** (radius 20): "Your week in review" with one headline stat (e.g. "protein adherence 86%"). Tap → `/you/insights`.
6. **Achievements tile** (radius 20): most-recent unlocked badge + next-up progress ring. Tap → `/you/achievements`.
7. **Settings row** (list item): "Settings & account" → `/you/settings`.

Bottom safe-area pad 104px to clear floating nav. Cards use the glassmorphism recipe (glass fill, 1px glass border, `backdrop-filter: blur(16px)`, inset highlight + soft drop shadow). Section entrance staggers 60ms/item with `ease-out`; honor `prefers-reduced-motion` (no float/parallax).

**You hub — all states.**

- **Default:** all tiles populated from local state (localStorage source of truth), reconciled with backend on focus.
- **New user (no history):** stat strip shows starting weight or `—`, streak 0, achievements `0/n`. Weight tile shows the fluid duotone empty illustration with "log your first weigh-in". Insights tile shows "come back after a few days of logging — we'll surface your trends here." Achievements tile shows the first locked milestone with progress 0.
- **Loading/skeleton:** each tile renders a shimmer skeleton (surface-2 base with a jade-tinted sweep). Skeleton preserves final tile height to prevent layout shift.
- **Error (backend unreachable):** hub still renders from localStorage; a dismissible hairline banner reads "showing your last saved data — we'll sync when you're back online." No blocking spinner.
- **Offline:** identical to error state; an offline chip (info aqua `#5FD4C4` dot) sits in the top bar. All reads served from cache; writes queue (see 7.8).

---

### 7.1 Profile & Stats (`/you/profile`)

**Purpose.** The user's identity and the control panel for everything that drives their plan: personal stats, primary goal, and the editable macro/calorie targets. Editing here is the single lever that recomputes the plan and every downstream ring, bar, and projection. This surface must make "who am I / what am I aiming for / can I change it" answerable in one glance and adjustable in two taps.

**Layout (bento, top → bottom).**

1. **Identity header** (radius 22, glass): avatar (radius 13, tap to change photo), display name (27 screen-title weight), goal label as a pill (jade tint), member-since caption (11 caption, muted). Edit pencil (IconButton) top-right → inline edit mode for name/avatar.
2. **Body stats card** (radius 22): a 2-column grid of stat rows — age, height, current weight, gender, activity level. Each row: micro-label (10px uppercase, `.16em`, sage) + value (15 body, ink, tabular-nums). Row-level tap opens the field stepper/sheet.
3. **Goal & targets card** (radius 22): the heart of the screen.
   - **Primary goal** selector: segmented control (lose fat · maintain · build muscle · athletic). Changing it triggers target recompute.
   - **Daily targets** block: calorie target (hero stat 30px, 800 weight, `-.03em`, jade) + three macro target rows (protein / carbs / fat) each with a value in grams and a % of calories. Macro colors: protein aqua `#5FD4C4`, carbs honey `#E7B67C`, fat rose `#E1A0AB`; calories jade `#43C6AC`.
   - **Edit targets** button (full-width control, radius 16): opens **Editable Targets sheet** (below).
4. **Plan config card** (radius 22): read-and-edit summary of `planConfig` — training type, training days/week, diet style, meals/day, cook time, cuisines, restrictions. Each is a chip row; tapping "adjust plan" (control) opens the plan-config sheet which mirrors onboarding steps 2–3 in the unified dark theme. Saving here re-runs plan generation (Plan Reveal 3D moment fires if macros change materially).
5. **Danger/account row:** links out to `/you/settings` for sign-out, delete account, export data.

**Editable Targets sheet (signature interaction).** Slide-up glass sheet (blur 24px), radius 22 top corners.

- Two modes toggled by a segmented control at the top:
  - **Auto (recommended):** targets computed via Mifflin-St Jeor BMR × activity × goal delta. Fields are read-only, shown with a jade "auto" chip. A single "recalculate from my stats" action.
  - **Custom:** user overrides. Calorie target is a large stepper (±10 / ±50 long-press). Macro split is set either by grams (three steppers) or by percentage (three sliders that sum to 100%). A live ring preview at the top of the sheet animates as values change (ring/orb fill 800ms decelerate). Calories and grams stay reconciled: 4/4/9 kcal per g of protein/carb/fat; if the user edits grams, calories update, and a subtle "derived" note appears.
- **Validation:** macro percentages must sum to 100 (±rounding); calorie floor guard (warn, don't block, below a safe threshold using warning honey `#E7B67C`, message "this is below a typical safe minimum — double-check with a professional"). Protein/carb/fat can't go negative.
- **Save** applies immediately to state, persists to localStorage, PUTs `/api/profile`, and fires `targets_edited` analytics. Toast confirms "targets updated." Home ring and macro bars re-tween on next paint.

**Components used.** `IdentityHeaderCard`, `StatRow`, `SegmentedControl`, `HeroStat`, `MacroTargetRow`, `ChipRow`, `SlideUpSheet`, `Stepper`, `PercentSlider`, `RingPreview`, `Toast`, `Button`, `IconButton`.

**Key interactions.** Row tap → field editor; goal change → recompute + Plan Reveal (if material); custom target edit → live ring preview; save → optimistic apply + queued sync.

**All states.**

- **Default:** fully populated from `userProfile` + `planConfig`.
- **Empty / partial profile:** if onboarding was skipped, missing fields render as "add" affordances (dashed hairline outline, "add your height"). Targets card shows an estimate with a "finish setup for a personalized target" nudge.
- **Loading/skeleton:** stat rows and target values shimmer; segmented controls render inert until hydrated.
- **Saving:** the specific field/sheet shows an inline micro-spinner on the Save control; the rest of the screen stays interactive (never block the UI). If the network PUT is slow, save is already applied locally — a 4s AbortController timeout guards the request and the queue takes over on failure.
- **Error:** if PUT fails, keep the optimistic local value, show a hairline "saved on this device — will sync later" note; retry on reconnect.
- **Offline:** all edits apply locally and queue; "adjust plan" that requires regeneration still runs locally (macros are computed client-side via Mifflin-St Jeor).
- **Over-target context:** N/A here (this is where targets are *set*).

**Light + dark.**

- **Dark:** page base `#070D0C` under signature mesh; cards use glass fill `rgba(16,26,22,.50)`, glass border `rgba(160,215,200,.12)`; primary interactive = jade `#43C6AC`; text ink `#EAF1EF` / sage `#94A9A3` / muted `#5F726D`.
- **Light:** page base `#F3F7F4`; cards surface-1 `#FFFFFF` / glass fill `rgba(255,255,255,.62)`, border `rgba(12,58,50,.08)`; primary interactive uses deep `#0F9482` for AA contrast; text `#0E1614` / `#48605A` / `#7E938C`. Mesh is omitted or reduced to a faint tint on light.

**Premium gating.** None on Profile itself. Editing custom macro targets is free (it's core). The "adjust plan → regenerate" flow is free; premium-only *concierge swaps* surface inside Plans, not here.

---

### 7.2 Weight Tracker (`/you/weight`)

**Purpose.** Turn a scale number into a story: log weigh-ins with optional notes, see the smoothed trend (not the daily noise), track toward a goal weight, and get an honest, non-preachy projection of arrival. This is a primary retention surface — the trend line is the payoff for logging consistency.

**Layout (bento, top → bottom).**

1. **Header stat block** (radius 22, glass): current weight (hero stat 34px, 800 weight, jade), delta chip vs last entry and vs goal (green jade `#43C6AC` for progress toward goal, rose-red `#E1616C` only when moving away from goal — never moralizing, just directional). Unit toggle (lb/kg) top-right.
2. **Trend chart card** (radius 22): the signature data-viz.
   - X = time, Y = weight. Raw entries as small dots (sage, low opacity); the **smoothed trend line** (7-day moving average) as the emphasized jade `#43C6AC` stroke, 2px, with a soft under-fill gradient `linear-gradient(180deg, rgba(67,198,172,.18), rgba(67,198,172,0))`.
   - **Goal line:** a dashed horizontal line at goal weight (honey `#E7B67C`, `.5` opacity) labeled "goal".
   - **Range selector:** segmented control (1M · 3M · 6M · 1Y · all). Default 3M.
   - **Projection:** a faint dotted continuation of the trend to the goal line, ending in a small "~est. Aug 12" flag (info aqua `#5FD4C4`), computed from the current smoothed rate. Copy is careful: "at your recent pace" — never a promise.
   - Scrubbing horizontally reveals a tooltip: date, logged weight, note snippet.
3. **Goal weight card** (radius 20): goal weight value + "to go" (remaining delta) + a slim progress bar (start weight → goal, fill = progress). Edit goal via inline stepper sheet.
4. **Entries list** (radius 22): reverse-chronological rows. Each row: date, weight (tabular-nums), delta vs previous (tiny arrow + value), and a note preview if present. Row tap → entry detail sheet (edit weight, edit note, delete). Swipe-left reveals delete.
5. **Log FAB / add button:** a pill button "log weight" pinned above the entries or as a section-local FAB (radius 21) → **Add weigh-in sheet**.

**Add weigh-in sheet.** Slide-up glass. Large weight stepper (defaults to last entry ± ), date picker (defaults today), optional note field ("how you felt, context — optional"), unit respected. Save → optimistic insert, list animates the new row in (stagger), chart re-tweens the trend. Fires `weight_logged` (with `has_note` boolean, source).

**Components used.** `HeroStat`, `DeltaChip`, `TrendChart`, `RangeSegmentedControl`, `GoalProgressBar`, `EntryRow`, `SwipeAction`, `SlideUpSheet`, `Stepper`, `NoteField`, `UnitToggle`, `EmptyIllustration`.

**Key interactions.** Log → optimistic insert + re-tween; scrub chart → tooltip; edit/delete via row sheet + swipe; change range → chart animates axis; change goal → projection recomputes.

**All states.**

- **Default:** ≥2 entries → full trend + projection.
- **Single entry:** show the dot and current weight, but suppress the trend line and projection; caption "log a few more to see your trend." Goal card active.
- **Empty (no entries):** fluid duotone empty illustration (a rising jade curve motif), headline "start your weight journey", body "log your first weigh-in and watch your trend take shape", primary "log weight". No chart chrome rendered.
- **No goal set:** goal card shows "set a goal weight" affordance; projection hidden until goal exists.
- **Loading/skeleton:** chart area shimmers as a rounded block; entry rows shimmer.
- **Error:** if `GET /api/weight` fails, render from localStorage cache + hairline sync banner. If `POST /api/weight` fails, the entry stays locally and queues; row shows a subtle "pending sync" dot (muted) until confirmed.
- **Offline:** full read/write from cache + queue; projection still computes locally.
- **Over-target / regression context:** if the trend moves away from goal, the delta chip uses rose-red `#E1616C` but copy stays neutral ("+0.6 lb this week") — no shaming, ever. Optional gentle insight surfaces only on Insights, not here.

**Light + dark.** Chart strokes/fills identical hues in both themes (brand ramp is theme-invariant). Dark: dots sage `#94A9A3` @ low opacity on dark surface; grid hairlines `rgba(160,205,190,.09)`. Light: dots `#7E938C`; grid hairlines `rgba(12,58,50,.10)`; trend line stays jade `#43C6AC` but interactive controls use deep `#0F9482`.

**Premium gating.** Core weight logging + trend + projection are free. (Advanced multi-metric body composition, if ever added, would be premium — out of scope here.)

---

### 7.3 Water (Home widget + `/you/water` detail)

**Purpose.** Make hydration a frictionless one-tap habit with a real, personal target — closing the current gap where water tracking has no goal. Water lives primarily as a Home widget (quick +glass) with a full detail/history screen for those who care.

**Hydration goal/target.** Every user gets a target. The default goal is **2000 ml (8 × 250 ml cups)** — matching the DB default `water_goal_ml INTEGER DEFAULT 2000`. It is expressed in glasses (8 × 250 ml) with a unit setting (glasses / ml / fl oz), and is editable in the detail screen and in Settings. Copy avoids medical claims: "a simple daily target — adjust to what works for you."

**Home water widget (large tile, radius 20).**

- Left: a **liquid-fill glyph** — a rounded vessel that fills with a jade `#43C6AC` → mint `#8CE0CE` gradient as intake rises toward target; a subtle wave animation on fill (respect reduced-motion → static fill level).
- Center: "3 of 8 glasses" (15 body, tabular-nums) + micro-label "hydration".
- Right: a large **+glass** button (FAB-style, radius 21, tap scale .97). Long-press → quick menu (+½ glass, custom ml, log a bottle). Each tap animates a droplet into the vessel + haptic tick.
- On reaching target: a brief mint burst + "target reached — nice." (mesh burst micro-celebration, not the full milestone moment).
- Tap the tile body → `/you/water` detail.

**Water detail screen (`/you/water`).**

1. **Today ring** (radius 22): a circular progress ring (jade→mint) showing today's intake vs target, center = "3 / 8". Quick-add row below (+glass, +½, custom).
2. **Target card** (radius 20): current target (default 2000 ml / 8 × 250 ml cups) + "edit target" (stepper sheet, unit-aware).
3. **Weekly bar chart** (radius 22): 7 bars, each day's intake vs target line; days at/over target filled jade, under-target filled sage at lower opacity. Micro-labels for weekdays.
4. **History list** (radius 20): per-day totals with target-met checkmark.

**Components used.** `LiquidFillGlyph`, `QuickAddButton`, `ProgressRing`, `WeeklyBarChart`, `TargetCard`, `Stepper`, `SlideUpSheet`, `Toast`.

**Key interactions.** +glass (optimistic increment, droplet anim, haptic); long-press quick menu; edit target; day tap → adjust that day's count (correction sheet). All writes optimistic + queued.

**All states.**

- **Default:** widget shows progress; detail shows ring + week.
- **Empty (0 today):** vessel empty, "start hydrating — tap +"; detail ring at 0.
- **At target:** vessel full, mint tint, "target reached" state persists for the day.
- **Over target:** vessel stays full (no negative framing); count shows actual ("10 of 8") with a subtle mint "over" chip — over is fine, never an error color.
- **Loading/skeleton:** vessel and count shimmer; week bars shimmer.
- **Error:** `POST /api/water` failure → local increment holds, queues, "pending sync" dot.
- **Offline:** full local increment + queue.

**Light + dark.** Vessel gradient jade→mint identical in both. Dark: vessel outline `rgba(160,215,200,.12)`, empty fill base-2 `#0A1210`. Light: vessel outline `rgba(12,58,50,.08)`, empty fill surface-3 `#EEF3F0`; +glass button uses deep `#0F9482` fill for contrast.

**Premium gating.** None — hydration is free.

---

### 7.4 Streaks (`/you/streaks`)

**Purpose.** Streaks are Plato's core habit-loop reward. This surface makes the streak feel earned and worth protecting: current streak, longest streak (personal best), and a calendar heatmap that visualizes consistency at a glance. A streak counts a day as "logged" when the user logs at least one meal (definition surfaced plainly so it never feels arbitrary).

**Layout (bento).**

1. **Streak hero** (radius 22, glass, signature): a large animated **flame/orb** glyph (CSS depth by default; the full mesh burst fires on milestone streak days). Current streak number as hero stat (34px, 800, jade), label "day streak". Below: "longest: 21 days" (secondary). A "streak rule" micro-label link → tiny popover explaining what keeps a streak alive.
2. **Freeze / protect indicator** (optional, radius 20): if streak-freeze tokens exist (habit-preserving mechanic), show remaining freezes as pips. If a day was missed but auto-frozen, show it distinctly on the heatmap.
3. **Calendar heatmap** (radius 22): a month grid (with month paging) where each day cell is colored by logging completeness:
   - Fully logged (met calorie + all-macro logging, or ≥ target meals): **jade `#43C6AC`** at full intensity.
   - Partially logged: a lighter jade / sage blend at reduced opacity.
   - Logged minimally (≥1 meal, streak-preserving): faint jade.
   - Not logged: empty cell (surface-2 fill, hairline border).
   - Today: ring outline in jade.
   - A small legend row explains the intensity scale. Cell tap → that day's summary (routes to Home for that date, or a read-only day sheet).
4. **Milestone strip** (radius 20): upcoming streak milestones (7 / 14 / 30 / 60 / 100 days) as chips with the next one showing "3 days to go".

**Components used.** `StreakOrb`, `HeroStat`, `HeatmapCalendar`, `HeatmapLegend`, `MonthPager`, `FreezePips`, `MilestoneChipRow`, `Popover`.

**Key interactions.** Month paging (swipe or arrows); cell tap → day detail; milestone approach animates the orb; hitting a streak milestone triggers the celebration (shared with Achievements, 7.5).

**All states.**

- **Default:** current + longest + populated heatmap.
- **Zero streak / new user:** orb in a dim "unlit" state, "start your streak — log a meal today"; heatmap mostly empty with today highlighted; longest shows "—" until a first streak forms.
- **Streak broken (just lost):** on first view after a break, a gentle, non-punitive state: "your 12-day streak ended — start a new one today." The previous longest is preserved and celebrated ("your best is still 21"). Never shame.
- **Loading/skeleton:** orb placeholder pulse; heatmap grid shimmer.
- **Error/offline:** `GET /api/streak` failure → compute streak locally from cached `dailyLog` history; hairline sync note. Local computation is authoritative for display; server reconciles.
- **Over-target:** N/A.

**Light + dark.** Heatmap intensity ramp uses the brand ramp in both themes. Dark: empty cell surface-2 `#121C19`, hairline `rgba(160,205,190,.09)`, lit cells jade `#43C6AC`. Light: empty cell surface-3 `#EEF3F0`, hairline `rgba(12,58,50,.10)`, lit cells jade `#43C6AC` (unchanged); today ring uses deep `#0F9482` on light. Orb glow reduced on light; reduced-motion disables orb animation entirely (static lit glyph).

**Premium gating.** None — streaks are free and core to retention.

---

### 7.5 Achievements (`/you/achievements`)

**Purpose.** A structured milestone system that gives users a sense of progression and a reason to return. Unlocking an achievement is a **signature celebration moment** — the emotional peak of the app, using the mesh burst + haptic-timed motion. Achievements convert diffuse "I'm doing well" feelings into concrete, shareable trophies.

**Milestone system (taxonomy of achievements).** Grouped into families; each has tiers where sensible. All titles/descriptions in sentence case.

| Family | Examples | Trigger |
|---|---|---|
| Streaks | "first day", "one week", "two weeks", "30-day", "100-day" | Streak length reached |
| Logging consistency | "50 meals logged", "500 logged", "perfect week" (7/7 days logged) | Cumulative / windowed logging |
| Macro adherence | "protein pro" (hit protein target 7 days), "balanced week" (all macros within band) | Adherence over a window |
| Weight journey | "first weigh-in", "trend trender" (14 weigh-ins), "goal reached" | Weight events / goal hit |
| Hydration | "hydrated" (target 7 days), "wave rider" (30 days) | Water target streaks |
| Exploration | "planned it" (first meal plan), "voice logger" (first voice log), "scanned it" (first barcode/photo log) | Feature first-use |
| Milestone | "goal weight reached", "trial → premium" | Major life-of-account events |

**Layout (bento).**

1. **Progress header** (radius 22, glass): "12 of 30 unlocked" hero stat + a slim overall progress bar (jade fill). Most-recent unlock badge shown large with its date.
2. **Next up card** (radius 20): the 1–3 closest-to-unlocking achievements, each with a progress ring/bar ("4 of 7 days"). This is the pull-forward hook.
3. **Achievement grid** (radius 22 container; tiles radius 20): a responsive grid of badge tiles.
   - **Unlocked tile:** full-color duotone badge (family-tinted using macro/semantic colors — e.g. protein family aqua `#5FD4C4`, streak family jade `#43C6AC`, weight family honey `#E7B67C`), title, unlock date. Subtle sheen.
   - **Locked tile:** desaturated/greyed badge (sage on surface), title, and a progress hint if in progress ("2/7"). Fully-hidden "secret" achievements show a "?" silhouette with no spoiler.
   - Tap any tile → **Achievement detail sheet**: large badge, description, how-to-earn, progress, unlock date (if earned), and a **share** action (generates a shareable card image / deep link, per share-links spec).

**Unlock celebration (signature moment).** When an achievement fires:

- A full-bleed **mesh burst** overlay: layered radial gradients bloom from center in the brand ramp (jade `#43C6AC` core → mint `#8CE0CE` edges, with a warm honey `#E7B67C` counterpoint fleck), particles rise and fade.
- The badge scales in with spring (stiffness 320 / damping 30), settling with a sheen sweep.
- **Haptic-timed motion:** a haptic impact lands on the badge "snap-in" (dur-base 240ms), a lighter tick as particles peak.
- Copy: "unlocked: one week streak" + short flavor line ("seven days strong — this is how habits stick").
- Actions: "share" (primary), "keep going" (dismiss). Auto-dismiss after ~4s if untouched.
- Fires `achievement_unlocked` analytics with `achievement_id`, `family`, `tier`.
- **Queueing:** if multiple unlock at once, they present sequentially (or a "3 unlocked!" summary card that expands). Never stack overlapping bursts.
- **Reduced-motion / low-power:** replace the mesh burst with a static badge scale-in + a single haptic; no particles, no continuous animation. Respect `prefers-reduced-motion` and low-power mode.

**Components used.** `ProgressHeader`, `NextUpCard`, `AchievementGrid`, `BadgeTile`, `AchievementDetailSheet`, `MeshBurstOverlay`, `ShareCard`, `ProgressRing`, `ProgressBar`.

**Key interactions.** Tile tap → detail; unlock → celebration overlay; share → generates card/link; next-up progress updates live as underlying events accrue.

**All states.**

- **Default:** mixed unlocked/locked grid.
- **Empty (brand-new account):** all locked; header "0 of 30 — your first badge is one meal away"; next-up features "first day" and "first weigh-in". Encouraging, not barren.
- **All unlocked:** header "all unlocked — you've done it" with a special completion badge state; grid fully lit.
- **Loading/skeleton:** grid tiles shimmer; header stat shimmers.
- **Error/offline:** achievements are computed client-side from cached history, so the grid renders offline; only the *share* action (which mints a link) is disabled offline with a "connect to share" note. Unlock celebrations still fire locally; `achievement_unlocked` events queue.
- **Over-target:** N/A.

**Light + dark.** Badge duotone families keep their hues in both themes. Dark: locked tiles use surface-2 `#121C19` with sage `#94A9A3` iconography; unlocked tiles glow via inset highlight + soft shadow. Light: locked tiles surface-3 `#EEF3F0` with muted `#7E938C`; unlocked tiles keep brand-ramp fills; the mesh burst overlay on light uses the same ramp at slightly higher opacity over a `rgba(255,255,255,.62)` scrim so it reads on a bright background.

**Premium gating.** Earning and viewing achievements is free. A small set of "premium journey" badges (e.g. "restaurant explorer", "concierge swap") are only *earnable* by using premium features, but they're visible-locked to everyone (a gentle upsell surface, not paywalled UI).

---

### 7.6 Insights / Trends (`/you/insights`)

**Purpose.** The analytical payoff of consistent logging: weekly/monthly views of macro adherence, calorie trend, and the weight-vs-intake correlation. This is where Plato earns its "coach" positioning — surfacing honest, specific, non-preachy patterns the user can't see day-to-day. It's also a strong premium-adjacent surface: deep history is a natural upgrade lever.

**Layout (bento, top → bottom).**

1. **Period switcher** (segmented control, radius full): week · month (· quarter · year for premium `insights_pro`). Default week. **Current week and current month are free**; the quarter/year periods and paging back through deeper history are `insights_pro`. A date-range stepper lets the user page back — recent history is free, deep history is gated.
2. **Headline card** (radius 22, glass): the single most important insight for the period, auto-selected. E.g. "you hit your protein target 6 of 7 days" or "your calorie intake trended 8% below target — you're in a steady deficit." One sentence, plain, tabular-nums for figures. Sentiment color is directional not moral (jade for on-track, honey for drifting, aqua for neutral/informational).
3. **Macro adherence chart** (radius 22): for the period, per-macro adherence.
   - Layout: three horizontal "adherence bars" (protein aqua `#5FD4C4`, carbs honey `#E7B67C`, fat rose `#E1A0AB`) each showing % of days within the target band, plus a small sparkline of daily attainment. Calories get their own jade `#43C6AC` row.
   - Under-band vs over-band is shown as split shading within each bar so the user sees *direction* of miss, not just a score.
4. **Calorie trend chart** (radius 22): a line/area chart of daily calories vs the target line across the period. Target line = honey `#E7B67C` dashed. Actual = jade `#43C6AC` line with under-fill gradient. Days over target shaded lightly rose; days under shaded lightly jade. Weekly average callout.
5. **Weight-vs-intake correlation card** (radius 22, `insights_pro`): the flagship insight, a premium-depth analysis. A dual-axis chart:
   - Left axis = weight (smoothed trend, jade line, reusing the Weight Tracker trend).
   - Right axis = rolling average calorie intake (aqua `#5FD4C4` line).
   - Overlaid so the user can *see* the relationship (e.g. "as intake averaged ~2,100, weight trended down ~0.4 lb/wk").
   - A plain-language readout beneath: "over the last 30 days, your average intake of 2,140 kcal lined up with a downward weight trend of about 0.4 lb per week." Explicitly framed as correlation/observation, never medical advice.
6. **Consistency & streak mini-cards** (radius 20, 2-up): logging consistency (% of days logged this period) + best streak in period.
7. **Insight list** (radius 20): 2–4 additional auto-generated observations as list rows with a small family icon (e.g. "your protein was highest on strength-training days", "weekends run ~300 kcal over target"). Each is derived from the period's data, phrased neutrally.

**Chart styling (token system).** All charts share one visual language:

- Axes/gridlines: hairline `rgba(160,205,190,.09)` (dark) / `rgba(12,58,50,.10)` (light); no heavy grids.
- Series colors strictly from the macro/semantic palette (calories jade `#43C6AC`, protein aqua `#5FD4C4`, carbs honey `#E7B67C`, fat rose `#E1A0AB`, weight jade line, intake aqua line).
- Fills: same-family vertical gradients fading to transparent (e.g. `linear-gradient(180deg, rgba(67,198,172,.18), rgba(67,198,172,0))`).
- Target/reference lines: dashed, honey `#E7B67C`, `.5` opacity.
- Tooltips/scrub: glass mini-card (blur 16px) with tabular-nums.
- Radii on chart cards 22; internal plot area radius 16. Numerics tabular-nums, hero figures 800 weight `-.03em`.
- Entrance: series draw-on animation `ease-out` dur-slow (420ms), staggered 60ms; bars fill decelerating; reduced-motion → instant render.

**Components used.** `PeriodSegmentedControl`, `DateRangePager`, `HeadlineInsightCard`, `MacroAdherenceChart`, `CalorieTrendChart`, `DualAxisCorrelationChart`, `MiniStatCard`, `InsightRow`, `ChartTooltip`, `PremiumLock`.

**Key interactions.** Switch period → all charts re-tween; page date range; scrub any chart → synced tooltip; tap an insight row → expands with the underlying mini-chart; tap a locked premium period → paywall.

**All states.**

- **Default:** ≥7 days of data → full week view; ≥28 days → month view unlocked with data.
- **Insufficient data:** if a chart lacks enough points (e.g. <2 weigh-ins for correlation), that card shows an inline "log a few more days to unlock this insight" state with the fluid duotone empty motif, while other cards render normally.
- **Empty (new user):** whole screen shows the empty illustration + "your insights are brewing" + "keep logging — trends appear after a few days." No half-broken charts.
- **Loading/skeleton:** each chart card renders a rounded shimmer block sized to its final height; headline card shows a shimmer line.
- **Error:** insights compute from cached `dailyLog` + weight/water history client-side, so they render offline; if a server-side aggregation (future) fails, fall back to local computation + hairline note.
- **Offline:** full local computation; only sharing/export disabled.
- **Over-target:** over-target days are shown in the calorie/macro charts with light rose shading and honey callouts — informational, never an error state or scold.

**Light + dark.** Series hues theme-invariant. Dark: plot backgrounds transparent over base `#070D0C` + mesh (mesh dimmed behind charts for legibility); gridlines `rgba(160,205,190,.09)`. Light: plot backgrounds on surface-1 `#FFFFFF`; gridlines `rgba(12,58,50,.10)`; interactive controls deep `#0F9482`; fills reduced ~20% opacity so pastel series stay legible on white.

**Premium gating (`insights_pro`).** Insights is **free for the current week + current month** — only *depth* is Plato Plus (per §0.4). Handled generously (never crippling core value):

- **Free:** current-week and current-month insights in full — headline, macro adherence chart, calorie trend chart, and consistency/streak mini-cards.
- **Plus (`insights_pro`):** longer history (paging back beyond the current week/month), the **quarter** and **year** periods, the weight-vs-intake **correlation** card, month-over-month comparison overlays, and CSV/PDF **export**. Locked cards show a `PremiumLock` treatment — the chart is blurred/greyed with a jade "unlock your full history" pill → paywall. Never fully hide that the data exists; show the shape, gate the depth. Gating rejection is **HTTP 402**. Fires `paywall_shown` with `source: 'insights'`.

---

### 7.7 Cross-surface behaviors

- **Units:** a single unit preference (weight lb/kg, volume glasses/ml/fl oz, energy kcal) set in Settings applies across Profile, Weight, Water, and Insights. Changing units re-renders all figures without data loss (stored canonically in metric).
- **Optimistic writes everywhere:** every log/edit applies to local state immediately and never blocks the UI on the network (guarded by a short AbortController timeout; failures fall to the offline queue).
- **Reduced-motion & low-power:** disable orb/flame animation, mesh bursts (→ static), chart draw-on (→ instant), water wave, and parallax. All are additive polish, never load-bearing.
- **Accessibility:** all charts have a non-visual equivalent — a "view as data" toggle exposes an accessible table; color is never the sole signal (icons/labels accompany semantic colors); tap targets ≥ 44px; `tabular-nums` for scannable alignment; AA contrast (light uses deep `#0F9482` for interactive).
- **Empty-state consistency:** all empty states use the fluid duotone illustration system with a single primary CTA that routes to the relevant logging action.

---

### 7.8 Offline & sync model (You area)

localStorage is the source of truth; the backend reconciles. Relevant endpoints: `GET/PUT /api/profile`, `POST/GET /api/weight`, `POST/GET /api/water`, `GET /api/streak`. (Meal-plan/recipe sync is spec'd elsewhere; here we cover profile, weight, water, streak, and the new analytics pipeline.)

| Surface | Read | Write | Offline behavior |
|---|---|---|---|
| Profile & targets | localStorage → reconcile `GET /api/profile` | optimistic → `PUT /api/profile` (4s timeout) | edits queue; local Mifflin-St Jeor recompute works offline |
| Weight | cache → `GET /api/weight` | optimistic insert → `POST /api/weight` | entry held locally + "pending sync" dot; trend/projection local |
| Water | cache → `GET /api/water` | optimistic increment → `POST /api/water` | increments queue; default target 2000 ml applies offline |
| Streaks | local compute from `dailyLog` → reconcile `GET /api/streak` | n/a (derived) | fully local; server reconciles |
| Achievements | local compute from cached history | n/a (derived) | unlocks fire locally; celebrations local; share disabled offline |
| Insights | local compute from cached logs | n/a | fully local; export/share disabled offline |

Write queue: a persisted `plato_offline_log_queue`-style structure drains on reconnect with conflict resolution = last-write-wins per record keyed by timestamp; failed drains retry with backoff. A single top-bar offline chip communicates state; no blocking modals.

---

### 7.9 Analytics / event-tracking taxonomy

Plato ships **no analytics today** — this section defines the full taxonomy so engagement, conversion, and churn are measurable from day one. Events are captured client-side and posted (batched, best-effort, non-blocking) to a new `POST /api/analytics/events` endpoint; they also queue offline and drain with the sync model. Events must never block or slow the UI. Respect a user consent/opt-out flag (privacy setting in Settings); when opted out, only anonymous, non-identifying counts (if any) are kept, or nothing.

**Common envelope (every event).**

| Field | Description |
|---|---|
| `event` | snake_case event name (from tables below) |
| `ts` | client timestamp (ISO) |
| `session_id` | rotating session identifier |
| `user_id` | if signed in (else anonymous device id) |
| `premium_status` | `free` \| `trial` \| `premium` |
| `platform` | `pwa` / `web` |
| `app_version` | build ref |
| `route` | current deep-link route (e.g. `/you/insights`) |
| `props` | event-specific payload (typed per event) |

**Engagement events.**

| Event | Key props | Purpose |
|---|---|---|
| `app_opened` | `cold_start`, `days_since_last_open` | DAU/retention, resurrection |
| `screen_viewed` | `route`, `referrer_route` | Funnel & surface popularity |
| `meal_logged` | `source` (`search`/`quick`/`voice`/`barcode`/`photo`/`plan`), `meal_type`, `calories`, `has_macros` | Core loop; the north-star action |
| `meal_edited` / `meal_deleted` | `source` | Log quality / friction |
| `weight_logged` | `has_note`, `delta`, `source` | Weight-habit engagement |
| `water_added` | `amount`, `to_target_pct`, `reached_target` (bool) | Hydration habit |
| `water_target_edited` | `old`, `new` | Personalization depth |
| `targets_edited` | `mode` (`auto`/`custom`), `changed_fields` | Plan ownership |
| `plan_config_edited` | `changed_fields`, `regenerated` (bool) | Plan engagement |
| `insight_viewed` | `period`, `insight_type` | Insights adoption |
| `insight_expanded` | `insight_type` | Depth of engagement |
| `streak_viewed` | `current`, `longest` | Habit-surface engagement |
| `streak_milestone_reached` | `milestone` | Retention hook firing |
| `achievement_unlocked` | `achievement_id`, `family`, `tier` | Reward-loop firing |
| `achievement_shared` | `achievement_id`, `channel` | Virality |
| `chart_scrubbed` | `chart`, `route` | Deep-engagement signal |

**Conversion events.**

| Event | Key props | Purpose |
|---|---|---|
| `onboarding_started` / `onboarding_step_completed` / `onboarding_completed` | `step`, `skipped_fields`, `time_to_value_ms` | Activation funnel (~60s-to-value goal) |
| `plan_generated` | `goal`, `diet_style`, `meals_per_day` | First aha moment |
| `paywall_shown` | `source` (`insights`/`voice`/`restaurant`/`concierge`/`nav`), `trigger` | Upsell exposure by surface |
| `paywall_dismissed` | `source`, `dwell_ms` | Upsell friction |
| `trial_started` | `from_source` | 48h trial entry |
| `checkout_started` | `plan_id`, `source` | Intent (Stripe) |
| `checkout_completed` | `plan_id`, `mrr` | Conversion |
| `checkout_failed` | `reason` | Payment friction |
| `premium_feature_used` | `feature` (`voice`/`restaurant`/`concierge`), `first_use` (bool) | Value realization |
| `premium_journey_badge_earned` | `achievement_id` | Premium stickiness |

**Churn / risk events.**

| Event | Key props | Purpose |
|---|---|---|
| `streak_broken` | `previous_length` | Leading churn indicator |
| `trial_expiring_soon` | `hours_left` | Trigger for save-flow |
| `trial_expired_no_convert` | `days_active` | Conversion loss |
| `subscription_canceled` | `reason`, `tenure_days` | Explicit churn |
| `subscription_cancel_started` | `source` | Save-flow entry point |
| `days_inactive_threshold` | `days` (3/7/14) | Dormancy → win-back |
| `logging_lapse` | `days_since_last_log` | Core-loop disengagement |
| `error_shown` | `error_type`, `route` | UX friction / crash proxy |
| `sync_failure` | `endpoint`, `retry_count` | Reliability / trust risk |

**Derived KPIs (product analytics, not events).** DAU/WAU/MAU, D1/D7/D30 retention, meals-logged-per-active-day, streak survival curve, trial→paid conversion rate by `paywall.source`, activation rate (`onboarding_completed` ∧ ≥1 `meal_logged` in day 1), and churn cohort by `logging_lapse` → `subscription_canceled`. These are computed downstream from the event stream; the app only emits the raw events above.

**Instrumentation rules.** Fire the north-star `meal_logged` from a single choke-point so no log source is missed. Attribute every `paywall_shown`/`checkout_*` with `source` for surface-level ROI. Never log PII in `props` (no raw notes, no email — only ids/enums/numbers). Batch and send opportunistically; drop on the offline queue when unreachable; never let analytics degrade the logging loop.


## 8. Monetization, auth, account & settings

This section specs the full commercial and account surface of Plato: the freemium model, the paywall and premium moments, the complete Stripe integration (checkout → billing management → server-enforced gating), the authentication surface including a real password-reset flow, and the Settings and Account screens with every notification, data, and legal control. It replaces today's localStorage-only `premium{status,email,trialExpiresAt}` stub, the URL-based `VITE_PREMIUM_CHECKOUT_URL` redirect, the client-only trial timer, and the missing password-reset path.

Everything here uses the canonical **Elevated Verdant** tokens. All copy is sentence case, active voice. Component names (`GlassSheet`, `PrimaryButton`, `FieldRow`, `SegmentedControl`, `Toggle`, `PlanBadge`, `PremiumLockChip`, etc.) are consistent with the component-library section.

---

### 8.1 Freemium model — the split

Plato is free to use for core tracking. The premium tier ("Plato Plus") unlocks the AI-assisted and concierge features. Every premium capability is gated in **two independent layers**: the client (fast UX, optimistic hide/lock) and the server (authoritative — the server never trusts the client's premium claim).

#### 8.1.1 Free vs Plus feature matrix

| Capability | Free | Plus | Gate owner |
|---|---|---|---|
| Home dashboard, macro orb, streak, water | ✓ | ✓ | none |
| Manual meal logging (search USDA, quick log, edit, delete) | ✓ | ✓ | none |
| Barcode scan → macros | ✓ | ✓ | none (commodity; drives retention) |
| 7-day meal plan (generate, view, swap manually) | ✓ | ✓ | none |
| Weight & water tracking, achievements | ✓ | ✓ | none |
| Basic Insights (current week + current month, calories + macro split) | ✓ | ✓ | none |
| **Voice Log AI** (LLM macro extraction from speech) | — | ✓ | client + server |
| **Photo AI** (camera → food recognition → macros) | — | ✓ | client + server |
| **Restaurant Mode** (menu-aware ordering + macro-matched picks) | — | ✓ | client + server |
| **Concierge Swaps** (AI meal swaps that keep macros on target) | — | ✓ | client + server |
| **Insights Pro** (depth only: quarter/year history, correlations, adherence score, projections, export PDF) | — | ✓ | client + server |

Rationale for the split: the five paid pillars are exactly the ones that carry real inference/LLM cost or concierge value (**Voice Log AI, Photo AI, Restaurant Mode, Concierge Swaps, Insights Pro**). Barcode scanning is deliberately **free** — it is table-stakes for a tracker, has near-zero marginal cost, and is the single strongest retention lever, so it stays out of the paywall.

#### 8.1.2 Trial

- **48-hour full-access trial** of Plato Plus, started once per account. During the trial all five premium pillars are fully unlocked.
- The trial is **not** payment-gated at start (no card required) — this matches the current `startTrial(email)` behavior and lowers friction. Card capture happens only when the user converts to a paid plan.
- Trial state is authoritative on the **server** (`trial_started_at`, `trial_expires_at`), mirrored to the client. The current client-only `setTimeout` expiry (`AppContext` lines 243–255) is replaced by a server truth checked on every gated request and on app resume; the client timer becomes a UX convenience only (to flip the UI at expiry without a round-trip), never the source of truth.
- One trial per account and per verified email. Re-signing in with a new email does not grant a second trial if the device/account is recognized (server-side dedupe on email; best-effort device signal — not a hard block, we do not want false negatives locking out real users).

#### 8.1.3 Entitlement model (single source of truth)

The server exposes one **entitlement object** that the whole app reads. This replaces the ad-hoc `premium{status,email,trialExpiresAt}`.

```jsonc
// GET /api/billing/entitlement  → 200
{
  "tier": "free" | "plus",
  "state": "free" | "trialing" | "active" | "past_due" | "canceled" | "expired",
  "trialExpiresAt": "2026-07-10T14:00:00Z" | null,
  "renewsAt": "2026-08-08T14:00:00Z" | null,          // period end for active
  "cancelAtPeriodEnd": false,
  "plan": { "id": "plus_monthly" | "plus_annual", "interval": "month" | "year",
            "amount": 799 | 5999, "currency": "usd" },
  "paymentStatus": "ok" | "action_required" | "failed",
  "features": ["voice_ai","photo_ai","restaurant_mode","concierge_swaps","insights_pro"]
}
```

- `features` is the array the client checks (`hasFeature('voice_ai')`), never `tier` string comparisons scattered in components. `tier === 'plus'` is derived server-side from `state ∈ {trialing, active}`.
- Client caches the entitlement in memory + localStorage (`plato.entitlement.v1`, replacing `plato.premium.v1`), refreshes on: app launch, app resume/focus, after any checkout/portal return, and after receiving a `entitlement.updated` push/poll. TTL 60s for the cached copy when online.

---

### 8.2 Premium moments & paywall

#### 8.2.1 Premium moments (where the paywall is triggered)

A "premium moment" is any tap on a locked pillar. Each locked entry point shows a **`PremiumLockChip`** — a small pill with a jade lock glyph (jade `#43C6AC` on dark, deep `#0F9482` on light) rather than being hidden. Discoverability > concealment.

| Trigger | Location | Chip copy |
|---|---|---|
| Voice Log AI | Log screen, voice tab / FAB long-press | "Plus" |
| Photo AI | Log screen, camera tab | "Plus" |
| Restaurant Mode | Plans → Restaurant tab | "Plus" |
| Concierge Swaps | Meal card → "swap" action, Plan detail | "Plus" |
| Insights Pro | Insights → locked cards (trends, adherence, export) | "Plus" |

Tapping a locked entry point opens the **paywall sheet** pre-scoped to that feature (the sheet leads with the feature the user just tapped, then presents the full bundle — "unlock this and 4 more").

#### 8.2.2 Paywall sheet (`PaywallSheet`)

**Purpose.** Convert a premium moment into a trial start or a paid subscription with the least friction, while honestly presenting all five pillars.

**Presentation.** Routable bottom `GlassSheet` at `/upgrade` (see §0 canonical route table / §0.8) — not a centered modal or full page. Enters from bottom with page-transition fade+slide, `dur-base` 240ms, `ease-out (.22,.61,.36,1)`; spring on the handle. Backdrop is a dimmed scrim over the signature mesh with `backdrop-filter: blur(16px)`. Sheet max-width 430px, radius 22 top corners, bottom safe-area pad. Drag-to-dismiss on the grabber; tap scrim to dismiss.

**Layout (top → bottom).**

1. **Grabber** (full-radius pill, muted `#5F726D`).
2. **Hero** — the tapped feature, large: duotone glyph in a jade→mint wash, 27px title ("Log meals by voice"), 15px body describing the outcome ("Say what you ate. Plato's AI reads the portions and fills your macros."). Numerics tabular.
3. **Pillar list** — the five pillars as `FieldRow`s with duotone glyphs, each a one-line benefit:
   - Voice Log AI — "Speak a meal, get macros instantly."
   - Photo AI — "Snap your plate, we estimate the rest."
   - Restaurant Mode — "Order out and stay on target."
   - Concierge Swaps — "Swap any meal, keep your macros locked."
   - Insights Pro — "See long-range trends, correlations and adherence."
   The tapped pillar is highlighted (surface-3 `#17231E` on dark / surface-3 `#EEF3F0` on light, jade left hairline).
4. **Plan selector** — `SegmentedControl` with two options: **Monthly $7.99/mo** and **Annual $59.99/yr** (annual shows a "save 37%" `Badge` in jade). Annual preselected. Prices are display-only here; the real amount comes from the entitlement/Stripe Price.
5. **Primary CTA** — depends on trial eligibility:
   - **Trial not yet used:** `PrimaryButton` "Start 48-hour free trial" (jade fill `#43C6AC`, on-accent text `#04231C`; light theme uses deep `#0F9482` fill for AA). Sub-caption 11px muted: "Free for 48 hours, then $59.99/yr. Cancel anytime."
   - **Trial used/expired:** `PrimaryButton` "Continue to checkout" → Stripe Checkout.
6. **Secondary** — text button "Maybe later" (secondary `#94A9A3`), dismisses.
7. **Legal footer** — 11px caption, links to Terms and Privacy, plus "Restore purchase" link (re-fetches entitlement; useful after reinstall).

**Interactions.**
- Start trial → optimistic: sheet shows an inline success state (mesh burst, haptic-timed per the signature celebration token) → entitlement refetch → sheet auto-dismisses into the unlocked feature. The feature the user originally tapped opens automatically.
- Continue to checkout → launches Stripe Checkout (8.3).
- If offline → CTA disabled, inline banner (see 8.6 offline).

**States.**

| State | Behavior |
|---|---|
| Default | As above; annual preselected. |
| Loading (fetching prices/entitlement) | Skeleton the plan selector + CTA (`Skeleton` shimmer over surface-2). |
| Trial eligible | CTA = "Start 48-hour free trial". |
| Trial used | CTA = "Continue to checkout"; no trial sub-caption. |
| Already Plus (shouldn't normally reach here) | Replace CTA with "You're on Plus" and a link to Billing. |
| Error (price/entitlement fetch failed) | Inline `danger #E1616C` row: "Couldn't load plans. Retry." with retry. |
| Offline | CTA disabled + banner "You're offline. Connect to start Plus." |

**Light/dark notes.** Dark is default: glass fill `rgba(16,26,22,.50)`, glass border `rgba(160,215,200,.12)`, mesh scrim behind. Light: glass fill `rgba(255,255,255,.62)`, border `rgba(12,58,50,.08)`, primary interactive switches to deep `#0F9482`. Duotone pillar glyphs keep the macro/brand hues in both themes.

---

### 8.3 Stripe integration (full)

Plato uses **Stripe Checkout** (hosted) for card capture and **Stripe Billing** (Subscriptions) + the **Customer Portal** as the backing for the in-app Billing screen, with a **webhook**-driven entitlement store as the source of truth. No card data ever touches Plato's servers or the client.

#### 8.3.1 Objects & mapping

| Stripe object | Plato mapping |
|---|---|
| Customer | 1:1 with Plato `user.id` (stored as `stripe_customer_id` on the user row). Created lazily at first checkout. |
| Product "Plato Plus" | Single product. |
| Price `plus_monthly` ($7.99/mo) / `plus_annual` ($59.99/yr) | The two selectable plans. |
| Subscription | Drives `state`, `renewsAt`, `cancelAtPeriodEnd`. |
| Subscription trial | Optional Stripe-native trial when a card IS attached at checkout; the card-free 48h trial is Plato-managed (8.1.2) and does not require a Stripe subscription until conversion. |
| Invoice / PaymentIntent | Powers invoice list + payment-failed states. |

#### 8.3.2 Checkout flow

1. Client calls `POST /api/billing/checkout` `{ priceId, successPath, cancelPath }`.
2. Server: ensures a Stripe Customer for the user, creates a **Checkout Session** (`mode: subscription`, the chosen Price, `client_reference_id = user.id`, `success_url`, `cancel_url`, `allow_promotion_codes: true`, automatic tax on). Returns `{ url }`.
3. Client redirects to the Stripe-hosted URL (full redirect on web PWA; the current bare `VITE_PREMIUM_CHECKOUT_URL` redirect is replaced by this session-scoped URL).
4. On success, Stripe returns the user to `successPath` (`/you/billing/success`, under the canonical `/you/billing` route). The app shows a **success screen** (mesh burst celebration, "You're on Plato Plus", "Manage subscription" button) and immediately refetches the entitlement — but does **not** trust the redirect alone.
5. **Authority is the webhook**, not the redirect: `checkout.session.completed` + `customer.subscription.created/updated` update the entitlement store. If the user lands on success before the webhook lands, the client shows a brief "Finishing up…" state and polls `GET /api/billing/entitlement` (2s interval, 15s cap) until `state ∈ {active, trialing}`.

#### 8.3.3 Webhooks (server, authoritative)

Endpoint `POST /api/billing/webhook` (signature-verified with the Stripe webhook secret; raw-body). Handled events → entitlement writes:

| Event | Effect on entitlement |
|---|---|
| `checkout.session.completed` | Link customer, mark `active`/`trialing`. |
| `customer.subscription.created` / `.updated` | Sync `state`, `renewsAt`, `cancelAtPeriodEnd`, `plan`. |
| `customer.subscription.deleted` | `state = canceled`, drop `plus` features at period end. |
| `invoice.paid` | `state = active`, `paymentStatus = ok`. |
| `invoice.payment_failed` | `paymentStatus = failed`, `state = past_due`. |
| `invoice.upcoming` | (optional) schedule renewal reminder notification. |

Webhooks are idempotent (dedupe on Stripe event id). Entitlement writes are the single place `features` is recomputed.

#### 8.3.4 Billing / Manage subscription screen (`BillingScreen`)

**Route.** `/you/billing` (see §0 canonical route table). Reached from Settings → "Subscription", Account → "Plato Plus", and the paywall's "Manage subscription".

**Purpose.** One place to see and control the subscription: current plan, renewal, payment method, invoices, and cancel/resume — without leaving the app for the routine cases, delegating card edits and disputes to the Stripe Customer Portal.

**Layout (bento of glass cards).**

1. **Plan card** (`PlanBadge` + details) — "Plato Plus · Annual", price "$59.99 / year", `state` chip:
   - trialing → jade chip "Trial · 28h left" (tabular countdown, always in hours per §0.4 — never days)
   - active → jade chip "Active"
   - past_due → honey `#E7B67C` chip "Payment due"
   - canceled (cancel_at_period_end) → muted chip "Ends Aug 8"
2. **Renewal row** — "Renews Aug 8, 2026" or "Your plan ends Aug 8, 2026" when canceling. `renewsAt` from entitlement, tabular date.
3. **Payment method card** — brand + last4 + expiry ("Visa ·· 4242 · 08/28"), "Update" → opens Stripe Customer Portal (`POST /api/billing/portal` → `{ url }`, `flow_data: payment_method_update`). Trial-without-card shows "No card on file — add one to keep Plus after your trial."
4. **Invoices list** — `FieldRow` per invoice: date, amount, status (`paid` jade / `open` honey / `failed` danger), tap → hosted invoice/receipt URL (from Stripe, opened in new tab). Empty state: "No invoices yet." Paginated via `GET /api/billing/invoices?limit=12`.
5. **Manage actions** —
   - **Cancel plan** → confirmation `GlassSheet`: "Cancel Plato Plus? You'll keep Plus until Aug 8, then move to free." Buttons: destructive-tint "Cancel plan" (danger `#E1616C` text, not fill) + "Keep Plus". Calls `POST /api/billing/cancel` (sets `cancel_at_period_end=true`). Resulting state: canceled/ends-at-period-end.
   - **Resume plan** (shown only when `cancelAtPeriodEnd`) → `POST /api/billing/resume` (clears `cancel_at_period_end`). Toast: "Your plan will renew as normal."
   - **Open billing portal** (link, bottom) → full Stripe Customer Portal for edge cases (VAT, address, full invoice history).

**States.**

| State | Behavior |
|---|---|
| Free (no sub) | Screen becomes an upsell: "You're on the free plan" + `PrimaryButton` "Explore Plato Plus" → paywall. Hide invoices/payment cards. |
| Trialing | Countdown chip; "Add a card to continue after your trial" CTA. |
| Active | Full management as above. |
| Past due / payment failed | Prominent honey banner (see 8.6.2) with "Update payment method". |
| Canceled (period-end) | Renewal row reads "ends"; Resume button visible. |
| Loading | Skeleton the plan/payment/invoice cards. |
| Error (Stripe fetch fails) | Inline retry row; still show cached entitlement so the user isn't locked out of info. |
| Offline | Read-only from cache; action buttons disabled with "Reconnect to manage your plan." |

**Light/dark.** Glass cards per the recipe. Danger/warning use the semantic tokens in both themes; the danger cancel text stays `#E1616C`, honey warning `#E7B67C`.

#### 8.3.5 Server-side gating enforcement

- Every premium endpoint (`POST /api/ai/voice-log`, `POST /api/ai/photo-log`, `GET /api/restaurant/*`, `POST /api/plan/swap`, `GET /api/insights/pro`) runs an **entitlement middleware**: it reads the user's server-side entitlement, requires `state ∈ {trialing, active}` and the specific feature in `features`, else returns **`402 Payment Required`** `{ error: "plus_required", feature: "voice_ai" }`.
- The client treats any `402 plus_required` as an instruction to open the `PaywallSheet` scoped to `feature`, even if its local cache said the user was Plus (handles expired trials, failed renewals, tampering).
- Trial/renewal expiry is enforced server-side per request against `trial_expires_at` / subscription status — never against the client clock.

#### 8.3.6 Billing API summary

| Method + path | Purpose |
|---|---|
| `GET /api/billing/entitlement` | The single entitlement object (8.1.3). |
| `POST /api/billing/trial` | Start the 48h Plato-managed trial (once per account). |
| `POST /api/billing/checkout` | Create Checkout Session → `{ url }`. |
| `POST /api/billing/portal` | Create Customer Portal session → `{ url }`. |
| `POST /api/billing/cancel` | Set cancel-at-period-end. |
| `POST /api/billing/resume` | Clear cancel-at-period-end. |
| `GET /api/billing/invoices` | Invoice list for the Billing screen. |
| `POST /api/billing/webhook` | Stripe webhook sink (authoritative). |

---

### 8.4 Authentication

Auth keeps today's three entry modes but adds a real password-reset flow and unifies them under the dark Elevated Verdant theme. Backend is JWT (`plato_token` in localStorage, `Authorization: Bearer`), with the existing local-only fallback when `VITE_API_URL` is unset (dev/offline demos) — the fallback must visibly signal "local account, not synced".

#### 8.4.1 Modes

1. **Sign up** — email, password, optional display name.
2. **Log in** — email, password.
3. **Continue without account** — anonymous/local mode; data lives in localStorage. A persistent, dismissible `Badge` ("local only — sign up to sync") appears in Account and Settings. Any premium action prompts sign-up first (entitlement requires an account).

#### 8.4.2 Auth sheet (`AuthSheet`, replaces `AuthModal`)

**Presentation.** Routable bottom `GlassSheet` at `/auth/:mode` (`mode ∈ login · signup`, see §0 canonical route table / §0.8) — a bottom sheet, not a centered modal. Dark by default, mesh scrim. Enters bottom, `dur-base`. Single sheet with a `SegmentedControl` toggle between "Log in" / "Sign up" (replacing today's text toggle). Fields use `FieldRow`/`Input` with leading icons (mail, lock, user), radius 16.

**Sign-up layout.**
- Email (validated, inline error).
- Password (min 8 chars; strength meter as a thin jade→mint fill bar; show/hide toggle).
- Display name (optional).
- `PrimaryButton` "Create account" (jade / deep on light).
- Divider "or".
- Text button "Continue without account".
- Legal 11px caption: "By continuing you agree to our Terms and Privacy."

**Log-in layout.**
- Email, password (show/hide).
- Right-aligned link "Forgot password?" → password-reset flow (8.4.3).
- `PrimaryButton` "Log in".
- "Continue without account".

**Interactions.**
- Submit → loading (button shows spinner, disabled). Success → sheet dismisses, entitlement + profile refetch, return the user to where they were (or into onboarding if new).
- Errors surface inline in `danger #E1616C`, mapped from the API's existing messages ("An account with this email already exists…", "No account found…", "Incorrect password…").

**States.**

| State | Behavior |
|---|---|
| Default | Toggle on Log in (or Sign up if launched from a signup CTA). |
| Loading | Button spinner, fields disabled. |
| Field error | Inline per-field message, red hairline on the field. |
| Auth error | Row banner above the CTA. |
| Local fallback (no backend) | Small info chip "You're offline — creating a local account. It'll sync when you sign in online." |
| Offline | Submit disabled if backend required; local mode still allowed. |

**Light/dark.** Dark default per tokens; light uses deep `#0F9482` for primary and the light glass fill/border.

#### 8.4.3 Password reset flow (new — request → email → reset)

A three-step flow. Tokens are single-use, expire in 60 minutes, and reset always responds success-shaped to avoid email enumeration.

**Step 1 — Request (`ResetRequestSheet`).**
- Reached from "Forgot password?".
- One field: email. `PrimaryButton` "Send reset link".
- On submit → `POST /api/auth/forgot-password { email }` → always 200.
- Success screen (regardless of whether the email exists): "Check your email. If an account exists for that address, we've sent a link to reset your password." + "Back to log in". This copy is deliberate — no confirmation that the account exists.

**Step 2 — Email.** Server sends a reset email containing a deep link `https://plato.app/auth/reset/:token`. Copy: subject "Reset your Plato password", body "Tap to choose a new password. This link expires in 60 minutes. If you didn't ask for this, you can ignore this email."

**Step 3 — Reset (`ResetPasswordScreen`).**
- Deep-linked route `/auth/reset/:token` (see §0 canonical route table; handled by the router; also works from a cold start / fresh PWA install).
- On load → `POST /api/auth/verify-reset-token { token }`:
  - valid → show the form.
  - invalid/expired → error state: "This link has expired or already been used. Request a new one." + "Send a new link" → Step 1.
- Form: new password (strength meter), confirm password (must match). `PrimaryButton` "Set new password".
- Submit → `POST /api/auth/reset-password { token, password }` → invalidates the token, updates the hash, and (optionally) signs the user in / returns a fresh JWT. Success → "Password updated" screen → "Log in" or auto-continue into the app.

**States.**

| State | Behavior |
|---|---|
| Request default / loading / sent | As above; sent state is the enumeration-safe success. |
| Reset — verifying token | Skeleton/spinner while verifying. |
| Reset — valid | Password + confirm form. |
| Reset — invalid/expired token | Error + request-new-link path. |
| Reset — mismatch | Inline "Passwords don't match" (`danger`). |
| Reset — success | Confirmation + continue. |
| Offline | Request/reset disabled with "You're offline — reconnect to reset your password." |

**Auth API summary.**

| Method + path | Purpose |
|---|---|
| `POST /api/auth/signup` | Existing. |
| `POST /api/auth/login` | Existing. |
| `POST /api/auth/forgot-password` | Request reset (enumeration-safe 200). |
| `POST /api/auth/verify-reset-token` | Validate token before showing form. |
| `POST /api/auth/reset-password` | Set new password, consume token. |
| `POST /api/auth/logout` | Invalidate session (client clears `plato_token`). |

---

### 8.5 Account & Settings

#### 8.5.1 Account screen (`AccountScreen`)

**Route.** `/you/account` (see §0 canonical route table; also reached from the top-bar avatar → You hub → "Profile & account").

**Purpose.** Identity, plan status, and account lifecycle in one place.

**Layout.**
1. **Identity card** — avatar (radius 13), display name (editable inline), email, member-since. "Edit profile" → the onboarding-derived profile editor (name/age/height/weight/gender/activity/goal). For local-only accounts, replace email with the "local only — sign up to sync" badge and a "Sign up to sync" `PrimaryButton`.
2. **Plan card** — mirrors entitlement: "Plato Plus · Annual · renews Aug 8" or "Free plan". Tap → `BillingScreen`. Trial shows countdown.
3. **Account actions** — "Change password" (→ triggers reset flow / in-session change), "Log out", "Delete account".
   - **Delete account** → confirmation `GlassSheet`, danger-tinted: "Delete your account and all data? This can't be undone." Requires typing the word "delete" or re-auth. Server cancels any active subscription (immediately, at period end per policy), removes data. Copy is explicit; no dark patterns.

**States.** Signed-in (full), local-only (sync-first prompts), Plus vs free (plan card variants), loading (skeleton identity + plan cards), offline (edits queue; destructive actions disabled with "Reconnect to manage your account").

#### 8.5.2 Settings screen (`SettingsScreen`)

**Route.** `/you/settings` (see §0 canonical route table). Replaces today's `SettingsPanel`. Grouped list of `FieldRow`s inside glass section cards; 8px rhythm; bottom safe-area pad ~104px to clear the floating nav.

**Groups & controls.**

**Appearance**
- **Theme** — `SegmentedControl`: "System · Light · Dark". Default **System**. Replaces today's boolean `dark`. Writes `plato.theme` (`system|light|dark`); `system` follows `prefers-color-scheme`. Live-applies with a `dur-base` cross-fade (no hard flash). Dark remains the app's primary/most-tuned theme.
- **Reduce motion** — read-only mirror of the OS `prefers-reduced-motion` with an explicit override toggle. When on, disables the macro orb animation, parallax, float, and celebration bursts (per motion tokens).

**Units**
- **Energy** — `SegmentedControl` "Calories (kcal)" / "Kilojoules (kJ)".
- **Body weight** — "kg" / "lb".
- **Height** — "cm" / "ft/in".
- **Liquid** — "ml" / "fl oz". Feeds the water widget.
- All numerics tabular; changing units converts existing displayed values (stored canonical in metric).

**Notifications & reminders** (see 8.5.3 for permission handling)
- **Meal reminders** — master `Toggle`. When on, reveals per-meal time rows (breakfast / lunch / dinner / snack) with time pickers, defaulted from the user's logging pattern. Copy example: "Lunch reminder · 12:30 pm".
- **Water reminders** — `Toggle` + interval (`SegmentedControl` "2h / 3h / 4h", within waking hours).
- **Weekly report** — `Toggle`. When on, a Sunday-evening summary notification + email (if account) recapping calories, adherence, weight trend, streak. Deep-links into Insights.
- **Streak & milestone alerts** — `Toggle`.
- **Renewal & billing alerts** — `Toggle` (default on): trial-ending (24h before) and payment-failed notices. These respect the toggle but payment-failed is also always shown in-app (8.6.2).

**Data**
- **Export my data** — `FieldRow` "Export data". Generates a JSON + CSV bundle (profile, logs, weight, water, plans, recipes) via `GET /api/data/export` (streamed/zipped) and offers download/share. For local-only accounts, exports straight from localStorage. Loading state shows progress; success toast "Your data is ready."
- **Plan export (PDF)** — "Export meal plan" → generates a branded 7-day plan PDF (Insights Pro / Plus for the styled multi-week version; basic single-week PDF is free). Ties into the plan-export gap.
- **Sync now** — visible when signed in: forces a push/pull of profile, logs, **and meal plans + saved recipes** (closing the current localStorage-only gap — plans/recipes now sync). Shows last-synced timestamp; error state if the last sync failed.
- **Reset app** — "Reset all data". Danger-tinted confirmation `GlassSheet`: "Reset Plato? This clears your logs, plans, and preferences on this device." Mirrors the current `clearAll` (which removes `plato_*` and `plato.premium.v1`), now also clearing `plato.entitlement.v1`, `plato.theme`, notification prefs. Does **not** cancel a Stripe subscription (directs the user to Billing for that, with a note).

**About & legal**
- **Terms of service**, **Privacy policy**, **Open-source licenses** — each `FieldRow` → in-app viewer / external link.
- **Contact / help** — mailto `hi@platoapp.com` (the existing `PREMIUM_CONTACT_EMAIL`) + help center link.
- **Version** — read-only row "Plato 2.0.0 (build be4c04b8)" using the build ref; tap 7× reveals a hidden diagnostics panel (entitlement dump, sync log) for support.
- **Sign out** — at the very bottom for signed-in users.

**States.** Default; loading (skeleton rows); each toggle has optimistic + rollback-on-error; offline (toggles that need the server — weekly email, sync — disabled with an inline "Reconnect" note; local prefs like theme/units/reminders still work); premium rows (styled plan PDF) show the `PremiumLockChip` when free.

**Light/dark.** Section cards use the glass recipe per theme; toggles use jade `#43C6AC` (dark) / deep `#0F9482` (light) as the "on" track; dividers use the strong-divider token.

#### 8.5.3 Notifications & permissions

Plato is a PWA, so notifications are **Web Push** (service worker), gated behind the browser permission prompt.

- **Never prompt on load.** The OS/browser permission prompt fires only when the user turns on their **first** reminder toggle in Settings (a clear intent moment).
- **Pre-permission priming** — before the browser prompt, a small in-context `GlassSheet`: "Plato will send meal and water reminders. You can change these anytime in Settings." Buttons: "Turn on reminders" (→ triggers the real prompt) / "Not now". This avoids burning the one-shot browser prompt on an undecided user.
- **Permission states:**

| Browser permission | UI behavior |
|---|---|
| `default` (not asked) | Toggles are available; first toggle-on runs priming → prompt. |
| `granted` | Toggles freely control scheduling; register the push subscription (`POST /api/notifications/subscribe`). |
| `denied` | All notification toggles disabled with an inline note: "Notifications are blocked in your browser settings. Enable them there to get reminders." Provide a "How to enable" link. Never nag repeatedly. |
| `unsupported` (no Push API, e.g. some iOS PWA states) | Hide push toggles; fall back to in-app reminders + email weekly report (if account). Show a one-line note. |

- **Scheduling.** Reminder times/intervals are stored server-side (for account users) so they fire even when the tab is closed, via a push scheduler; local-only users get best-effort in-app/`Notification` scheduling while the app runs.
- **Billing notifications** (trial-ending, payment-failed) route through the same push channel plus in-app banners; payment-failed is always shown in-app regardless of push permission.

---

### 8.6 Cross-cutting states

#### 8.6.1 Trial active / expired

- **Trial active** — a subtle jade `PlanBadge` "Trial · 41h left" appears in the top bar premium pill and on Account/Billing (tabular countdown in hours per §0.4 — never days; updates live but is validated server-side). At **24h left**, a "Trial ending" notification + soft in-app banner (dismissible) with "Keep Plus" → paywall/checkout. All premium features remain fully usable.
- **Trial expired** — server flips `state` to `expired`; the client on next request/resume gets a non-Plus entitlement or a `402` on a gated action. Premium entry points revert to `PremiumLockChip`. A one-time, dismissible banner on Home: "Your trial ended. Ready to keep Plus?" → paywall (now showing "Continue to checkout", no second trial). No data is lost; logs and basic features continue.

#### 8.6.2 Payment failed / past due

- On `invoice.payment_failed` (webhook), `paymentStatus=failed`, `state=past_due`. Premium features remain available during Stripe's smart-retry/grace window (do not hard-lock immediately — respect the dunning window), but:
  - Persistent honey `#E7B67C` banner across the app top: "Your payment didn't go through. Update your card to keep Plus." → `BillingScreen` payment method / portal update.
  - `BillingScreen` plan chip shows "Payment due"; invoices list shows the failed invoice in `danger`.
  - Push + in-app notice on first failure (respecting billing-alerts toggle for push; in-app always).
- If retries ultimately fail and the subscription is canceled → standard expired/free behavior (8.6.1 expired path).

#### 8.6.3 Offline

- The entitlement client serves the **last cached** entitlement so the user keeps Plus UI while briefly offline; gated **server** actions that require live inference (voice/photo AI, restaurant, swaps) fail gracefully with "You're offline — this needs a connection" rather than a paywall.
- Auth, checkout, portal, cancel/resume, reset, data export/sync, and weekly-email toggles are **disabled** offline with consistent inline copy ("You're offline — reconnect to …").
- Local prefs (theme, units, reminder times) still edit and persist locally; server-dependent scheduling reconciles on reconnect.
- A global offline chip (small, muted, top) signals connectivity; it clears on reconnect and triggers an entitlement + sync refresh.

#### 8.6.4 State/prop changes vs today

| Today | Redesign |
|---|---|
| `premium { status, email, trialExpiresAt }` in `plato.premium.v1` | Server `entitlement` object (8.1.3), cached in `plato.entitlement.v1`; client checks `hasFeature()`. |
| Client `setTimeout` trial expiry | Server-authoritative expiry; client timer is UX-only. |
| `VITE_PREMIUM_CHECKOUT_URL` bare redirect + lead webhook | Stripe Checkout Session + webhook-driven entitlement. |
| No password reset | Full request → email → reset flow (8.4.3). |
| Boolean `dark` | `plato.theme` = `system \| light \| dark`. |
| Plans/recipes localStorage-only | Synced via "Sync now" / server (8.5.2 Data). |
| Premium checked client-side only | Enforced client **and** server (`402 plus_required`, 8.3.5). |


## 9. Backend, data model & gap-fix engineering

This is the engineering spec behind the "Elevated Verdant" gap-fixes. Sections 1–8 defined the visual system and screens; this section defines the data model, services, and API surface that make those screens real. Everything here is implementation-ready: it names concrete tables, columns, endpoints, request/response shapes, and the client behaviors (offline queue, conflict resolution, error boundaries) that the UI depends on.

The guiding principle: **localStorage stays the instant source of truth for the current device; the backend becomes the durable, cross-device source of record.** The redesign closes the gaps where the two diverge today — meal plans, saved recipes, water goals, real AI logging, and premium enforcement.

Everything visual in this section (loading, error, empty, offline, over-target surfaces) uses the canonical tokens only. No new hexes are introduced.

---

### 9.0 Current state — what exists and what's missing

**What ships today (verified in `server.ts` + `src/lib/api.ts`):**

- SQLite (better-sqlite3, WAL mode) via Express, or Supabase in some deploys. Tables: `users`, `profiles`, `meal_logs`, `water_log`, `weight_log`.
- JWT auth (30-day tokens, bcrypt hashes). A **local fallback** in `api.ts` (`HAS_BACKEND` guard) stores users in `localStorage.plato_users_v2` with a `simpleHash` and base64 "tokens" when `VITE_API_URL` is unset — this is the demo/offline mode.
- Endpoints: `auth/signup`, `auth/login`, `food/search`, `food/:fdcId` (USDA proxy), `log` (POST/GET/history/DELETE), `profile` (GET/PUT), `streak`, `water` (POST/GET/DELETE), `weight` (POST/GET).
- Offline write queue for meal logs only (`plato_offline_log_queue`, `flushOfflineQueue`).
- Premium is **client-only**: `plato.premium.v1` in localStorage, `{ status: 'free' | 'trial' | 'active', email, trialExpiresAt }`, 48h trial computed on device, an optional `VITE_PREMIUM_LEAD_WEBHOOK` fire-and-forget, and an optional `VITE_PREMIUM_CHECKOUT_URL` that just `window.open`s. No server verification.

**What's missing (the gaps this section closes):**

| Gap | Today | Target |
|---|---|---|
| Meal plans & saved recipes sync | localStorage-only (`plan`, `savedRecipes`, `recipes`) | Server tables + endpoints, cross-device |
| Grocery list persistence | localStorage-only, per-device | `grocery_json` on the active plan (+ localStorage offline), synced via the plan's rev/LWW path |
| Real AI voice logging | Web Speech API + local regex heuristics (`extractIngredients`, `computeMealMacrosFromIngredients`) | Audio → transcription → LLM structured extraction + confidence |
| Barcode / photo logging | none | Barcode lookup + AI photo recognition pipeline |
| Deep-link routing | `activeTab` state, no URLs | React Router, URL-addressable, back/forward, share |
| Password reset | none | Token-based reset endpoints + flow |
| Analytics | none | Event pipeline (`/api/events`) |
| Premium enforcement | client-only | Server-enforced entitlement on gated endpoints |
| Water goal | glasses hardcoded to 250ml, no target | `water_goal_ml` on profile |
| The `/profile` PUT bug | requests wrong URL, silently no-ops | Fixed to `${BASE}/profile` |

---

### 9.1 The `api.ts` `/profile` bug (fix first — it blocks profile persistence)

**Bug.** In `src/lib/api.ts`, `updateProfile()` calls:

```ts
const res = await fetch(`\/profile`, { method: 'PUT', ... });
```

Every other function in the file targets `` `${BASE}/profile` `` where `BASE` is `VITE_API_URL + "/api"`. `updateProfile` instead requests the bare relative path `/profile`. Because `catch {}` swallows the failure and returns `null` (treated as "non-fatal"), and there's a 4s `AbortController` timeout, **profile edits appear to succeed but never persist to the backend.** With a real backend configured, `PUT /profile` (no `/api` prefix) hits the SPA catch-all route and returns `index.html` (HTML, not JSON) — so even the `res.ok` path is meaningless.

**Fix.**

```ts
const res = await fetch(`${BASE}/profile`, {
  method: 'PUT',
  headers: authHeaders(),
  body: JSON.stringify(data),
  signal: controller.signal,
});
```

**Regression guard.** Add a dev-only assertion + a single central request helper so no call can bypass `BASE` again:

```ts
function apiFetch(path: string, init?: RequestInit) {
  if (import.meta.env.DEV && !path.startsWith('/')) {
    console.warn('[api] path should start with "/":', path);
  }
  return fetch(`${BASE}${path}`, { headers: authHeaders(), ...init });
}
// every export routes through apiFetch('/profile', …), apiFetch('/log', …), etc.
```

This is a prerequisite for the profile & settings screens (section 5) and the water-goal write below.

---

### 9.2 Updated data model

New/changed tables and columns are marked **NEW** and **CHANGED**. All timestamps are ISO-8601 strings (matching the existing convention). All `id`s are `randomUUID()`. Every user-owned table carries `user_id` with `ON DELETE CASCADE` and a `(user_id, …)` index, consistent with the existing schema.

#### 9.2.1 `profiles` — CHANGED (new columns)

```sql
ALTER TABLE profiles ADD COLUMN water_goal_ml INTEGER DEFAULT 2000;   -- NEW: hydration target (8 × 250 ml cups)
ALTER TABLE profiles ADD COLUMN diet TEXT;                             -- NEW: e.g. 'balanced','keto','vegan'
ALTER TABLE profiles ADD COLUMN restrictions TEXT;                     -- NEW: JSON array, e.g. '["dairy-free"]'
ALTER TABLE profiles ADD COLUMN meals_per_day INTEGER DEFAULT 3;       -- NEW: onboarding preference
ALTER TABLE profiles ADD COLUMN cook_time TEXT DEFAULT 'moderate';     -- NEW: 'quick'|'moderate'|'involved'
ALTER TABLE profiles ADD COLUMN cuisines TEXT;                         -- NEW: JSON array
ALTER TABLE profiles ADD COLUMN onboarded_at TEXT;                     -- NEW: replaces localStorage 'plato_onboarded'
```

Existing columns kept: `name, age, gender, height_cm, weight_kg, goal, activity_level, calorie_target, protein_target, carb_target, fat_target, updated_at`.

#### 9.2.2 `users` — CHANGED (subscription entitlement)

```sql
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';        -- 'free'|'trial'|'active'|'canceled'
ALTER TABLE users ADD COLUMN trial_expires_at TEXT;                    -- ISO; server-authoritative
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;                  -- from Stripe
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN current_period_end TEXT;                  -- entitlement expiry from Stripe
ALTER TABLE users ADD COLUMN password_reset_token TEXT;                -- hashed reset token
ALTER TABLE users ADD COLUMN password_reset_expires TEXT;
```

Entitlement (`plan`, `trial_expires_at`, `current_period_end`) now lives server-side and is the source of truth for gating (section 9.9). The client `plato.premium.v1` object becomes a *cache* of the server value, not the authority.

#### 9.2.3 `meal_plans` — NEW

One row per generated/saved plan. Multiple plans per user (active + history + saved variants). The plan body is stored as a JSON blob because its shape (`{ meals: [...], macros: {...}, config: {...} }`) is generated client-side by `mealGenerator.js` and does not need to be relationally queried.

```sql
CREATE TABLE IF NOT EXISTS meal_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,                         -- e.g. 'Lose Fat · 2,100 kcal · 4 meals'
  is_active INTEGER NOT NULL DEFAULT 0, -- 1 = the plan currently driving Home/Plans
  config_json TEXT NOT NULL,          -- planConfig: goal, mealsPerDay, diet, days, cookTime, cuisines
  macros_json TEXT NOT NULL,          -- { calories, protein, carbs, fat }
  meals_json TEXT NOT NULL,           -- the 7-day / per-day meal array
  grocery_json TEXT,                  -- NEW: grocery list state for this plan { items:[{name,qty,unit,checked,aisle?}] }
  rev INTEGER NOT NULL DEFAULT 1,     -- monotonic revision for conflict detection
  client_updated_at TEXT NOT NULL,    -- device wall-clock at last edit (for LWW)
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS meal_plans_user ON meal_plans(user_id, is_active);
```

A partial-unique guarantee ("only one active plan per user") is enforced in the endpoint (a transaction sets `is_active = 0` on the user's other plans before activating one), since SQLite partial unique indexes are awkward to migrate.

#### 9.2.4 `saved_recipes` — NEW

Replaces localStorage `savedRecipes` / `recipes`. Recipes are user-authored or saved from Explore.

```sql
CREATE TABLE IF NOT EXISTS saved_recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT DEFAULT 'user',         -- 'user'|'explore'|'restaurant'|'ai'
  servings INTEGER DEFAULT 1,
  ingredients_json TEXT NOT NULL,     -- [{ name, qty, unit, fdcId? }]
  steps_json TEXT,                    -- optional string[]
  macros_json TEXT NOT NULL,          -- per-serving { calories, protein, carbs, fat }
  image_url TEXT,
  tags_json TEXT,                     -- ['high-protein','vegan']
  rev INTEGER NOT NULL DEFAULT 1,
  client_updated_at TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0, -- soft delete for sync tombstones
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS saved_recipes_user ON saved_recipes(user_id, updated_at);
```

#### 9.2.5 `meal_logs` — CHANGED (editing, richer sources)

The current `meal_logs` supports POST/GET/DELETE only. To support **meal editing** (a named gap) and the new capture sources, add:

```sql
ALTER TABLE meal_logs ADD COLUMN serving_qty REAL DEFAULT 1;   -- NEW: editable serving multiplier
ALTER TABLE meal_logs ADD COLUMN serving_unit TEXT;            -- NEW: 'g','oz','cup','item'
ALTER TABLE meal_logs ADD COLUMN barcode TEXT;                 -- NEW: EAN/UPC if scanned
ALTER TABLE meal_logs ADD COLUMN photo_url TEXT;               -- NEW: photo capture reference
ALTER TABLE meal_logs ADD COLUMN confidence REAL;              -- NEW: 0–1 for AI-derived entries
ALTER TABLE meal_logs ADD COLUMN updated_at TEXT;              -- NEW: enables PATCH/edit
```

`source` (existing column) gains new enumerated values: `'manual' | 'search' | 'quick' | 'voice' | 'barcode' | 'photo' | 'plan'`.

#### 9.2.6 `events` — NEW (analytics)

```sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  user_id TEXT,                       -- nullable: pre-auth events
  anon_id TEXT,                       -- device id for pre-auth funnel stitching
  name TEXT NOT NULL,                 -- 'onboarding_step_completed', 'meal_logged', ...
  props_json TEXT,                    -- arbitrary event properties
  session_id TEXT,
  ts TEXT NOT NULL,                   -- client event time
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS events_name_ts ON events(name, ts);
CREATE INDEX IF NOT EXISTS events_user ON events(user_id, ts);
```

#### 9.2.7 Data-model diagram

```
users ──1:1── profiles
  │
  ├──1:N── meal_logs        (date-indexed; editable; source ∈ manual|search|quick|voice|barcode|photo|plan)
  ├──1:N── water_log        (goal now lives on profiles.water_goal_ml)
  ├──1:N── weight_log
  ├──1:N── meal_plans       NEW  (one is_active per user; grocery_json persists the grocery list)
  ├──1:N── saved_recipes    NEW  (soft-delete tombstones for sync)
  └──1:N── events           NEW  (analytics; also anon pre-auth)
```

---

### 9.3 AI Voice logging pipeline

Replaces the current heuristic path (Web Speech transcript → `extractIngredients` regex → `computeMealMacrosFromIngredients` lookup). The redesign keeps the same **overlay UX** (section 4 Voice overlay: listening orb → parsing → confirm card) but swaps the brain for a real LLM. **Premium-gated** (Voice Log AI is a premium unlock).

#### 9.3.1 Pipeline

```
[1] Capture        Web Speech API live transcript for instant feedback (unchanged UX),
                   AND record raw audio (MediaRecorder → webm/opus) as the authoritative input.
[2] Transcription  Send audio to server → provider transcription (Whisper-class) for accuracy.
                   Fallback: if audio upload fails/offline, use the Web Speech transcript text.
[3] Extraction     Server sends transcript to the LLM with a structured-output prompt →
                   returns { items: [{name, qty, unit, calories, protein, carbs, fat, confidence}], ... }
[4] Confidence     Per-item + overall confidence. USDA cross-check refines macros where an item
                   maps to a known food; low-confidence items are flagged for user confirmation.
[5] Confirm        Client renders the confirm card; user edits qty/macros; on accept → POST /api/log
                   (source:'voice', confidence stored).
```

The client never calls the LLM directly (keeps API keys server-side and lets us enforce premium + rate limits). Transcription and extraction are **two hops** so that a text-only fallback still works when audio can't be uploaded.

#### 9.3.2 Model & prompt approach

- **Transcription:** a Whisper-class speech-to-text model, server-side. Short clips (< 30s), so latency budget ~1–2s.
- **Extraction:** a fast instruction-following LLM with **structured JSON output** (tool/function-calling or JSON-schema mode). System prompt frames it as a nutrition parser; the response must conform to the `VoiceParseResult` schema — no prose.

System prompt (verbatim intent, kept short and deterministic):

> You are Plato's meal parser. Convert a spoken meal description into structured food items with estimated macros. Rules: infer sensible default servings when quantity is omitted (e.g. "a chicken breast" = 1 breast ≈ 170g). Use standard nutrition values per item. Output JSON only, matching the provided schema. Never invent items the user didn't mention. For each item, set confidence 0–1 reflecting how sure you are of both the food and its quantity. If the input isn't food, return an empty items array and set needs_clarification to a short question.

Generation params: temperature 0.1 (deterministic), max tokens bounded, JSON-schema enforced. After the LLM returns, the server **reconciles** each item against USDA FoodData Central (`searchUSDA`) when the item name maps cleanly, replacing the LLM's estimated macros with database values and boosting confidence; unmatched items keep the LLM estimate at lower confidence.

Confidence surfacing in the confirm card (section 4 tokens):
- ≥ 0.8 → green check, macro row uses **jade #43C6AC** accent, auto-selected.
- 0.5–0.8 → **honey #E7B67C** "double-check" hint on the item.
- < 0.5 → **rose-red danger #E1616C** flag, item pre-expanded for editing, not auto-logged.

#### 9.3.3 API shape

**`POST /api/ai/voice`** (premium, multipart or JSON)

Request (audio path):
```
multipart/form-data
  audio: <blob webm/opus>
  transcript?: <string>   // Web Speech fallback / hint
  mealSlot?: 'breakfast'|'lunch'|'dinner'|'snack'
```
Request (text-only fallback):
```json
{ "transcript": "grilled chicken breast with a cup of rice and broccoli", "mealSlot": "dinner" }
```

Response `200`:
```json
{
  "transcript": "grilled chicken breast with a cup of rice and broccoli",
  "items": [
    { "name": "Grilled chicken breast", "qty": 1, "unit": "breast",
      "calories": 284, "protein": 53, "carbs": 0, "fat": 6,
      "fdcId": 171077, "confidence": 0.9, "matched": true },
    { "name": "White rice", "qty": 1, "unit": "cup",
      "calories": 205, "protein": 4, "carbs": 45, "fat": 0,
      "fdcId": 168878, "confidence": 0.86, "matched": true },
    { "name": "Broccoli", "qty": 1, "unit": "cup",
      "calories": 31, "protein": 3, "carbs": 6, "fat": 0,
      "confidence": 0.74, "matched": false }
  ],
  "totals": { "calories": 520, "protein": 60, "carbs": 51, "fat": 6 },
  "overallConfidence": 0.83,
  "needsClarification": null
}
```

Errors: `402` premium required; `422` `{ needsClarification: "What kind of milk — whole or skim?" }` when parse is ambiguous; `429` rate-limited; `503` provider down (client shows the manual-entry fallback).

**States (overlay).** Listening (WebGL orb pulses on capture) → uploading/parsing (skeleton confirm card, "reading your meal…") → confirm (editable items) → success (haptic + macro orb fill on Home). Offline: audio can't upload → auto-fall-back to Web Speech transcript path client-side, banner "logged with on-device estimate — macros may be rough." Error: provider `503` → toast + inline "enter it manually" CTA into Quick log.

---

### 9.4 Barcode + AI Photo food recognition

Two new capture methods surfaced from the FAB / Log screen. Barcode is available to all tiers; **AI photo is premium-gated** (heavier vision inference).

#### 9.4.1 Barcode pipeline

```
[1] Capture   BarcodeDetector API (native, where available) or a bundled JS fallback (ZXing-class)
              reading the device camera stream. Returns EAN-13 / UPC-A.
[2] Lookup    POST /api/food/barcode { code } → server resolves via Open Food Facts (barcode→product+
              nutriments), normalized into the existing FoodResult shape. Cache hits in a
              server-side product cache table/KV to cut latency and rate limits.
[3] Estimate  Product macros per serving; user sets serving qty; → POST /api/log (source:'barcode',
              barcode stored).
```

**`GET /api/food/barcode/:code`** (auth) →
```json
{ "found": true, "code": "0038000138416",
  "food": { "name": "Corn Flakes", "brand": "Kellogg's", "serving": "30g",
            "calories": 110, "protein": 2, "carbs": 24, "fat": 0, "fiber": 1, "sugar": 3 } }
```
Miss → `{ "found": false }` (client offers manual entry pre-filled with the code).

#### 9.4.2 AI photo pipeline

```
[1] Capture     Camera → still image (or gallery pick). Client downsizes to ≤1024px, JPEG ~0.8.
[2] Recognition POST /api/ai/photo (multipart image) → vision LLM identifies dishes + est. portion.
[3] Estimate    Same structured schema as voice → items[] with macros + confidence. USDA reconcile
                for named single foods; multi-item plates return one item per recognized component.
[4] Confirm     Confirm card identical to voice (shared component). Accept → POST /api/log
                (source:'photo', photo_url + confidence stored).
```

**`POST /api/ai/photo`** (premium, multipart `image`) → same response schema as `POST /api/ai/voice` (`items[]`, `totals`, `overallConfidence`, `needsClarification`), plus `photoUrl`. The confirm card, confidence coloring, and edit affordances are shared with voice — one `ConfirmMacrosCard` component drives voice, photo, and barcode.

**States.** Camera-permission-denied → empty state with "enable camera" copy + manual-entry CTA. Recognition low overall confidence (< 0.5) → honey **#E7B67C** banner "we're not sure — tap to adjust," nothing auto-logged. Offline → both barcode lookup and photo recognition require network; show offline empty state (section 9.8) and route to Quick log.

---

### 9.5 Backend sync of meal plans & saved recipes

Today `plan`, `savedPlans`, `savedRecipes`, `recipes` live only in localStorage (`AppContext` `saveState`), so they never leave the device. This adds durable, cross-device sync with an **offline-first, last-writer-wins-with-revision** strategy that matches how the app already treats localStorage as the immediate write target.

#### 9.5.1 Strategy

- **Write path:** UI mutates local state → `saveState` to localStorage (instant, unchanged) → enqueue a sync op. Each entity carries `rev` (monotonic int) and `client_updated_at` (device time).
- **Sync op:** `POST /api/plans` (upsert) / `POST /api/recipes` (upsert). The server compares incoming `rev`/`client_updated_at` against stored:
  - incoming `rev` > stored `rev` → accept, bump stored `rev` to incoming.
  - incoming `rev` == stored and `client_updated_at` newer → accept (LWW tiebreak).
  - incoming `rev` < stored `rev` → **conflict**: server returns `409` with the current server record; client keeps server's copy as source of truth and re-bases local edits on top (surfacing a non-blocking toast only if the two diverge meaningfully).
- **Read/pull:** `GET /api/plans?since=<ISO>` and `GET /api/recipes?since=<ISO>` return records changed since the client's last pull cursor (stored as `plato_sync_cursor_plans` / `_recipes`). Deletes are **tombstones** (`is_deleted = 1`) so a delete on device A propagates to device B.
- **Offline:** ops accumulate in a generic `plato_sync_queue` (extends the existing `plato_offline_log_queue` pattern to plans/recipes). On reconnect (`online` event + on app foreground), `flushSyncQueue()` drains oldest-first; failures re-enqueue; `409`s trigger the rebase above.

#### 9.5.2 Endpoints

**Meal plans**

| Method | Path | Body / Query | Returns |
|---|---|---|---|
| `GET` | `/api/plans` | `?since=ISO` (optional) | `{ plans: MealPlan[] }` (incl. tombstones since cursor) |
| `GET` | `/api/plans/active` | — | `{ plan: MealPlan \| null }` |
| `POST` | `/api/plans` | `MealPlan` (with `rev`, `clientUpdatedAt`) | `201 { plan }` / `409 { serverPlan }` |
| `PUT` | `/api/plans/:id/activate` | — | `{ plan }` (transaction: unsets other actives) |
| `PUT` | `/api/plans/:id/grocery` | `{ grocery, rev, clientUpdatedAt }` | `{ plan }` / `409 { serverPlan }` — persists `grocery_json` (rev/LWW, same conflict rules) |
| `DELETE` | `/api/plans/:id` | — | `{ ok: true }` (soft delete → tombstone) |

**Grocery persistence.** The grocery list belongs to a plan and persists as `grocery_json` on that plan row (§9.2.3). Write path is identical to the rest of the plan: UI toggles an item → `saveState` writes localStorage instantly (offline source of truth) → enqueue a sync op. It syncs either as part of the whole-plan `POST /api/plans` upsert or via the dedicated `PUT /api/plans/:id/grocery` (lighter payload when only the grocery list changed); both share the plan's `rev`/`clientUpdatedAt` conflict handling, so a `409` re-bases the grocery list the same way as meals. Offline, grocery ops accumulate in `plato_sync_queue` (§9.8) and flush on reconnect — grocery has a first-class sync path, not localStorage-only.

`POST /api/plans` body:
```json
{ "id": "…uuid", "title": "Lose Fat · 2,100 kcal · 4 meals",
  "config": { "goal": "lose-fat", "mealsPerDay": 4, "diet": "balanced", "days": 7, "cookTime": "quick" },
  "macros": { "calories": 2100, "protein": 180, "carbs": 190, "fat": 60 },
  "meals": [ { "day": 0, "slot": "breakfast", "name": "…", "calories": 480, "protein": 40, "carbs": 45, "fat": 14 } ],
  "grocery": { "items": [ { "name": "Chicken breast", "qty": 1.2, "unit": "kg", "checked": false } ] },
  "isActive": true, "rev": 3, "clientUpdatedAt": "2026-07-08T14:02:11.000Z" }
```

**Saved recipes**

| Method | Path | Body / Query | Returns |
|---|---|---|---|
| `GET` | `/api/recipes` | `?since=ISO` | `{ recipes: Recipe[] }` |
| `POST` | `/api/recipes` | `Recipe` (with `rev`, `clientUpdatedAt`) | `201 { recipe }` / `409 { serverRecipe }` |
| `PUT` | `/api/recipes/:id` | partial `Recipe` | `{ recipe }` |
| `DELETE` | `/api/recipes/:id` | — | `{ ok: true }` (tombstone) |

#### 9.5.3 Plan export / share (named gap)

- **`GET /api/plans/:id/export.pdf`** (auth) → server renders the active plan to PDF (7-day grid + macro summary + grocery list) styled with the Verdant tokens (dark PDF: page base **#070D0C**, jade **#43C6AC** headers, honey/aqua/rose macro chips). Returns `application/pdf`. Client "share plan" → generates a **read-only share link** `POST /api/plans/:id/share` → `{ url: "/share/plan/<shareId>" }` (per §0.2) resolving to a public, unauthenticated read view (see routing 9.6). Share tokens are revocable (`DELETE /api/plans/:id/share`).

---

### 9.6 Deep-link routing architecture

Replaces the `activeTab` state machine in `AppContext` with real URLs, browser back/forward, and shareable links.

#### 9.6.1 Router choice

**React Router (v6+, `createBrowserRouter`).** Rationale: it's the standard for a React 19 SPA, supports data loaders, nested layouts for the persistent floating nav, `errorElement` for the error boundary + 404 (section 9.7), and clean `useSearchParams` for modal state. History-API URLs (not hash) so links are clean; `vercel.json`/Express already have the SPA catch-all for deep-link refreshes.

#### 9.6.2 Route table

The canonical route table is **§0.2** (single source of truth). All Plans segments and Log modes are **real nested routes**, not `?tab=` query params — see §0.2 canonical route table. The auth-requirement column below layers onto those routes:

- **Public:** `/welcome`, `/onboarding/:step`, `/auth/login`, `/auth/signup`, `/auth/reset/:token`, `/share/plan/:shareId`.
- **Required (JWT):** everything else — `/home`, `/log` (+ `/log/voice` · `/log/scan` · `/log/photo` overlays), `/plans/*` (`week` · `recipes` · `restaurant` · `grocery`), `/plans/recipes/:recipeId`, `/explore`, `/you` and its subs (`weight` · `insights` · `achievements` · `settings` · `billing` · `account`), `/upgrade`.
- **Premium (⭐):** `/log/photo` and Restaurant Mode within `/plans/restaurant` are gated (`402` server-side, `?paywall=<feature>` overlay client-side). **Barcode (`/log/scan`) is FREE.**

Password reset confirm is `/auth/reset/:token`; the public shared plan is `/share/plan/:shareId`. The 404 fallback is the router `errorElement` on `*` (§9.7.2). Modals (Auth, Paywall) are routable bottom GlassSheets per §0.8; the meal-confirm and regenerate sheets are transient (no route, §0.2). The FAB "+" opens `/log`.

#### 9.6.3 Guards, back/forward, share

- **Auth guard:** a `RequireAuth` wrapper (route loader) redirects unauthenticated users to `/auth/login?next=<path>`; on success it returns them to `next`.
- **Premium guard:** a `RequirePremium` wrapper checks the **server-verified** entitlement (section 9.9), not just localStorage. On fail → `?paywall=<feature>` overlay instead of a hard redirect (so context is preserved).
- **Onboarding guard:** if `profile.onboarded_at` is null → redirect to `/welcome` (then `/onboarding/:step`). Replaces the current `localStorage 'plato_onboarded'` + App.jsx re-show guard.
- **Back/forward:** each tab switch is a real navigation; the floating nav uses `NavLink` `active` state derived from the URL. Modal open/close pushes/pops so the OS/browser back button closes the modal first (expected mobile behavior).
- **Scroll restoration:** React Router `ScrollRestoration` per route; the macro orb and Home bento restore scroll position on back.
- **Share:** `/share/plan/:shareId` (plan, per §0.2) is public, chrome-less, and SSR-friendly meta (`og:` tags) for link previews. Sharing uses the Web Share API where available, clipboard fallback otherwise.

---

### 9.7 Error boundary, 404, and global error/empty/offline UI

#### 9.7.1 Error boundary

A top-level React error boundary wraps the router; each route also sets an `errorElement`. On a render/loader throw it shows the **global error surface** (not a white screen), logs to the analytics/error pipeline (`POST /api/events` with `name:'client_error'`), and offers "reload" + "go home."

**Global error surface (dark):** surface-2 **#121C19** card on mesh, hairline border `rgba(160,205,190,.09)`, a duotone fluid illustration (empty-state style), title in ink **#EAF1EF** ("something broke on our end"), body in sage **#94A9A3**, primary button jade **#43C6AC** / text on-accent **#04231C**. Light: surface-1 **#FFFFFF**, deep **#0F9482** primary, text **#0E1614**. Copy is sentence case, active voice, specific.

#### 9.7.2 404

`*` route → "we couldn't find that page." Same surface tokens as the error boundary, with a "back to home" jade button and a smaller "log a meal" secondary. Reachable via any bad deep link; the Express/Vercel SPA fallback serves the app so the client router (not the server) renders the 404.

#### 9.7.3 Global patterns (reused across every screen — referenced by sections 3–8)

| Pattern | Trigger | Visual (dark) | Copy example |
|---|---|---|---|
| **Skeleton/loading** | data loader pending | surface-2 **#121C19** blocks, subtle shimmer, glass border `rgba(160,215,200,.12)`; macro orb shows static gradient fallback | — |
| **Empty** | no data yet | duotone fluid illustration, sage body, jade CTA | "no meals logged yet — tap + to start" |
| **Error (inline)** | request failed | rose-red **#E1616C** hairline + icon, retry link | "couldn't reach the server — retry" |
| **Offline** | `navigator.onLine === false` | persistent honey **#E7B67C** top strip: "you're offline — changes save on this device and sync when you're back" | — |
| **Over-target** | macro/calorie totals exceed goal | ring/bar overshoot rendered in rose **#E1A0AB** (fat/over) with a soft danger tint, never alarmist red-blocking | "over your calorie target for today" |

Offline detection drives a global `isOffline` context flag; write actions still succeed (localStorage + queue) and show the offline strip instead of an error.

---

### 9.8 Offline-first strategy (queue, flush, conflict)

Generalizes the existing meal-log offline queue into one durable outbox for all mutations.

- **Outbox:** `plato_sync_queue` — an ordered list of ops `{ id, entity: 'log'|'plan'|'recipe'|'water'|'weight'|'profile', method, path, body, rev?, clientUpdatedAt, attempts }`. Every mutating client call appends here after writing localStorage.
- **Flush:** `flushSyncQueue()` runs on: app foreground, the `online` event, and after any successful authenticated request (piggyback, as `flushOfflineQueue` does today). It drains oldest-first with bounded retry/backoff (attempts capped; dead-letter surfaced as a one-time toast, never data loss).
- **Conflict:** `409` from plan/recipe upserts → adopt server record, re-base local edit, bump `rev`, re-enqueue if the local change is still meaningful. Logs/water/weight are append-mostly and effectively conflict-free (server assigns `id`); edits use `updated_at` LWW.
- **Idempotency:** each op carries a client-generated `id`; the server upserts by `id` so a double-flush (e.g. app relaunched mid-flush) is a no-op, not a duplicate. This fixes a latent risk in today's log queue where a retried POST could double-insert.
- **PWA:** register a service worker to (a) cache the app shell for offline launch and (b) optionally use Background Sync to flush the outbox even when the tab is closed. Static gradient/PNG fallbacks for the 3D orb are cached so offline Home still renders.

---

### 9.9 Premium gating — server enforcement

Today gating is decorative (localStorage `plato.premium.v1`, a lead webhook, a `window.open` checkout). The redesign makes entitlement **server-authoritative** while keeping the instant client UX.

#### 9.9.1 Billing (Stripe)

- **`POST /api/billing/checkout`** (auth) → creates a Stripe Checkout Session (subscription) for the signed-in user; returns `{ url }`. Client redirects; on return the webhook has (or soon will) set entitlement.
- **`POST /api/billing/webhook`** (Stripe signature-verified, no JWT) → handles `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`. Writes `users.plan`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`. This is the **only** writer of `active`/`canceled` entitlement.
- **`POST /api/billing/portal`** (auth) → Stripe Billing Portal session `{ url }` for the **manage-subscription screen** (`/you/billing`, per §0.2): shows plan, renewal/`current_period_end`, cancel, update card. All via the portal (no card data touches Plato).
- **48h trial:** on first premium-feature intent (or explicit "start trial"), **`POST /api/billing/trial`** sets `users.plan='trial'`, `trial_expires_at = now + 48h` **server-side** (not device clock). No card required. Idempotent — a user can't restart the trial by clearing localStorage.

#### 9.9.2 Entitlement endpoint & client cache

- **`GET /api/me/entitlement`** (auth) → `{ plan, active, trialExpiresAt, currentPeriodEnd, features: [ 'voice_ai', 'photo_ai', 'restaurant_mode', 'concierge_swaps', 'insights_pro' ] }`. `features[]` is the canonical snake_case entitlement enum (§0.4). `active` is computed server-side: `plan==='active' && currentPeriodEnd>now`, OR `plan==='trial' && trialExpiresAt>now`.
- The client hydrates `premium` from this on load and after checkout, and **caches** it in `plato.premium.v1` for offline gating — but the cache is advisory. Gated endpoints re-check server-side, so a tampered cache can't unlock the actual AI calls.

#### 9.9.3 Server enforcement on gated endpoints

A `requirePremium` middleware (after `authMiddleware`) checks entitlement and returns **`402 Payment Required`** `{ error: 'premium_required', feature }` when absent. Applied to:

| Endpoint | Feature |
|---|---|
| `POST /api/ai/voice` | Voice Log AI |
| `POST /api/ai/photo` | AI photo logging |
| `GET /api/restaurant/*` | Restaurant Mode |
| `POST /api/plans/swaps` (concierge) | Concierge Swaps |

The client's `RequirePremium` guard and paywall overlay are UX conveniences; the `402` is the real gate. On `402`, the client opens the paywall (`?paywall=<feature>`) rather than erroring.

---

### 9.10 Password reset

New public flow. Client routes are `/auth/signup` (request entry point) and the deep-link `/auth/reset/:token` confirm route per §0.2 canonical route table (no standalone `/reset`).

| Method | Path | Body | Behavior |
|---|---|---|---|
| `POST` | `/api/auth/forgot` | `{ email }` | Always returns `200 { ok: true }` (no account enumeration). If the email exists, generates a token, stores `password_reset_token` (hashed) + `password_reset_expires` (now + 1h), and sends the reset email with `/auth/reset/:token`. |
| `POST` | `/api/auth/reset` | `{ token, password }` | Validates token + expiry, sets new bcrypt hash, clears reset fields, invalidates the token. Returns `{ ok: true }` (client routes to `/auth/login`). |
| `GET` | `/api/auth/reset/:token/valid` | — | Lightweight pre-check so `/auth/reset/:token` can show "this link expired" before the user types a password. |

**States.** Request form: default → sending (spinner) → success ("if that email exists, we sent a reset link" — sage copy, jade confirm). Confirm form: valid token → new-password fields; expired/invalid token → rose-red **#E1616C** notice + "request a new link." Reset emails are transactional (provider TBD in infra section); links are single-use and time-boxed.

---

### 9.11 Analytics / event pipeline

- **Client:** a thin `track(name, props)` helper batches events (flush every ~10s or 20 events, and on `visibilitychange`) into `POST /api/events`. Uses `navigator.sendBeacon` on page hide so the last events aren't lost. Pre-auth events carry `anon_id` (persisted device id) so the onboarding funnel stitches to the user after signup.
- **`POST /api/events`** (auth optional) → `{ events: [{ name, props, ts, sessionId, anonId? }] }` → bulk-insert into `events`. Returns `202`.
- **Core events (named, sentence-case values):** `app_opened`, `onboarding_started`, `onboarding_step_completed` (`{ step }`), `plan_generated`, `meal_logged` (`{ source, confidence }`), `voice_parse` (`{ overallConfidence, itemCount }`), `photo_parse`, `barcode_scanned` (`{ found }`), `water_logged`, `weight_logged`, `paywall_viewed` (`{ feature }`), `trial_started`, `checkout_started`, `subscription_activated`, `client_error` (`{ message, route }`), `plan_shared`, `plan_exported`.
- **Privacy:** no third-party pixel required; events land in our own `events` table. `client_error` doubles as lightweight error telemetry feeding section 9.7.

---

### 9.12 Full endpoint table (existing + new)

Legend: **E** = exists today, **N** = new, **C** = changed. All under `/api`. `Auth`: 🔓 public · 🔒 JWT · ⭐ JWT + premium (`402` if not entitled).

| # | Method | Path | Auth | Status | Purpose |
|---|---|---|---|---|---|
| 1 | GET | `/api/health` | 🔓 | E | Health check |
| 2 | POST | `/api/auth/signup` | 🔓 | E | Create account (also issues JWT) |
| 3 | POST | `/api/auth/login` | 🔓 | E | Sign in |
| 4 | POST | `/api/auth/logout` | 🔒 | E | Sign out (client clears token) |
| 5 | POST | `/api/auth/forgot` | 🔓 | **N** | Request password reset email |
| 6 | POST | `/api/auth/reset` | 🔓 | **N** | Set new password from token |
| 7 | GET | `/api/auth/reset/:token/valid` | 🔓 | **N** | Pre-validate reset token |
| 8 | GET | `/api/food/search?q=` | 🔒 | E | USDA search |
| 9 | GET | `/api/food/:fdcId` | 🔒 | E | USDA food detail |
| 10 | GET | `/api/food/barcode/:code` | 🔒 | **N** | Barcode → product macros (Open Food Facts) |
| 11 | POST | `/api/log` | 🔒 | E | Log a meal (source enum expanded) |
| 12 | GET | `/api/log?date=` | 🔒 | E | Day log + totals |
| 13 | GET | `/api/log/history?days=` | 🔒 | E | Daily rollups (≤90d) |
| 14 | PATCH | `/api/log/:id` | 🔒 | **N** | **Edit** a log entry (serving/macros) |
| 15 | DELETE | `/api/log/:id` | 🔒 | E | Delete a log entry |
| 16 | GET | `/api/profile` | 🔒 | E | Get user + profile |
| 17 | PUT | `/api/profile` | 🔒 | C | Update profile (+water_goal_ml, diet, prefs; **URL bug fixed client-side**) |
| 18 | GET | `/api/streak` | 🔒 | E | Current + longest streak |
| 19 | POST | `/api/water` | 🔒 | E | Log water |
| 20 | GET | `/api/water?date=` | 🔒 | C | Day water + goal (`glasses` now derived from `water_goal_ml`) |
| 21 | DELETE | `/api/water/:id` | 🔒 | E | Delete water entry |
| 22 | POST | `/api/weight` | 🔒 | E | Log weight |
| 23 | GET | `/api/weight?days=` | 🔒 | E | Weight history |
| 24 | GET | `/api/plans` | 🔒 | **N** | List plans (`?since=` delta, incl. tombstones) |
| 25 | GET | `/api/plans/active` | 🔒 | **N** | Active plan |
| 26 | POST | `/api/plans` | 🔒 | **N** | Upsert plan (rev/LWW; `409` on conflict) |
| 27 | PUT | `/api/plans/:id/activate` | 🔒 | **N** | Make plan active |
| 28 | PUT | `/api/plans/:id/grocery` | 🔒 | **N** | Persist grocery list (`grocery_json`; rev/LWW) |
| 29 | DELETE | `/api/plans/:id` | 🔒 | **N** | Soft-delete plan |
| 30 | GET | `/api/plans/:id/export.pdf` | 🔒 | **N** | Export plan PDF |
| 31 | POST | `/api/plans/:id/share` | 🔒 | **N** | Create public share token |
| 32 | DELETE | `/api/plans/:id/share` | 🔒 | **N** | Revoke share token |
| 33 | GET | `/api/plans/swaps` / POST | ⭐ | **N** | Concierge swaps (premium) |
| 34 | GET | `/api/recipes` | 🔒 | **N** | List saved recipes (`?since=` delta) |
| 35 | POST | `/api/recipes` | 🔒 | **N** | Upsert recipe (rev/LWW; `409`) |
| 36 | PUT | `/api/recipes/:id` | 🔒 | **N** | Edit recipe |
| 37 | DELETE | `/api/recipes/:id` | 🔒 | **N** | Soft-delete recipe |
| 38 | POST | `/api/ai/voice` | ⭐ | **N** | Audio/transcript → structured macros |
| 39 | POST | `/api/ai/photo` | ⭐ | **N** | Photo → structured macros |
| 40 | GET | `/api/restaurant/search` / `/:id` | ⭐ | **N** | Restaurant Mode (premium) |
| 41 | GET | `/api/me/entitlement` | 🔒 | **N** | Server-authoritative premium state |
| 42 | POST | `/api/billing/trial` | 🔒 | **N** | Start 48h trial (server clock) |
| 43 | POST | `/api/billing/checkout` | 🔒 | **N** | Stripe Checkout session |
| 44 | POST | `/api/billing/portal` | 🔒 | **N** | Stripe Billing Portal session |
| 45 | POST | `/api/billing/webhook` | 🔓* | **N** | Stripe webhook (*signature-verified) |
| 46 | POST | `/api/events` | 🔓/🔒 | **N** | Analytics event batch |
| 47 | GET | `/api/share/plan/:shareId` | 🔓 | **N** | Public read of a shared plan (for `/share/plan/:shareId`) |

---

### 9.13 Build & rollout notes

- **Migrations:** the `ALTER TABLE` statements (9.2) run idempotently on boot alongside the existing `CREATE TABLE IF NOT EXISTS` block in `server.ts`; guard each with a "column exists" check (or a tiny migrations table) since SQLite `ADD COLUMN` throws on repeat.
- **Backfill:** on first authenticated load after upgrade, the client pushes any localStorage-only `plan`, `savedRecipes`, `recipes` through `POST /api/plans` / `POST /api/recipes` (one-time, guarded by a `plato_synced_v1` flag) so existing users don't lose their local data.
- **Order of operations:** (1) fix the `/profile` bug (9.1) — unblocks profile + water goal; (2) entitlement endpoint + server gating (9.9) — everything premium depends on it; (3) plan/recipe sync (9.5); (4) AI voice/photo + barcode (9.3–9.4); (5) routing (9.6) + error boundary (9.7); (6) password reset (9.10) + analytics (9.11).
- **Local fallback preserved:** the `HAS_BACKEND` demo mode (localStorage auth, no network) must keep working for the design-import/preview environment; every new client function guards on `HAS_BACKEND && auth.isLoggedIn()` before hitting the network, exactly as the current API client does.


## 10. Component library & 3D signature moments

The component library is the vocabulary the rest of this spec speaks in. Every screen section references these names, so this section is the single place where a component's purpose, variants, states, token bindings, and accessibility contract are defined. Two legacy gaps are closed here by mandate: **IconButton** and every tappable icon now carry explicit tap feedback, and **Skeleton** loaders now shimmer. Colors, radii, spacing, motion, and typography reference the canonical "Elevated Verdant" tokens only — no component may introduce a hex, radius, or duration that is not in the token set.

### 10.0 System conventions (applies to every component)

**Token binding.** Components consume tokens by role, never by raw value. In the React/Tailwind repo these map to CSS variables so the same component tree serves both themes by toggling `data-theme` on `<html>`:

| Role token | Dark value | Light value |
|---|---|---|
| `--page` | `#070D0C` | `#F3F7F4` |
| `--surface-1` | `#0E1614` | `#FFFFFF` |
| `--surface-2` | `#121C19` | `#F7FAF8` |
| `--surface-3` | `#17231E` | `#EEF3F0` |
| `--glass-fill` | `rgba(16,26,22,.50)` | `rgba(255,255,255,.62)` |
| `--hairline` | `rgba(160,205,190,.09)` | `rgba(12,58,50,.10)` |
| `--glass-border` | `rgba(160,215,200,.12)` | `rgba(12,58,50,.08)` |
| `--divider` | `rgba(160,215,200,.18)` | `rgba(12,58,50,.10)` |
| `--ink` | `#EAF1EF` | `#0E1614` |
| `--sage` (secondary) | `#94A9A3` | `#48605A` |
| `--muted` | `#5F726D` | `#7E938C` |
| `--on-accent` | `#04231C` | `#04231C` |
| `--primary` (interactive) | `#43C6AC` (jade) | `#0F9482` (deep, for AA) |

**Brand & macro tokens (theme-independent):** jade `#43C6AC`, deep `#0F9482`, forest `#0C3A32`, mint `#8CE0CE`; protein aqua `#5FD4C4`, carbs honey `#E7B67C`, fat rose `#E1A0AB`, spare violet `#AEA6EA`. **Semantic:** success `#43C6AC`, warning `#E7B67C`, danger `#E1616C`, info `#5FD4C4`.

**Radii tokens:** cards `22`, large tiles `20`, controls/inputs `16`, pills/chips `full`, FAB `21`, avatar `13`.

**Spacing scale (px):** `2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 32 · 44`, on an 8px base rhythm. Bottom safe-area pad `~104px` clears the floating nav.

**Motion tokens:** `dur-fast 140ms`, `dur-base 240ms`, `dur-slow 420ms`; `ease-out cubic-bezier(.22,.61,.36,1)`; spring stiffness `320` / damping `30`; tap scale `.97`; ring/orb fill `800ms` decelerate; stagger `60ms/item`.

**Type roles:** display/UI face Bricolage Grotesque (variable); body/UI Geist or Hanken Grotesk; fallback `'SF Pro Display', ui-sans-serif, -apple-system, system-ui`. Digits always `font-variant-numeric: tabular-nums`. Micro-labels 10px uppercase, letter-spacing `.16–.24em`, sage. All real copy is sentence case.

**Depth policy.** Only the four signature moments in §10.13 use WebGL/Spline/Canvas. Every other component achieves depth with the glassmorphism recipe and CSS shadows: `box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 18px 34px -28px rgba(0,0,0,.9)`, `backdrop-filter: blur(16px)` (24px for the floating nav).

**Global accessibility contract (inherited by all components unless overridden):**
- **Touch targets ≥44×44px.** Visual size may be smaller (e.g. a 24px icon) but the hit area is padded to 44px minimum.
- **Focus states are always visible for keyboard/switch users:** a 2px ring in `--primary` at `.6` alpha, offset 2px, radius matching the component, rendered via `:focus-visible` (never suppressed globally).
- **Contrast:** body text and interactive labels meet WCAG AA (≥4.5:1); large text and non-text UI meet ≥3:1. This is why light theme swaps interactive to deep `#0F9482` — jade `#43C6AC` on white fails AA for text.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, transforms/parallax/float/shimmer/orb animation are disabled; state changes cross-fade with opacity only over `dur-fast`. No component may depend on motion to convey meaning.
- **ARIA:** every interactive component exposes a role, an accessible name, and state (`aria-pressed`, `aria-expanded`, `aria-selected`, `aria-disabled`, `aria-busy`, `aria-live` as appropriate).
- **Hit feedback:** all tappable components scale to `.97` on press (`dur-fast`, `ease-out`) and, where the device supports it, fire a light haptic. This is the legacy IconButton gap, now enforced at the primitive level.

---

### 10.1 Atoms

#### Button
**Purpose.** The primary text action primitive. Drives commits, confirmations, and navigation-with-intent.

**Variants**

| Variant | Use when | Fill | Label / border |
|---|---|---|---|
| `primary` | The one main action on a surface (Save, Log it, Start plan) | `--primary` (dark jade `#43C6AC`, light deep `#0F9482`) | label `--on-accent` `#04231C` |
| `secondary` | Supporting action beside a primary | `--surface-2`, 1px `--glass-border` | label `--ink` |
| `ghost` | Low-emphasis / tertiary (Skip, Not now) | transparent | label `--sage`, no border |
| `danger` | Destructive commit (Delete meal, Cancel subscription) | transparent, 1px `#E1616C` at `.5` | label `#E1616C`; solid `#E1616C` + `--on-accent` label for the final destructive confirm |

**Sizes.** `sm` (36px h, 13px label), `md` (48px h, 15px label — default), `lg` (56px h, 15px label, full-width). All ≥44px hit area (`sm` pads to 44).

**States**

| State | Visual | Behavior |
|---|---|---|
| Default | Per variant | — |
| Hover (pointer) | Fill lightens ~6% toward mint / border to `--divider` | `dur-fast` |
| Pressed | Scale `.97`, light haptic | `dur-fast`, `ease-out` |
| Focus-visible | 2px `--primary` ring, offset 2 | — |
| Loading | Label swaps to inline ProgressRing (16px, indeterminate); width locked to prevent reflow | `aria-busy="true"`, non-interactive |
| Disabled | 40% opacity, no shadow | `aria-disabled="true"`, no press/haptic |

**Tokens.** Radius `16`. Padding `12 20` (`md`). Motion `dur-fast` / `ease-out`, tap `.97`. Label = body face, 15/500, sentence case.

**A11y.** `role="button"`; accessible name from label (icon-only buttons must use IconButton, not Button). Enter/Space activate. Danger's final confirm requires a distinct label ("Delete") — never rely on color alone.

#### IconButton — *(closes legacy tap-feedback gap)*
**Purpose.** A single-icon action where a text label would be noise (close, back, more, favorite, mute). Historically these had no press state; this component makes tap feedback mandatory.

**Variants.** `plain` (transparent, `--sage` icon), `filled` (`--surface-2` circle, `--ink` icon), `accent` (`--primary` circle, `--on-accent` icon), `danger` (`#E1616C` icon).

**States**

| State | Visual | Behavior |
|---|---|---|
| Default | 24px icon centered in 44×44 hit area | — |
| Pressed | **Scale `.97` + radial ripple in current color at `.14` from touch point; light haptic** | `dur-fast`. This is the fix — no IconButton ships without it. |
| Active/toggled | `filled`/`accent` background persists; `aria-pressed="true"` | icon may swap (e.g. outline→solid heart) |
| Focus-visible | 2px `--primary` ring, offset 2, radius `full` | — |
| Disabled | 40% opacity | no ripple/haptic |

**Tokens.** Container radius `full`; icon 24px (20px in dense toolbars, still 44px hit area); ripple `dur-base`. **Under reduced motion the ripple is replaced by a one-step background flash at `.10`.**

**A11y.** `role="button"`, **`aria-label` is required** (icon has no text). Toggle variants set `aria-pressed`. Minimum 44×44 hit area is non-negotiable.

#### Badge / Pill
**Purpose.** Compact status or metadata marker (macro tag, "Premium", streak count, "New").

**Variants.** `neutral` (`--surface-3`, `--sage` text), `macro` (macro-colored dot + label, e.g. protein aqua `#5FD4C4`), `semantic` (success/warning/danger/info tinted at `.16` fill with matching text), `accent` (`--primary` fill, `--on-accent` text), `count` (numeric, tabular-nums).

**States.** Static by default; `count` animates value changes with a 120ms number roll (skipped under reduced motion). Interactive pills (filter chips) are governed by Chip below.

**Tokens.** Radius `full`; padding `2 8` (micro) / `4 10` (default); text 11px caption or 10px micro-label uppercase for status. Dot 6px.

**A11y.** Decorative badges get `aria-hidden` when the adjacent label already conveys the meaning; standalone status badges expose text (never color-only).

#### Avatar
**Purpose.** Represents the user (top bar, You tab, account screen).

**Variants.** `image`, `initials` (derived from name, on `--surface-3` with `--sage` text), `placeholder` (person glyph). Sizes: `sm 28`, `md 36` (top bar), `lg 64` (You/account header).

**States.** Default; pressed (`.97` + haptic — it navigates to the You tab `/you`); ring variant adds a 2px `--primary` ring for "active"/premium. Loading uses a Skeleton circle.

**Tokens.** Radius `13` (per spec, a soft-square avatar, not a full circle). Border 1px `--glass-border`.

**A11y.** `role="button"` when it navigates to the You tab, `aria-label="Open your profile"`; decorative-only avatars use `alt` with the person's name.

#### ProgressRing
**Purpose.** The ambient progress primitive — inline button spinners, small macro rings, the calorie ring's structural base, and the Macro Orb's fallback.

**Variants.** `determinate` (fills to a fraction), `indeterminate` (rotating arc for loading). Sizes: `16` (in-button), `24` (list), `72` (macro), `132` (hero calorie ring).

**States.** Fill animates over `ring/orb fill 800ms decelerate`; over-target state pushes past 100% into an overflow arc rendered in `warning` honey `#E7B67C` (calories over goal). Reduced motion: ring snaps to final value with a 140ms opacity fade, no sweep.

**Tokens.** Track = `--hairline`; fill = role color (calorie ring jade `#43C6AC`; macro rings use the macro color). Cap rounded. Stroke 8px hero / 4px small.

**A11y.** `role="progressbar"` with `aria-valuenow/min/max`; the center label (e.g. "1,480 / 2,050 kcal") is the accessible readout, so screen readers don't depend on the arc.

#### Skeleton — *(closes legacy shimmer gap)*
**Purpose.** Placeholder for content that is loading, preserving layout to prevent shift.

**Variants.** `text` (1em bar, radius 6), `block` (radius matches target — 22 for cards, 16 for controls), `circle` (avatars/rings), and composed skeletons per organism (MealCard skeleton, MacroCard skeleton).

**Behavior — the fix.** Skeletons **shimmer**: a diagonal highlight sweeps left→right, `1.4s` linear loop, `2s` when several are on screen to avoid a strobe field. Base fill `--surface-2`; highlight is a `--surface-3`→`rgba(160,215,200,.10)`→`--surface-3` gradient band at ~18% width. **Under `prefers-reduced-motion` the shimmer is disabled and the skeleton uses a static two-step opacity pulse (`.6↔1`) at `dur-slow`** so there is still a "loading" cue without lateral motion.

**Tokens.** Fill `--surface-2`; radius per target; shimmer respects motion tokens.

**A11y.** Skeleton containers set `aria-busy="true"` and `aria-hidden` on the bars themselves; the region announces "Loading" via an `aria-live="polite"` label so the shimmer isn't the only signal.

---

### 10.2 Molecules

#### Input / Field
**Purpose.** Single-line and multiline text entry (search, quick log grams, profile fields, auth).

**Anatomy.** Optional leading icon → input → optional trailing action (clear IconButton, unit suffix like "g"/"kcal") → helper/error text below.

**Variants.** `text`, `number` (tabular-nums, numeric keypad), `search` (leading magnifier, rounded-full container, clear button), `password` (trailing show/hide IconButton), `stepper` (number flanked by − / + IconButtons for grams/servings).

**States**

| State | Visual | Behavior |
|---|---|---|
| Default | `--surface-2` fill, 1px `--hairline`, `--ink` text, `--muted` placeholder | — |
| Focus | Border → `--primary`, 2px focus ring, subtle inner glow | label floats/persists |
| Filled | Border `--glass-border` | clear button appears |
| Error | Border + helper text `#E1616C`; leading state icon | `aria-invalid="true"` |
| Success | Border `#43C6AC` (e.g. valid coupon) | transient |
| Disabled | 40% opacity, no caret | non-editable |
| Loading | Trailing 16px indeterminate ProgressRing (e.g. USDA search in flight) | `aria-busy` |

**Tokens.** Radius `16` (search `full`). Height 48px, ≥44 hit area. Label 13px `--sage`; input 15px `--ink`; helper 11px caption. Motion `dur-fast`.

**A11y.** Every field has a visible `<label>` (placeholder is not a label). Error text is tied via `aria-describedby`; number steppers expose `aria-label` on − / + and update an `aria-live` value.

#### Chip / SegmentedControl
**Purpose.** Chip = single filter/selection token (cuisines, restrictions, meal type). SegmentedControl = mutually-exclusive view switch (My plan · Recipes · Restaurant; Search · Quick · Voice on Log).

**Chip variants.** `choice` (multi-select toggle), `filter` (with leading check when active), `input` (removable, trailing × IconButton — dietary restrictions). **States:** default (`--surface-2`, `--sage`), selected (`--primary` at `.16` fill, `--primary` text, 1px `--primary`), pressed (`.97` + haptic), disabled.

**SegmentedControl.** A pill track (`--surface-2`, radius `full`) holding 2–4 segments; the active segment is a `--surface-3` "thumb" that **slides** to the tapped segment over `dur-base` with the spring (stiffness 320 / damping 30). Active label `--ink`, inactive `--sage`. Reduced motion: thumb cross-fades instead of sliding.

**Tokens.** Radius `full`; chip padding `6 12`; segment min-width so each stays ≥44px tappable; text 13px.

**A11y.** Chips: `role="button"` + `aria-pressed` (choice/filter) or a `role="listbox"`/`option` group for single-select sets. SegmentedControl: `role="tablist"` with `aria-selected`; arrow keys move between segments.

#### StatTile
**Purpose.** A single labeled metric in the Home/Insights bento (water, weight, steps proxy, streak days, protein-to-goal). The smallest bento unit.

**Anatomy.** Micro-label (10px uppercase sage) → hero number (tabular-nums, 30/800, `-.03em`) → optional delta chip / sparkline / mini ProgressRing.

**Variants.** `plain`, `with-ring` (mini ProgressRing, e.g. water 6/8 cups), `with-delta` (▲/▼ vs yesterday in success/danger), `with-spark` (7-day mini line).

**States.** Default; loading (Skeleton block, radius 20); empty ("—" with a "Add" affordance, e.g. no weight logged); pressed (`.97`, opens detail); over-target (number turns honey `#E7B67C` when a cap is exceeded).

**Tokens.** Card/tile treatment (glass or solid per placement), radius `20` (large tile). Padding `16`. Delta chip = Badge semantic.

**A11y.** The micro-label + number form the accessible name ("Water, 6 of 8 cups"); interactive tiles are `role="button"`.

#### ListRow
**Purpose.** The horizontal record primitive — logged foods, search results, grocery items, recipe steps, You-tab menu entries, account settings rows.

**Anatomy.** Leading (icon / macro dot / thumbnail / Avatar) → title + subtitle stack → trailing (value, chevron, toggle, IconButton, or Badge).

**Variants.** `nav` (chevron, opens a screen), `value` (right-aligned number, e.g. "220 kcal"), `action` (trailing IconButton like add/delete), `toggle` (trailing switch — settings), `selectable` (leading check — grocery/multi-select).

**States**

| State | Visual | Behavior |
|---|---|---|
| Default | `--surface-1`/transparent on a card, hairline divider between rows | — |
| Pressed | Row bg → `--surface-2`, `.97` on the whole row (nav variant), haptic | `dur-fast` |
| Swipe | Reveals actions: edit (`--primary`) + delete (`#E1616C`) — **enables meal editing, closing the delete-only legacy gap** | drag with spring; snap-back |
| Loading | ListRow Skeleton (circle + two text bars) | shimmer |
| Empty | Handled by parent EmptyState, not the row | — |

**Tokens.** Min height 56px (≥44 hit). Title 15/500 `--ink`; subtitle 13 `--sage`; value tabular-nums. Divider `--hairline`. Radius inherited from container.

**A11y.** `nav` rows are `role="button"`/link with `aria-label` combining title+value; toggles are real `role="switch"` with `aria-checked`; swipe actions have equivalent non-gesture access (long-press opens the same edit/delete menu) so the gesture is never the only path.

#### Toast
**Purpose.** Transient, non-blocking feedback ("Meal logged", "Plan saved", "You're offline — changes will sync").

**Variants.** `success` (jade `#43C6AC` accent bar/icon), `info` (aqua `#5FD4C4`), `warning` (honey `#E7B67C`), `danger` (`#E1616C`), and `action` (with a trailing "Undo" text button — undo a delete/log).

**Placement & motion.** Slides up from above the floating nav (bottom, respecting the ~104px safe area), glass surface, auto-dismiss `dur-slow`×~8 (≈3.4s) with a hairline countdown; swipe-down to dismiss. Reduced motion: fade in/out only.

**Tokens.** Glass recipe, radius `16`, blur(16px). Icon 20px; text 14 `--ink`; Undo = ghost Button `sm`. Max one toast at a time (queue).

**A11y.** `role="status"` (`aria-live="polite"`), or `role="alert"` (`assertive`) for danger. Auto-dismiss pauses while focused/hovered; action toasts stay until dismissed so keyboard users can reach Undo. Never the sole channel for critical errors (mirror inline).

---

### 10.3 Surfaces & containers (atoms/molecules that hold content)

#### Card (glass + solid)
**Purpose.** The base grouping surface for related content.

**Variants**

| Variant | Recipe | Use when |
|---|---|---|
| `glass` | `--glass-fill` bg, 1px `--glass-border`, `backdrop-filter: blur(16px)`, inset+drop shadow per recipe | Floating content over the signature mesh (Home cards, sheets) |
| `solid` | `--surface-1`/`--surface-2` fill, 1px `--hairline`, drop shadow only | Dense lists, settings, anywhere blur would cost perf or reduce legibility |
| `interactive` | Either base + press `.97` + haptic + hover lift (`translateY(-2px)`, shadow deepens) | Tappable cards (MealCard, recipe card) |

**States.** Default; pressed/hover (interactive only); loading (card Skeleton); selected (2px `--primary` ring — e.g. chosen plan); disabled (40%).

**Tokens.** Radius `22`. Inner padding `16`/`20`. Blur 16px (24px reserved for nav). Reduced-motion drops the hover lift.

**A11y.** Non-interactive cards are `role="group"` with an `aria-labelledby` heading; interactive cards are a single focusable `role="button"` (don't nest independently-focusable controls inside a tappable card without clear separation).

#### BentoTile
**Purpose.** A card specialized for the Home/Insights bento grid — variable column/row span, consistent internal rhythm.

**Variants by span.** `1×1` (StatTile host), `2×1` (wide — macro summary, water), `1×2` (tall — Macro Orb host, weekly chart), `2×2` (hero). A `feature` variant adds a faint radial accent in the corner echoing the mesh (CSS only).

**States.** Default; loading (span-matched Skeleton); empty (in-tile EmptyState — e.g. "Log your first meal"); pressed (`.97`, opens detail).

**Tokens.** Radius `20` (large tile), gap between tiles `12`, padding `16`. Glass or solid per the tile's job (Orb tile is glass; a dense list tile is solid).

**A11y.** Each tile is a labeled region; the grid uses source order = reading order, so the DOM order is logical regardless of visual span.

#### Sheet / BottomSheet
**Purpose.** Contextual, dismissible surface anchored to the bottom for focused sub-tasks (quick-log grams, meal detail, filter set, food-source picker). The default "modal-lite" on mobile.

**Variants.** `peek` (small, ~40% height — quick actions), `half`, `full` (near-full with a scroll region), `expandable` (drag between detents). All lead with a 36px grab handle.

**States.** Entering (slide up + backdrop fade, spring); resting at a detent; dragging (follows finger, rubber-bands past max); dismissing (slide down, swipe-down or backdrop tap); loading (content Skeleton inside a fixed-height sheet). Reduced motion: fade + instant position, no drag physics required (buttons provide detent changes).

**Tokens.** Glass recipe, top radius `22`, blur(16px). Backdrop `rgba(0,0,0,.5)`. Handle `--divider`. Content padding `16`; bottom action pinned above safe area. Motion: spring 320/30.

**A11y.** `role="dialog"` `aria-modal="true"`, labelled by its heading. Focus is trapped and returns to the trigger on close. Escape / swipe-down / backdrop all dismiss. The grab handle has an `aria-label="Close"` sibling button so it's operable without dragging.

#### Modal
**Purpose.** Blocking, centered dialog for decisions that must resolve before continuing (Auth, Paywall, destructive confirms, "Discard changes?"). Used sparingly — sheets are preferred on mobile.

**Variants.** `confirm` (title + body + primary/secondary/danger actions), `form` (Auth, coupon), `celebration` (milestone — hosts a signature moment, §10.13), `paywall` (PremiumGate host with plan options).

**States.** Entering (scale `.96→1` + backdrop fade, `dur-base`); default; loading (primary action → Button loading state, backdrop stays); error (inline error region, not a nested toast); dismissing.

**Tokens.** Glass or solid `--surface-1`, radius `22`, max-width 430 (matches content max width), padding `24`. Backdrop `rgba(0,0,0,.6)`. Reduced motion: opacity-only.

**A11y.** `role="dialog"` `aria-modal`, focus trapped, initial focus on the least-destructive safe control, focus returns to trigger. Escape cancels (except where an explicit choice is mandatory, e.g. hard paywall — then Escape is disabled and clearly no free dismiss exists). Danger confirms require a labeled destructive Button, never color alone.

---

### 10.4 Domain molecules & organisms

#### MacroCard
**Purpose.** Shows one macro's progress for the day (protein / carbs / fat), or a compact three-in-one summary.

**Variants.** `single` (one macro: label, current/goal in grams tabular-nums, a horizontal macro bar); `triad` (three stacked bars in one card — Home default); `ring` (mini ProgressRing per macro for the tight bento tile).

**Macro color binding.** Each bar/ring uses its **same-family** gradient (light tint → base, per §0.7 tokens — bars stay in their own color family): protein `--macro-protein` `linear-gradient(90deg,#5FD4C4,#43C6AC)` (aqua→jade), carbs `--macro-carb` `linear-gradient(90deg,#F0CC9C,#E7B67C)` (honey-lite→honey), fat `--macro-fat` `linear-gradient(90deg,#ECBFC6,#E1A0AB)` (rose-lite→rose). Track = `--hairline`.

**States.** Default; fill animates on log (`ring/orb fill 800ms decelerate`); empty (0 g logged — bars at track with "Start logging"); over-target (bar continues past 100% into a honey `#E7B67C` overflow segment + a small "over" Badge); loading (Skeleton bars).

**Tokens.** Card radius `22`; bar height 8px, radius full; label 13 `--sage`; value 15 tabular-nums `--ink`. Reduced motion: fills set instantly.

**A11y.** Each bar is `role="progressbar"` with name+value ("Protein, 82 of 140 grams"); over-target announces "over goal".

#### MealCard
**Purpose.** Represents a logged or planned meal (Home timeline, Plans day view).

**Anatomy.** Leading thumbnail or meal-type glyph → title + time/source → macro dot-row (kcal + P/C/F) → trailing state (checkmark if logged, "planned" Badge, or add IconButton).

**Variants.** `logged`, `planned` (dashed/soft treatment, "planned" Badge, tap to log or swap), `suggestion` (from plan, tap to add), `compact` (single line for dense days).

**States**

| State | Visual | Behavior |
|---|---|---|
| Default | Interactive glass Card | tap → meal detail Sheet |
| Pressed | `.97` + haptic | — |
| Swipe | Edit (`--primary`) / delete (`#E1616C`) — meal **editing** now supported | — |
| Logging | Optimistic check + macro fill animates; if backend sync fails, silent retry (localStorage remains source of truth) | `aria-busy` briefly |
| Empty | No meals → parent EmptyState | — |
| Offline | "Saved locally" micro-badge; syncs later | — |

**Tokens.** Card radius `22`, padding `16`; macro dots 6px in macro colors; kcal tabular-nums. Premium swaps (Concierge) show a LockBadge if not entitled.

**A11y.** `role="button"`, name = "{meal}, {kcal} kcal, {status}". Swipe actions mirrored in the detail Sheet.

#### The Macro Orb (component contract) — *(signature moment; behavior in §10.13)*
**Purpose.** The living centerpiece on Home: a sphere that fills with light as the day's macros are logged — the emotional core of "Elevated Verdant."

**Component states (the React wrapper, independent of render tech).**

| State | Visual |
|---|---|
| Default | Orb at current fill level = today's calories/goal; macros tint the light (protein aqua, carbs honey, fat rose blended over jade core) |
| Log update | Fill rises over `ring/orb fill 800ms decelerate` + a gentle pulse; light haptic |
| Empty (0 logged) | Dim orb, faint jade core, prompt "Log your first meal to light it up" |
| Over-target | Core warms toward honey `#E7B67C`, subtle "full" shimmer (not alarming) |
| Loading | Static gradient orb + center ProgressRing while data resolves |
| Fallback | If WebGL unavailable/low-power/reduced-motion: a static CSS radial-gradient orb + determinate ProgressRing showing the exact same fraction |

**Tokens.** Sits in a `1×2` glass BentoTile. Center label = calorie ring readout (tabular-nums). Core colors from macro/brand tokens only.

**A11y.** The orb is decorative (`aria-hidden`); the **accessible truth is the numeric center label + a `role="progressbar"`** so the orb never carries information alone. Reduced motion → static fallback automatically.

---

### 10.5 Navigation organisms

#### TabBar / FloatingNav
**Purpose.** Primary navigation. A floating glass bar: **Home · Plans · [FAB +] · Explore · You** (five slots, center is the FAB).

**Anatomy.** Rounded-full glass pill floating above the bottom safe area; four icon+micro-label tabs around a central raised FAB.

**States**

| State | Visual | Behavior |
|---|---|---|
| Inactive tab | `--sage` icon + 10px micro-label | — |
| Active tab | `--primary` icon, label brightens to `--ink`, a `--primary` dot/pill indicator slides under the active tab | indicator slides `dur-base` spring; reduced motion cross-fades |
| Pressed | `.97` + haptic | route change |
| Badge | Optional count Badge on a tab (e.g. grocery items) | — |

**Tokens.** Glass recipe with **blur(24px)** (nav gets the deeper blur), radius `full`, floats with ~16px side inset and clears ~104px bottom safe area. Icons 24px in ≥44 hit slots.

**A11y.** `role="tablist"`; each tab `role="tab"` `aria-selected`, name = its label (not just the icon). This maps to the new deep-link router (each tab is a real URL) so browser back/forward and `aria-current="page"` work. Labels are always visible (never icon-only) for cognitive accessibility.

#### FAB
**Purpose.** The central "+" — the fastest path to logging; the app's most-used action.

**Variants.** `primary` (default "+", opens the Log flow); `contextual` (icon adapts per screen — on Plans it may add a meal). `expanded` variant blooms into 2–3 quick options (Search · Quick add · Voice/Scan) on long-press.

**States.** Default (`--primary` fill, `--on-accent` "+"); pressed (`.97` + haptic + a soft mesh-tinted glow); expanded (radial/vertical option bloom with 60ms stagger; scrim behind); disabled (rare — 40%). Reduced motion: options fade in stacked, no radial travel.

**Tokens.** Radius `21` (per FAB token — a soft-square, not a circle), size 56px raised above the nav plane with an elevated shadow. Bloom uses stagger `60ms`.

**A11y.** `role="button"`, `aria-label="Log food"`; expanded state is `aria-expanded`, options are a focus-trapped menu with Escape to close. Always ≥44 (it's 56).

#### TopBar
**Purpose.** Contextual header: leading Avatar (navigates to the You tab `/you`) · centered screen title · trailing contextual action + Premium pill.

**Variants.** `home` (greeting + date instead of a title, e.g. "Good evening, Zach"); `titled` (screen name, 27px title); `modal` (close IconButton + title); `search` (collapses into a search Input on scroll — Explore/Log).

**States.** Default; scrolled (title shrinks / bar gains a hairline `--divider` and slight glass as content passes under it); action-loading (trailing action shows ProgressRing); premium vs free (trailing shows a "Premium" accent Badge when entitled, or a subtle "Trial · 41h left" pill during the 48h trial, or an "Upgrade" ghost Button when lapsed).

**Tokens.** Transparent over mesh at top → glass `--glass-fill` + `--divider` when scrolled. Title Bricolage 27/700 sentence case. Trailing action = IconButton. Respects top safe area.

**A11y.** `<header>` landmark; title is the page `<h1>`. Avatar and actions are labeled IconButtons. The trial pill's countdown is text, not color-only.

---

### 10.6 Feedback & state organisms

#### EmptyState — *(signature moment host; illustration in §10.13)*
**Purpose.** Turns "nothing here yet" into a warm, coach-toned nudge (empty Home timeline, no recipes saved, no weight logged, empty grocery list, no search results, empty streak).

**Anatomy.** Fluid duotone illustration (or its static fallback) → headline (sentence case, encouraging) → one supporting line → a primary Button (the next best action).

**Copy examples (real, per surface).**

| Surface | Headline | Support | Action |
|---|---|---|---|
| Home timeline | "Let's light up your day" | "Log your first meal and watch the orb glow." | Log a meal |
| Recipes | "No saved recipes yet" | "Save meals you love to build your rotation." | Explore recipes |
| Weight | "Start tracking your weight" | "One entry a week is all it takes to see trends." | Add weight |
| Search (no result) | "No matches for that" | "Try a simpler term, or quick-log it yourself." | Quick log |
| Grocery | "Your list is clear" | "Add items from your plan or type your own." | Add item |
| Offline | "You're offline" | "We'll sync your changes as soon as you're back." | Retry |

**Variants.** `illustrated` (full duotone moment — top-level empties), `compact` (icon + text — in-tile/in-sheet empties), `error` (uses danger tone + retry — failed load), `no-results` (search).

**States.** Static; the illustration animates subtly (fluid drift) if allowed; reduced motion / low-power → static PNG fallback.

**Tokens.** Illustration duotone from brand+macro tokens; headline 20 section-head; support 14 `--sage`; primary Button. Centered, generous spacing (`24`/`32`).

**A11y.** Illustration `aria-hidden`; headline is a real heading; the action Button is the accessible next step. Error empties expose the failure in text + a retry, never color-only.

#### PremiumGate / LockBadge
**Purpose.** Communicate and enforce premium boundaries (Voice Log AI, Restaurant Mode, Concierge Swaps) consistently, aligned to the Stripe billing + 48h-trial model.

**Sub-components.**
- **LockBadge** — a small lock Pill overlaid on a gated feature's entry point (a MealCard swap, a nav item, a Log source). Variants: `locked` (muted, lock glyph), `trial` (honey `#E7B67C` "Trial" — available during 48h), `unlocked` (hidden once entitled).
- **PremiumGate** — the interstitial/Modal shown when a locked feature is tapped: value line, what unlocks, plan/price, primary "Start free trial" or "Upgrade" Button, ghost "Not now".

**States.** `entitled` (gate absent, feature live); `in-trial` (feature live + trial pill with hours-left countdown); `trial-expiring` (<6h → honey warning tone); `locked` (gate blocks, CTA to upgrade); `loading` (entitlement check in flight → optimistic-locked to avoid flashing paid content); `error` (entitlement check failed → fail closed, show gate with retry). Gating is enforced client-side (UI) and server-side (API rejects unentitled calls) so the badge and the backend agree.

**Tokens.** LockBadge = Pill, radius full, lock icon 14px, honey `#E7B67C` for trial / `--muted` for locked. Gate = Modal/`paywall` variant tokens. Never fully hide value — show the feature dimmed with a LockBadge rather than removing it.

**A11y.** LockBadge has `aria-label="Premium feature"` / `"Trial, 41 hours left"`; the gate is a labeled dialog; "Not now" always reachable except on a hard wall. Countdown is text.

---

### 10.7 Component-to-token quick map (audit table)

| Component | Radius | Key surface | Interactive color | Motion | Tap feedback | A11y role |
|---|---|---|---|---|---|---|
| Button | 16 | per variant | `--primary` | fast/ease-out | `.97`+haptic | button |
| IconButton | full | `--surface-2` | `--sage`/`--primary` | fast; ripple base | **`.97`+ripple+haptic** | button (+aria-label) |
| Badge/Pill | full | `--surface-3`/semantic | — | number roll | — | text/status |
| Avatar | 13 | `--surface-3` | `--primary` ring | `.97` | tap+haptic | button/img |
| ProgressRing | — | `--hairline` track | role color | 800ms decel | — | progressbar |
| Skeleton | per target | `--surface-2` | — | **shimmer 1.4s** | — | busy/hidden |
| Input/Field | 16 (search full) | `--surface-2` | `--primary` focus | fast | — | textbox+label |
| Chip | full | `--surface-2` | `--primary` @.16 | — | `.97`+haptic | button/option |
| SegmentedControl | full | `--surface-2` | `--surface-3` thumb | base spring | — | tablist |
| StatTile | 20 | glass/solid | — | — | `.97` | button/group |
| ListRow | inherit | `--surface-1` | `--surface-2` press | fast; swipe spring | `.97`+haptic | button/switch |
| Toast | 16 | glass | semantic | slow; slide | swipe-dismiss | status/alert |
| Card | 22 | glass/solid | `--primary` ring (sel) | hover lift | `.97` (interactive) | group/button |
| BentoTile | 20 | glass/solid | — | — | `.97` | region |
| Sheet | 22 top | glass | — | base spring | drag | dialog |
| Modal | 22 | glass/solid | — | base scale | — | dialog |
| MacroCard | 22 | glass | macro gradients | 800ms fill | — | progressbar×3 |
| MealCard | 22 | glass | macro dots | fill/optimistic | `.97`+swipe | button |
| Macro Orb | 20 tile | glass | brand/macro light | 800ms fill | pulse+haptic | progressbar (label) |
| TabBar | full | glass **blur24** | `--primary` | base spring | `.97`+haptic | tablist |
| FAB | 21 | `--primary` | `--on-accent` | bloom stagger 60 | `.97`+haptic+glow | button/menu |
| TopBar | — | transparent→glass | `--primary` | fast | — | header/h1 |
| EmptyState | — | — | `--primary` CTA | fluid drift | — | heading+button |
| PremiumGate | 22 | modal | honey/`--primary` | base | — | dialog |
| LockBadge | full | honey/muted | — | — | — | status |

---

### 10.8 Signature 3D moments — catalog

Only these four moments justify heavy render tech. Everything else is CSS depth (§10.0). Each moment ships a **static fallback that conveys the same information**, lazy-loads its engine, pauses when offscreen or backgrounded, and honors reduced-motion and low-power.

**Shared loading & governance strategy (applies to all four):**
- **Lazy-load:** the 3D engine (Three.js/WebGL, Spline runtime, or a Canvas module) is code-split and dynamically imported only when its host mounts *and* the guard checks pass. It is never in the initial bundle — first paint uses the static fallback, the rich version hydrates in behind it and cross-fades once ready.
- **Capability guard (evaluated before import):** run all of — (1) `prefers-reduced-motion: reduce` → **static fallback, stop**; (2) `navigator.getBattery()` level < 20% or `saveData`/low-power hints → static fallback; (3) WebGL context + a lightweight device-tier check (screen size / memory / a quick FPS probe) → if unsupported or low-tier, static fallback; (4) tab hidden (`document.hidden`) → defer until visible.
- **Offscreen pause:** an `IntersectionObserver` pauses the render loop (`cancelAnimationFrame`) when the host scrolls out of view or the tab is backgrounded (`visibilitychange`); it resumes on re-entry. Nothing animates that the user can't see.
- **Fallback parity:** every fallback is not a blank box — it shows the *same data* (the same fill fraction, the same illustration mood) via CSS gradients / PNG / ProgressRing, so information is never lost when the rich layer is skipped.
- **Accessibility:** the 3D canvas is always `aria-hidden`; a parallel DOM element carries the real semantics (progressbar, heading, status). No moment is the sole carrier of meaning.

#### Moment 1 — The Macro Orb (Home)

| Aspect | Spec |
|---|---|
| **Intended effect** | A living jade sphere on Home that **fills with light as macros are logged**; macro colors tint the internal glow (protein aqua, carbs honey, fat rose over a jade core). It's the app's emotional anchor — progress you *feel*, not just read. |
| **Tech** | **WebGL** (Three.js), a single shader-driven sphere: a fill uniform (0–1+) drives an internal light rising through the volume; subtle fresnel rim in jade `#43C6AC`; macro mix passed as color uniforms. No physics, one draw call. |
| **Lazy-load** | Dynamic-import the orb module on Home mount after the capability guard passes; static CSS orb shows immediately, WebGL cross-fades in over `dur-base`. |
| **Fallback** | CSS radial-gradient orb (jade core → forest edge) + a determinate ProgressRing at the exact same fraction and the numeric center label. Visually on-brand, fully informative. |
| **Reduced motion** | Fallback orb; on log, the fill updates in a single 140ms opacity step, no rise/pulse. |
| **Battery / low-power** | <20% battery, low-power, or `saveData` → fallback. Never runs a continuous loop on Home unless visible and powered. |
| **Perf budget** | ≤1 mesh / ≤1 draw call; render loop **capped at 30fps** and only while Home is visible (idles to 0fps otherwise); shader kept to a handful of instructions; module target ≤~150KB gz lazy-chunk; must not regress Home time-to-interactive (rich layer arrives after TTI). Log-update animation ≤800ms then idle. |

#### Moment 2 — Plan Reveal (Onboarding)

| Aspect | Spec |
|---|---|
| **Intended effect** | The onboarding "building your plan" beat **blooms into a 3D scene as the macros lock** — a payoff moment that makes the ~60s onboarding feel earned and premium, in the unified dark theme. |
| **Tech** | **Spline** scene (lazy runtime), a short choreographed bloom (particles/mesh assembling into the macro summary), one-shot — not a persistent loop. Falls back to a Framer-Motion CSS sequence. |
| **Lazy-load** | Prefetch the Spline runtime + scene during the preceding onboarding step (while the user reads/taps), so the reveal plays instantly when reached; guard still applies. |
| **Fallback** | A CSS/Framer sequence: numbers count up (calorie + macro rings fill with the 800ms decelerate), cards stagger in (60ms), a mesh-gradient wash — same "your plan is ready" emotional beat without WebGL. |
| **Reduced motion** | Static "Your plan is ready" card with final numbers already filled; a single gentle fade, no bloom/particles. |
| **Battery / low-power** | Fallback sequence (which is cheap anyway). Onboarding must complete fast even on weak devices — the reveal never blocks reaching value. |
| **Perf budget** | One-shot ≤~2.5s then fully disposed (scene + runtime torn down, memory freed — it never persists past onboarding); Spline chunk lazy, target ≤~400KB gz and only ever loaded once per install; if the scene isn't ready within ~1.2s of reaching the step, play the fallback instead of waiting. |

#### Moment 3 — Empty states (fluid duotone illustrations)

| Aspect | Spec |
|---|---|
| **Intended effect** | Empty states feel **crafted, not broken** — soft, fluid duotone illustrations (brand + macro palette) that make "nothing here yet" inviting and on-theme. |
| **Tech** | **Canvas/CSS**, not WebGL — animated SVG/CSS blobs or a lightweight Canvas noise-field for slow fluid drift. Cheap enough to run without the WebGL guard, but still respects motion/power. |
| **Lazy-load** | Illustration assets (inline SVG or small PNG) ship with the EmptyState component; the *animated* layer is deferred and only mounts if motion is allowed and the state persists briefly. |
| **Fallback** | The same illustration as a static duotone SVG/PNG — the drift is pure polish, its absence changes nothing informational. |
| **Reduced motion** | Static illustration, no drift. |
| **Battery / low-power** | Static illustration; skip the animated layer. |
| **Perf budget** | Animated drift ≤ a couple of transformed layers or a small (<~64px) Canvas noise texture scaled up; ≤30fps; pauses offscreen; each illustration asset ≤~30KB. Empty states are common — they must be near-free. |

#### Moment 4 — Streak & milestone celebrations

| Aspect | Spec |
|---|---|
| **Intended effect** | Hitting a streak day or milestone (7-day streak, goal met, first week complete) fires a **mesh burst / confetti-of-light with haptic-timed motion** — a dopamine beat that rewards consistency, in-palette (jade/mint/macro colors). |
| **Tech** | **Canvas** particle burst (or a short WebGL burst for the biggest milestones), **haptic-synced**: the visual peak lands with the haptic tap. One-shot overlay, self-disposing. Hosted in a `celebration` Modal or as a transient overlay. |
| **Lazy-load** | Particle module dynamic-imports the moment a celebration is *about* to trigger (we know the streak count before render); guard applies. |
| **Fallback** | A CSS burst: scale+fade of mesh-gradient shards + the ProgressRing "ding" + a Badge count roll — celebratory without a particle engine. |
| **Reduced motion** | No burst/particles; instead a calm confirmation — the milestone Badge scales in once and a success Toast ("7-day streak — nice work"). Meaning fully preserved. |
| **Battery / low-power** | CSS/Toast fallback; skip particles. |
| **Perf budget** | Burst ≤~1.2s then disposed; particle count capped (≤~120) and pooled; single Canvas overlay removed from the DOM after; haptic fires once at the peak (never a buzz train); never blocks the underlying UI (overlay is non-interactive and dismissible). |

---

### 10.9 Accessibility summary (section-level contract)

- **Touch targets:** every interactive component ≥44×44px hit area, verified per component above (icons/segments pad up to 44; FAB is 56).
- **Focus states:** `:focus-visible` 2px `--primary` ring, offset 2, radius-matched, on every focusable element; focus is trapped in Sheet/Modal and returned to the trigger on close; TabBar exposes `aria-current`.
- **Contrast:** AA for text/labels (≥4.5:1) and ≥3:1 for UI/large text; light theme uses deep `#0F9482` for interactive to clear AA; danger `#E1616C`, warning honey `#E7B67C`, and macro colors are always paired with text/icons, never color-only.
- **ARIA:** roles and states specified per component (button, tablist/tab, dialog, progressbar, switch, status/alert, listbox/option); icon-only controls (IconButton, FAB, Avatar) require `aria-label`; loading regions set `aria-busy` and announce via `aria-live`.
- **Reduced motion:** honored globally — orb/plan-reveal/empty-drift/celebration all fall back to static or opacity-only; shimmer becomes an opacity pulse; SegmentedControl/TabBar indicators cross-fade instead of slide; hover lifts and tap-scale travel are removed. No information is ever conveyed by motion alone.
- **Legacy gaps closed here:** IconButton (and all tappable icons) now have mandatory press feedback (scale + ripple + haptic); Skeletons now shimmer (with a reduced-motion pulse fallback); ListRow/MealCard support swipe-to-edit (not delete-only), with a non-gesture equivalent.


## 11. Motion & interaction system

Motion in Plato is a coaching cue, not decoration. Every animation exists to answer one of four questions: *Where did this come from?* *Where am I now?* *Did my action register?* *Is progress happening?* If a motion doesn't answer one of those, it doesn't ship. The Elevated Verdant motion language is calm, decelerating, and confident — surfaces glide in on the `ease-out` curve, controls settle on a physical `spring`, and the only exuberant moments are earned (streaks, milestones, plan reveal). We never chain animations that block input, never animate for longer than the token allows, and never move more than two properties on a single element at once.

### 11.1 Motion token reference

All timings, curves, and physics come from the canonical **Motion tokens**. No section may invent a new duration, easing, or spring.

| Token | Value | Primary use |
|---|---|---|
| `dur-fast` | 140ms | Tap/press feedback, toggles, chip select, tab underline, hover |
| `dur-base` | 240ms | Page/route transitions, sheet content fades, card stagger step, toast |
| `dur-slow` | 420ms | Sheet expand/collapse, You-tab / bottom-sheet reveals, large surface reveals, celebration base |
| `ease-out` | `cubic-bezier(.22,.61,.36,1)` | Default for all entrances, translations, opacity, size changes |
| `spring` | stiffness 320 / damping 30 | FAB→sheet, drag-snap settle, press-release bounce, orb pulse |
| `ring/orb fill` | 800ms, decelerate | Calorie ring sweep, macro-bar fill, orb light-fill, progress arcs |
| `stagger` | 60ms / item | Card lists, bento tiles, meal rows, quick-add grid entrance |
| `tap scale` | `.97` | Pressed-state scale for all tappable surfaces |
| `page transition` | fade + slide, 240ms | Route change enter/exit (`dur-base` + `ease-out`) |

Derived helpers (composed from tokens, never new values):
- **Exit motions** run at `dur-fast` (140ms) even when their entrance is `dur-base` — leaving is always faster than arriving so the UI never feels sticky.
- **Spring for micro-bounce** (press release, snap) uses the token spring but is **clamped to a single overshoot** (`restDelta` tight) so nothing wobbles.
- **Decelerate** = `ease-out` applied to a `dur-slow`/`orb-fill` duration; used only for fills and large reveals.

Framer Motion mapping (implementation reference):
```
const easeOut = [0.22, 0.61, 0.36, 1];
const durFast = 0.14, durBase = 0.24, durSlow = 0.42, fill = 0.8;
const spring = { type: "spring", stiffness: 320, damping: 30 };
const tap = { scale: 0.97 };
```

### 11.2 Global motion rules

1. **Two properties max per element** — typically `opacity` + `transform` (translate/scale). Never animate `width`/`height`/`top`/`left`; use `transform` and `clip-path`. Layout-driving animation uses Framer `layout` with the spring.
2. **Transform + opacity only on the compositor.** No animated `box-shadow`, `filter`, or `backdrop-filter` during a transition — pre-render the blurred glass and cross-fade instead.
3. **Origin-aware.** Surfaces animate *from* the element that spawned them (FAB, tapped card, tab). The transform-origin is the source, not the screen center.
4. **Entrances decelerate, exits accelerate.** Entrances use `ease-out`; exits use `ease-out` at `dur-fast`.
5. **One hero motion per screen at a time.** The Macro Orb is the only continuously-animating element on Home; everything else is quiet until touched.
6. **Never block input.** All transitions are interruptible — a tap during an entrance reverses or completes it immediately; sheets are draggable mid-open.
7. **60fps or it's cut.** If a motion can't hold frame rate on a mid-tier device, it degrades to a cross-fade at `dur-base`.

### 11.3 Motion catalog

Each entry lists the trigger, the exact tokens, direction/origin, and the reduced-motion + low-power fallback. Reduced-motion is honored via `prefers-reduced-motion: reduce`; low-power via the `Save data`/battery-saver signal and an in-app **Low-power mode** flag (auto-set when `navigator.getBattery()` reports ≤20% and not charging, or when the device signals reduced performance).

#### 11.3.1 Page / route transitions

Now that Plato uses real URL routing (replacing `activeTab`), every route change animates.

- **Tokens:** `page transition` — fade + slide, `dur-base` (240ms), `ease-out`. Exit at `dur-fast` (140ms).
- **Direction:** Forward navigation (deeper: Home → Recipe detail) slides new view in from the right +16px with fade 0→1; old view fades 1→0 and slides -8px (parallax lag). Back navigation reverses (in from left). Peer tab switches (Home ↔ Plans) use a pure cross-fade with a 8px vertical rise — no horizontal slide (see 11.3.4).
- **Modals / full-screen sheets** (Log, Paywall, Voice, Recipe viewer) come *up* from the bottom — see 11.3.2/11.3.3.
- **Back/forward gesture:** iOS-style edge swipe drives the transition interactively; the transform tracks the finger 1:1 and settles on the `spring` when released past the 40% threshold, or springs back if not.
- **Reduced motion:** No slide. Instant cross-fade at `dur-fast` (140ms), opacity only.
- **Low power:** Same as reduced motion — opacity-only cross-fade, no parallax, no interactive edge-swipe transform (still functional, just no live tracking — snaps on release).

#### 11.3.2 FAB → sheet expansion (the signature transition)

The center **[ + ]** FAB in the floating nav expands into the Log sheet. This is the app's signature interaction and must feel like the FAB *becomes* the sheet.

- **Tokens:** `spring` (stiffness 320 / damping 30) drives the shape/position morph; content inside fades at `dur-base` (240ms) `ease-out`, delayed 80ms so it appears after the container has substantially grown.
- **Origin & morph:** Transform-origin is the FAB center. The FAB (radius `21`, jade `#43C6AC`) scales and translates up as its corner radius interpolates `21` → sheet radius `22`, expanding to the full sheet width and target height. Use a shared-element (`layoutId="log-surface"`) morph so it's one continuous object, not a fade between two.
- **Backdrop:** Scrim fades `0` → `rgba(7,13,12,.56)` (page-base `#070D0C` at 56%) over `dur-base`, with a `blur(2px)`→`blur(8px)` behind — but the blur is applied to a pre-captured snapshot layer, not animated live.
- **FAB icon:** The `+` rotates 45° into a subtle grab-handle affordance / close cue over `dur-fast`.
- **Collapse:** Reverses on dismiss — sheet morphs back into the FAB at `dur-fast`-weighted spring (faster exit), content fades first (140ms), then the container contracts.
- **Reduced motion:** No morph. Sheet fades up 12px into place at `dur-base`; FAB stays put and the sheet appears as a standard bottom sheet. Icon rotation removed.
- **Low power:** Standard bottom-sheet slide-up (translateY 100%→0, `dur-base`, `ease-out`), no shared-element morph, static scrim (no blur animation, blur rendered once).

#### 11.3.3 Bottom-sheet drag / snap behavior

Applies to Log, Recipe viewer, meal-edit sheet, filter sheets, and any `.sheet` surface.

- **Snap points:** Sheets support up to three detents — `peek` (min content), `half` (≈52% viewport), `full` (top safe-area). Each sheet declares which detents it uses (Log opens at `full`; meal-edit opens at `half`).
- **Drag tracking:** While dragging the grab handle or content-at-scroll-top, the sheet follows the finger 1:1 (no easing on live drag — direct manipulation).
- **Snap settle:** On release, the sheet animates to the nearest detent on the `spring` (stiffness 320 / damping 30), clamped to one overshoot. Snap target is chosen by **projected position** using release velocity (velocity × 0.2s projection), not just current position — a fast flick dismisses even from near the top.
- **Dismiss threshold:** Drag past 40% of the sheet height *or* flick down with velocity > 800px/s dismisses (morphs back per 11.3.2 if it was FAB-spawned, else slides down at `dur-fast`). Below threshold, springs back to the last detent.
- **Rubber-banding:** Dragging above the top detent applies resistance (0.35 multiplier) — the sheet resists over-travel instead of leaving a gap.
- **Scroll-lock coupling:** Inner scroll and sheet drag are mutually exclusive — the sheet only drags when inner content is scrolled to the top and the gesture is downward; otherwise the gesture scrolls content.
- **Handle:** A 36×4px `strong divider` (`rgba(160,215,200,.18)`) pill at top; it brightens to `glass border` on active drag (opacity only, `dur-fast`).
- **Reduced motion:** Drag still tracks the finger (direct manipulation is an accessibility affordance, not decoration), but the *settle* is a linear ease at `dur-fast` with no spring overshoot. No rubber-band bounce — hard clamp at detents.
- **Low power:** Same spring settle but `restDelta` widened so it resolves in fewer frames; no live blur behind the sheet.

#### 11.3.4 Tab switches (bottom nav)

Peer navigation between Home · Plans · Explore · You.

- **Tokens:** Content cross-fade + 8px rise at `dur-base` (240ms) `ease-out`. Active-tab indicator moves at `dur-fast` (140ms) `ease-out`.
- **Indicator:** The active nav item gets a jade `#43C6AC` icon + label (from muted `#5F726D`) and a soft pill/underline that slides between items using `layoutId="nav-active"` on the `spring` — this is the one nav element that uses spring, giving the indicator a lively but controlled glide.
- **Icon micro-motion:** The newly-active icon does a single `.97`→`1.0` scale pop on the `spring` (one overshoot) — a subtle "landed here" confirmation. Deselected icon just fades color.
- **No horizontal slide** between peer tabs (they're siblings, not a stack) — only cross-fade + rise, to distinguish from forward/back route pushes.
- **Reduced motion:** Instant content swap (opacity `dur-fast`), indicator color changes instantly, pill jumps without sliding, no icon pop.
- **Low power:** Cross-fade only, indicator pill slides linearly at `dur-fast` (no spring), no icon pop.

#### 11.3.5 Card stagger-in

Home bento tiles, meal rows (logged/planned), recipe cards, quick-add grid, insights tiles.

- **Tokens:** `stagger` 60ms/item; each item enters with opacity 0→1 and translateY +12px→0 at `dur-base` `ease-out`.
- **Rules:** Stagger caps at **8 items** — items 9+ appear with the 8th's timing (no 2-second cascades on long lists). Off-screen items below the fold do **not** pre-animate; they stagger only when scrolled into view (IntersectionObserver, animate once, then static).
- **Re-entry:** Stagger runs on first mount / first view of a screen. It does **not** re-run on tab return within a session (that would feel busy) — returning to Home cross-fades the already-composed layout.
- **Bento specifics:** Home tiles stagger in reading order (top-left → bottom-right). The Macro Orb tile is exempt from translate — it fades in place while its 3D fill runs (11.3.6).
- **Reduced motion:** No stagger, no translate — all items fade in together at `dur-base` (opacity only).
- **Low power:** Stagger reduced to a single group fade (no per-item delay), opacity only, no translate.

#### 11.3.6 Orb & ring fill animations

The **Macro Orb** (signature WebGL sphere) and the **calorie ring** on Home.

- **Calorie ring:** SVG arc `stroke-dashoffset` sweeps from empty to current % at `ring/orb fill` (800ms, decelerate / `ease-out`). Stroke is the jade→deep gradient; the number in the center counts up with a `tabular-nums` odometer synced to the arc (same 800ms). On over-target, the arc continues past 100% into a second lap tinted warning honey `#E7B67C` (see over-target states in other sections), animating the overflow segment only.
- **Macro Orb (3D):** On Home mount (and on each new log), the WebGL sphere's internal light-fill level rises to match total macros logged over the `ring/orb fill` 800ms decelerate. Idle state: an extremely slow, low-amplitude surface drift + caustic shimmer (the "living" quality) — this is the single continuous animation permitted on Home. Amplitude is subtle; it must read as *alive*, not *busy*.
- **On log:** A new log triggers a gentle orb pulse (scale `1`→`1.02`→`1` on the `spring`, one overshoot) plus a light-fill bump animating the delta over 800ms, so the user *sees* their macros land in the sphere.
- **Rings elsewhere:** Streak ring, water ring, and per-macro completion rings all use the same 800ms decelerate fill.
- **Reduced motion:** No idle drift/shimmer, no orb pulse. The orb renders as a **static duotone gradient PNG fallback** at the correct fill level (state, not motion). Ring/arc fills are replaced by an instant render of the final value (no sweep); the center number shows final value with no count-up.
- **Low power:** Idle drift/shimmer paused entirely; orb becomes a static gradient fallback (WebGL context released to save battery). Ring sweep still runs (cheap SVG) but count-up is dropped. On new log, no 3D re-render — the static fallback swaps to the new fill level with a `dur-base` cross-fade.

#### 11.3.7 Macro-bar fills

Protein / carbs / fat / calorie bars.

- **Tokens:** Fill width animates `transform: scaleX` (origin left) from current to target at `ring/orb fill` 800ms decelerate. Never animate raw `width`.
- **Gradients:** Each bar fills with its canonical §0.7 same-family gradient — protein `--macro-protein` `linear-gradient(90deg,#5FD4C4,#43C6AC)`, carbs `--macro-carb` `linear-gradient(90deg,#F0CC9C,#E7B67C)`, fat `--macro-fat` `linear-gradient(90deg,#ECBFC6,#E1A0AB)`, calories jade. Gradient is painted on the full-width track and revealed by the scaleX mask so the color ramp stays anchored (the gradient doesn't stretch).
- **Delta on log:** When a food is logged, only the affected bars re-animate their delta segment; unaffected bars stay put. A brief 1px highlight sweep (opacity only, `dur-fast`) crosses the newly-added segment.
- **Over-target:** Segment beyond 100% renders in the macro's deepest ramp value with a subtle diagonal hatch (state, not animated); the bar caps its scaleX at the track and shows a `+Xg over` micro-label.
- **Reduced motion:** No fill animation — bars render at final scaleX instantly. No highlight sweep.
- **Low power:** Fill animates (cheap transform) but drops the highlight sweep.

#### 11.3.8 Tap / press feedback

Universal for buttons, cards, chips, nav items, list rows, FAB.

- **Tokens:** On press-down, `scale` → `tap scale` (`.97`) at `dur-fast` (140ms) `ease-out`. On release, spring back to `1.0` (`spring`, one overshoot).
- **Surface response:** Glass cards add a momentary inset brightness (inset highlight `rgba(255,255,255,.05)` → `.09`, opacity only) on press. Primary buttons darken 6% toward on-accent `#04231C`. No ripple (Material ripples are off-brand).
- **Hit target:** Minimum 44×44px touch target regardless of visual size.
- **Chips/toggles:** Selection is a color + fill state change at `dur-fast` plus the press scale; selected chip fills jade `#43C6AC` (dark) / deep `#0F9482` (light) with on-accent text.
- **Disabled:** No scale, no feedback — disabled controls are inert (40% opacity, no motion).
- **Reduced motion:** No scale. Feedback is an opacity/brightness step only (`dur-fast`) so the tap still registers visibly.
- **Low power:** Unchanged — press feedback is cheap and essential; it always runs.

#### 11.3.9 Pull-to-refresh

Home and list screens (Plans, Explore, You).

- **Tokens:** Pull tracks the finger 1:1 with 0.5 resistance past a soft cap. At threshold (64px), a jade progress indicator completes; release triggers refresh and the content settles back on the `spring`.
- **Indicator:** A small arc that fills (0→100%) proportional to pull distance using the macro/jade gradient; at threshold it becomes an indeterminate spinner (rotation at a constant rate) until data returns, then collapses. Ties visually to the ring language.
- **Success:** On data return, the indicator collapses at `dur-fast` and any changed values re-run their fill animations (11.3.6/11.3.7). A single haptic tick fires at threshold-cross (11.4).
- **Reduced motion:** Pull still tracks finger (direct manipulation). Threshold indicator is a static progress arc (no spinner rotation) → swaps to a static "refreshing" dot pulse-free state; content snaps back with a linear `dur-fast` ease, no spring.
- **Low power:** Spinner rotation retained (cheap) but no post-refresh re-animation of fills — values update via a `dur-base` cross-fade instead.

#### 11.3.10 Toast enter / exit

Confirmation and error toasts (e.g. "Logged 1 cup oats", "Couldn't reach the server").

- **Tokens:** Enter — slide up 16px + fade 0→1 at `dur-base` (240ms) `ease-out`, spawning above the floating nav (respecting the ~104px safe-area). Exit — fade + slide down 8px at `dur-fast` (140ms).
- **Dwell:** Success toasts auto-dismiss after 2.6s; error/undo toasts after 5s or until dismissed. A toast with an **Undo** action pauses its timer on hover/touch.
- **Stacking:** Max 2 visible; a third replaces the oldest with the oldest sliding out first. New toast pushes existing ones up on the `spring` (`layout`).
- **Progress hairline:** Optional 1px bottom hairline that depletes over the dwell time (linear) — opacity/scaleX only.
- **Semantic color:** Left accent bar uses the semantic role — success jade `#43C6AC`, danger `#E1616C`, warning honey `#E7B67C`, info aqua `#5FD4C4`.
- **Reduced motion:** No slide — fade only (`dur-base` in, `dur-fast` out). Stack reflow is instant (no spring). Depletion hairline still shrinks (it's a timer, not decoration) but without easing.
- **Low power:** Fade-only enter/exit, no spring stack reflow. Depletion hairline retained.

#### 11.3.11 Skeleton shimmer

Loading placeholders for meals, recipes, search results, insights, food detail.

- **Tokens:** A single diagonal highlight sweeps left→right across skeleton blocks on a **1200ms linear loop** (this is a loop, not a token transition — kept intentionally slow and low-contrast so it reads as "loading," not "flashing"). Skeleton blocks use surface-2 `#121C19` (dark) / surface-3 `#EEF3F0` (light) with the sweep at +6% lightness.
- **Shape fidelity:** Skeletons match the real component's radii (`22` cards, `16` inputs, full pills) and layout so the swap to real content is a quiet cross-fade at `dur-base`, not a jump.
- **Timing:** Skeletons appear only after a 150ms delay (avoid flash on fast responses) and stay a minimum 400ms once shown (avoid flicker). Cross-fade to content at `dur-base`.
- **Reduced motion:** **No shimmer sweep** — skeleton blocks render as static surface-2/-3 fills with a single 60% opacity to signal "pending." Cross-fade to content becomes an instant swap.
- **Low power:** Shimmer sweep paused (static fill), content swap is a `dur-fast` cross-fade.

#### 11.3.12 Celebration bursts — streak & milestone

Earned, rare, and haptic-timed. These are the only "loud" motions in Plato.

- **Streak tick (daily):** Hitting the daily goal advances the streak. The streak counter does a `1`→`1.08`→`1` scale pop on the `spring`, the flame/leaf mark brightens along the jade ramp, and a **small mesh burst** (12–16 duotone particles in jade `#43C6AC` + mint `#8CE0CE`, radial, gravity-eased) plays for ~600ms over the streak tile. Total moment ≤ `dur-slow` (420ms) core + particle tail. One synchronized haptic (11.4).
- **Milestone (7/30/100-day, first plan, goal reached):** Full-screen signature moment — a larger mesh burst using the signature-mesh palette (jade/deep/mint/honey counterpoint) blooms from center, a milestone card scales up from `.9` on the `spring`, and copy states the specific achievement ("7-day streak — you've logged every day this week"). Duration budget: entrance ≤ `dur-slow`; the scene holds until dismissed. Haptic pattern is a light double-tap timed to the burst peak.
- **Plan reveal (onboarding):** The "building your plan" state blooms into the 3D Spline scene as macros lock — the only place a heavy 3D entrance is allowed. Bloom runs on `ease-out` over ~`dur-slow`, macros counting up (`tabular-nums`) as the scene resolves. Lazy-loaded; PNG fallback if 3D unavailable.
- **Frequency guard:** Celebrations are debounced — no two bursts within 3s; batch logging that crosses multiple thresholds fires one combined celebration, not a chain.
- **Reduced motion:** **No particle bursts, no scale pops.** Streak/milestone are communicated by a static state change — the counter updates, the mark brightens (opacity/color, instant), and the milestone card fades in at `dur-base` with its copy. Plan reveal skips the 3D bloom and cross-fades the static plan-ready layout. This is the highest-stakes reduced-motion path — the *achievement* must still land fully; only the *fireworks* are removed.
- **Low power:** Streak tick keeps a lightweight version (scale pop + color, no particle mesh). Milestone shows the card + a small CSS-particle burst (no WebGL mesh). Plan reveal uses the PNG fallback scene, no live 3D.

### 11.4 Haptic feedback moments

Haptics fire via the Vibration API where available (Android/PWA) and are gated behind a **Haptics** setting (default on). Each haptic is paired to a visual moment — never a haptic without a matching on-screen event. iOS PWA lacks reliable haptics; the system degrades silently (visual-only) with no error.

| Moment | Pattern | Notes |
|---|---|---|
| Tap on primary action / FAB | Light (10ms) | Only on commit actions, not every tap |
| Log confirmed | Light tick, synced to orb light-fill bump | The "it landed" cue |
| Sheet snap to detent | Light (8ms) on settle | Once per snap, not during drag |
| Sheet dismiss threshold crossed | Light tick | Fires at the moment dismissal becomes committed |
| Pull-to-refresh threshold crossed | Light tick | At 64px, when release will refresh |
| Toggle / chip select | Very light (6ms) | Selection only, not deselection spam |
| Error / destructive confirm | Sharp double (12ms, 60ms gap) | Danger `#E1616C` moments (delete meal, failed log) |
| Streak tick | Single medium, timed to burst peak | ~half-second into the mesh burst |
| Milestone | Light double-tap, timed to bloom peak | Celebratory, not jarring |

- **Debounce:** No haptic more than once per 60ms; rapid sequences coalesce.
- **Reduced motion:** Haptics are **retained** by default — they're a non-visual accessibility affordance and can substitute for removed motion. (Still user-toggleable.)
- **Low power / battery saver:** Haptics reduced to essential commits only (log confirmed, error) to conserve battery; ambient haptics (chip select, snap) suppressed.

### 11.5 Reduced-motion & low-power — governing behavior

- **Detection:** `prefers-reduced-motion: reduce` for reduced motion; low-power from battery ≤20%-not-charging, `Save-Data`, device performance signals, or manual toggle in **Settings → Motion**. Settings offers three explicit choices: **Full**, **Reduced**, **Off (essential only)** — user choice overrides auto-detection.
- **Principle:** Reduced motion removes *decorative* and *spatial* motion (parallax, slides, orb drift, particle bursts, shimmer, staggers) but preserves *state* and *direct-manipulation feedback* (fills render at final value, drag still tracks the finger, press still shows a brightness step, achievements still land, haptics still fire). Nothing that communicates *what happened* is lost — only *how showily* it happened.
- **Low power** additionally releases the WebGL context (orb → static PNG), pauses all loops (shimmer, orb drift, spinners kept only where cheap), and trims haptics to essentials — prioritizing battery and thermals while keeping the app fully legible and usable.
- **The 3D moments** (Macro Orb, Plan Reveal, celebration meshes) always ship a static gradient/PNG fallback and are lazy-loaded, offscreen-paused, and disabled under both reduced-motion and low-power.

### 11.6 Motion do / don't

**Do**
- Do use `ease-out` for every entrance and the `spring` only for physical interactions (FAB morph, drag-snap, press-release, nav indicator).
- Do animate from the element's own origin — sheets from the FAB, details from the tapped card.
- Do cap staggers at 8 items and only stagger content on first view.
- Do make exits faster than entrances (`dur-fast` out, `dur-base`/`dur-slow` in).
- Do keep the Macro Orb the single ambient motion on Home; let everything else rest.
- Do animate only `transform` and `opacity`; pre-render blur/shadow.
- Do keep every transition interruptible — a tap always wins.
- Do pair every haptic with a visible event, and every celebration with a specific, real achievement message.
- Do ship a static fallback for every 3D and particle moment.

**Don't**
- Don't invent durations, easings, or springs outside the Motion tokens.
- Don't animate `width`, `height`, `top`, `left`, `box-shadow`, or `backdrop-filter`.
- Don't chain or queue blocking animations, or run more than one hero motion per screen at once.
- Don't re-run stagger/celebrations on every tab return, or fire celebrations more than once per 3s.
- Don't use Material ripples, bouncy multi-overshoot springs, spinners longer than needed, or shimmer that flashes.
- Don't animate for longer than the token (no 2-second cascades, no lingering toasts).
- Don't let reduced-motion swallow the *outcome* — remove the fireworks, never the fact that the user succeeded.
- Don't keep WebGL or ambient loops alive under low power or when offscreen.
- Don't over-animate: if a motion doesn't answer *where from / where now / did it register / is progress happening*, cut it.


## 12. Claude Design packaging & implementation plan

This section is the operational bridge between the "Elevated Verdant" spec and shipped code. Part A defines exactly how to feed the spec into Claude Design so every screen comes back on-brand, consistent, and token-locked. Part B defines how to take the Claude Design output and wire it into the real repo — a React 19 + Vite + Tailwind v4 + Framer Motion app with an atoms/molecules/organisms/layout component tree and a state-based `activeTab` shell that we are replacing with a router.

The governing principle for both halves: **the design tokens are law, and Claude Design is a renderer, not a designer.** We never let a generation invent a hex, a radius, a font, or a copy convention. We pass the exact token values in every brief, and we reject any output that drifts.

---

### 12.1 Prerequisites — the token pack you pass to every generation

Before generating any screen, assemble a single **token pack** that is pasted verbatim into every brief (Part A) and lands as CSS variables in the repo (Part B). This is the shared contract; do not paraphrase it per screen.

**`tokens.css` (dark = default `:root`, light = `[data-theme="light"]`)** — replaces the current `src/styles/tokens.css`, which today ships a conflicting `#0B0F1A / #14B8A6 / #6366F1` Inter-based palette. Every value below is canonical.

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
  /* primary interactive shifts to brand-deep for AA on light */
  --brand-jade: #43C6AC; /* ramp unchanged; use --brand-deep for interactive fills on light */
  --ink: #0E1614; --sage: #48605A; --muted: #7E938C; --on-accent: #04231C;
}
```

**Signature dark mesh** (Home/Insights/Onboarding backgrounds) and **glass recipe** are passed as pre-written CSS so Claude Design never re-derives them:

```css
.mesh-dark {
  background:
    radial-gradient(58% 42% at 80% 6%, rgba(67,198,172,.15), transparent),
    radial-gradient(48% 40% at 10% 20%, rgba(15,148,130,.13), transparent),
    radial-gradient(44% 48% at 92% 84%, rgba(231,182,124,.06), transparent),
    radial-gradient(60% 60% at 32% 102%, rgba(95,212,196,.08), transparent),
    linear-gradient(162deg, #08110E, #060B0A, #080F0D);
}
.glass {
  background: var(--glass-fill);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 18px 34px -28px rgba(0,0,0,.9);
}
.glass-nav { backdrop-filter: blur(24px); }
```

**Fonts to ship as assets** (self-contained, no CDN — see 12.9): Bricolage Grotesque (variable, display), Hanken Grotesk (variable, body/UI). Geist is an acceptable body fallback. **Explicitly forbidden: Inter and Space Grotesk** (AI-default tells). System fallback stack is baked into `--font-display`/`--font-ui`.

**Copy conventions** (enforced in every brief): sentence case for all real copy — labels, buttons, headings; never Title Case; never ALL CAPS **except** 10px micro-labels (uppercase, letter-spacing .16–.24em, `--sage`). Active voice. Real, specific copy — no lorem. Tabular-nums on every digit that aligns.

---

### Part A — Claude Design packaging

### 12.2 How generation works and why briefs are strict

Claude Design produces a self-contained HTML bundle (all CSS, fonts, and images inlined) per generation. It is excellent at layout and polish but will happily invent colors, swap fonts, and Title-Case your buttons if you let it. Our defense is a **fixed brief template** with the token pack embedded, generated one screen at a time, with a shared "house rules" block that is byte-identical across every screen. Consistency is a function of *sameness of input*, not of asking nicely.

Generate in this order so later screens can reference earlier ones as visual anchors: **Home first** (it establishes the bento language, the Macro Orb, nav, and top bar), then Onboarding, then the Log hub, then the remaining screens. Re-paste Home's output description into subsequent briefs under "visual anchor" so the model matches established treatments.

### 12.3 The generation brief template

Every screen uses this exact skeleton. Fields in `{{ }}` are the only things that change per screen; everything else — the token pack, house rules, output contract — is copy-pasted identically.

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
{{ PASTE THE FULL tokens.css + .mesh-dark + .glass BLOCK FROM 12.1 }}

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

### 12.4 Do's and don'ts (paste-ready, applies to every generation)

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

### 12.5 Keeping outputs consistent across screens

1. **Byte-identical shared blocks.** The token pack, house rules, and output contract are stored once and pasted unchanged. Any per-screen edit to those blocks is a bug.
2. **One screen per generation.** Never ask for multiple screens in one prompt — quality and token adherence degrade. Generate, review against 12.9 QA, then move on.
3. **Home is the anchor.** After Home passes, copy 1–2 sentences describing its Macro Orb, card, nav, and top-bar treatment into the "visual anchor" of every later brief.
4. **A named component vocabulary.** Every brief refers to the same pattern names (GlassCard, MacroOrb, MacroBar, MealCard, StatTile, PillChip, PrimaryButton, Skeleton, EmptyState, TopBar, FloatingNav, SegmentedTabs, Sheet, Toast). These map 1:1 to repo components in 12.8, so consistency in Claude Design becomes consistency in code.
5. **Two themes, one geometry.** Light and dark differ only in the token values from 12.1 — never in layout, spacing, or radii. Reviewers diff the two themes; any structural difference is rejected.
6. **Reject-and-regenerate over hand-fixing.** If an output drifts on tokens/fonts/case, regenerate with the offending rule bolded rather than patching by hand — hand-patches don't carry to the next screen.

### 12.6 Filled briefs — primary screens

Each brief below is abbreviated to the fields that change per screen (`SCREEN`, `LAYOUT`, `COMPONENTS`, `STATES`, `INTERACTIONS`, `PREMIUM`, light/dark note). At generation time, wrap each in the full 12.3 skeleton with the token pack and house rules.

#### Home
- **Purpose:** at-a-glance daily status and the fastest path to logging.
- **Top bar:** avatar (opens You), centered wordmark, streak flame with count, premium pill (if trial/free).
- **Layout (bento):** row 1 — full-width hero card with the **Macro Orb** (signature WebGL sphere that fills with light as macros are logged) and the day's calorie number (34px, 800) with "left" / "over" label. Row 2 — three MacroBar cards (protein aqua `--macro-protein`, carbs honey `--macro-carbs`, fat rose `--macro-fat`), each a same-family gradient fill. Row 3 — Water tile (StatTile with goal/target ring) + quick-stat tile side by side. Row 4 — "Today" section head, then logged MealCards; below, "Planned" MealCards from the active plan with a quick-add affordance.
- **Components:** MacroOrb, GlassCard, MacroBar, StatTile, MealCard, PillChip, SectionHead.
- **States:** default (orb partially filled); **empty** (no logs — orb dim, copy "Log your first meal to light up your day", primary "Log breakfast"); **loading** (orb static gradient fallback + shimmering bars/cards); **error** (inline banner "Couldn't load today's log — retry"); **offline** (banner "Offline — showing last saved day", logging still queues locally); **over-target** (calorie number and orb rim use `--danger`, copy "320 kcal over").
- **Interactions:** tap orb → Log hub; tap MacroBar → macro detail sheet; tap planned meal → log it; pull-to-refresh; tap scale .97; reduced-motion disables orb fill animation (static gradient) and card parallax.
- **3D:** Macro Orb is one of the four sanctioned WebGL moments — lazy-load, pause offscreen, PNG fallback, respect low-power/reduced-motion.
- **Light/dark:** dark uses `.mesh-dark` page bg + `--surface` glass cards; light uses `--bg-base` (no mesh), white `--surface-1` cards, orb keeps the brand ramp; interactive accents shift to `--brand-deep` on light for AA.

#### Onboarding steps
- **Purpose:** fast-but-coach hybrid — smart defaults, one focused thing per screen, ~60s to a locked plan, unified dark theme (fixes today's jarring light onboarding).
- **Top bar:** slim progress rail (segmented, sage on `--divider-strong`), back chevron; no nav bar during onboarding.
- **Layout (per step, single focus):** (1) Welcome — wordmark, one-line value prop "Plans that fit your goals, logged in seconds", primary "Get started", secondary "I have an account". (2) About you — name, then age/height/weight/gender/activity with sensible pre-filled defaults, one field group visible at a time. (3) Goal — lose/maintain/gain segmented + optional training/days/diet. (4) Preferences — meals per day, cook time, cuisines, restrictions as PillChips. (5) **Plan reveal** — "building your plan" blooms into a 3D Spline scene as macros lock (sanctioned 3D moment), ending on the calorie/macro targets with primary "Start tracking".
- **Components:** ProgressRail, Input, SegmentedTabs, PillChip, PrimaryButton, PlanRevealScene (Spline).
- **States:** default; **loading** (step 5 shows the reveal animation, min ~1.2s, real values computed via Mifflin-St Jeor — not fake); **error** (if plan compute/sync fails, still show locally computed macros + "We'll sync when you're back online"); **offline** (entire flow works from local compute; sync deferred); **empty** n/a.
- **Interactions:** one primary action per step; Enter advances; validation inline; tap scale .97; reduced-motion replaces the Spline bloom with a static duotone plan card.
- **3D:** Plan Reveal Spline scene — sanctioned; lazy-load only on step 5, static gradient/PNG fallback.
- **Light/dark:** ship dark as the canonical experience; also emit the light variant for parity, but default to dark to match the app.

#### Log hub
- **Purpose:** the FAB destination — every way to add food in one place.
- **Top bar:** "Log" title, close chevron (it opens as a sheet from the FAB).
- **Layout:** six entry modes as large tiles — **Search** (USDA), **Quick** (common foods), **Manual** (macros), **Voice** (premium), **Scan barcode** (free), **Photo** (premium); Search/Quick/Manual render in-sheet, Voice/Scan/Photo open full-screen capture routes. Below: recent + frequent foods as a two-up grid of QuickAdd cards. (see §0.3 Log hub composition)
- **Components:** SegmentedTabs, SearchField, FoodResultRow, QuickAddCard, MacroInput, PillChip, LockBadge.
- **States:** default; **empty** (no recents — "Search USDA or quick-log your first food"); **loading** (search results shimmer rows); **error** (USDA fetch fails — "Search is down, try quick log"); **offline** (search disabled with note; quick log + recents still work and queue); **over-target** n/a here.
- **Interactions:** typing debounces USDA search; tap result → serving/quantity sheet → confirm; tap scale .97; sheet dismiss on drag-down.
- **Premium:** Voice and Photo tiles show a LockBadge and route free users to the Paywall (Plato Plus, `/upgrade` GlassSheet) with contextual copy ("Voice logging is a Plato Plus feature"). **Scan barcode is free — no LockBadge, no Paywall route** (barcode drives the logging habit; §0.4).
- **Light/dark:** standard glass tiles; light uses white surfaces; lock badges use `--warning` honey trim.

#### Explore (discovery)
- **Purpose:** the `/explore` tab — a browse-and-discover surface for finding food fast: quick-add grid, trending foods, and entry points into logging/plans/recipes (consistent with §5B).
- **Top bar:** "Explore" title; search icon action that opens `/log` in search mode (per §2 top-bar map).
- **Layout (bento):** search-prompt field at top (tap → `/log` search); **quick-add grid** of the user's frequent/recent foods as two-up QuickAddCards (one-tap → meal-confirm sheet); a **trending foods** carousel/row of FoodResultRows; discovery entry-point tiles (browse recipes → `/plans/recipes`, restaurant → `/plans/restaurant`, generate a plan → `/plans/week`); optional category PillChips to filter the grid.
- **Components:** SearchField, QuickAddCard, FoodResultRow, PillChip, SectionHead, StatTile, FoodImage.
- **States:** default; **empty** (new user, no history — "Log a meal or two and your quick-adds show up here"; still show trending + entry points); **loading** (grid + trending shimmer); **error** ("Couldn't load Explore — retry"); **offline** (recents/quick-adds from cache work and queue; trending disabled with a note); **over-target** n/a.
- **Interactions:** tap a quick-add → meal-confirm sheet (shared logger); tap trending item → serving/quantity sheet → confirm; tap an entry-point tile → routes to the named screen; tap search → `/log` search mode; tap scale .97.
- **Premium:** none — Explore is free; a Plus-gated destination it links to (e.g. restaurant) shows its own LockBadge on that screen, not here.
- **Light/dark:** glass cards; light uses white surfaces; trending row uses FoodImage tiles with `--hairline` borders; category chips active in `--brand-jade` (dark) / `--brand-deep` (light).

#### Plans
- **Purpose:** the 7-day plan plus recipes and restaurant entry points.
- **Top bar:** "Plans" title, contextual action (regenerate / share).
- **Layout:** SegmentedTabs — **My plan** (7-day), **Recipes**, **Restaurant** (premium). My plan: day selector row of PillChips, then per-slot MealCards with edit and swap affordances; footer stats (day totals vs targets). Plan-level actions: export/share (PDF), regenerate.
- **Components:** SegmentedTabs, DaySelector, MealCard, SwapButton, StatTile, PrimaryButton, ShareSheet.
- **States:** default; **empty** (no plan — "Generate a plan tailored to your goals", primary "Generate plan"); **loading** (generating — skeleton day + progress copy); **error** ("Couldn't generate — try again"); **offline** (view cached plan; generate disabled with note); **over-target** (a day exceeding targets flags the footer stat in `--danger`).
- **Interactions:** tap meal → recipe/detail; swap → Concierge Swaps (premium); edit meal (not just delete); export → PDF share sheet.
- **Premium:** Restaurant tab and Concierge Swaps are gated; show LockBadge + Paywall route.
- **Light/dark:** as house rules; segmented control uses `--surface-2` track, `--brand-jade` active.

#### Restaurant (premium)
- **Purpose:** find on-menu items that fit today's remaining macros.
- **Top bar:** "Restaurant" title, search.
- **Layout:** search + cuisine PillChips; result list of RestaurantItem cards (name, item, calories, macro chips, "fits your day" badge when within remaining targets).
- **Components:** SearchField, PillChip, RestaurantItem, FitBadge, LockOverlay.
- **States:** free user → **locked** full-screen LockOverlay with upsell + "Start free trial"; premium default; **empty** (no matches — "No items fit your remaining macros — widen the filter"); **loading** (shimmer rows); **error** (data fetch fails — retry); **offline** (cached last search + banner).
- **Interactions:** tap item → log it directly with remaining-macro delta shown; tap scale .97.
- **Premium:** entire screen is premium; the LockOverlay is the gate.
- **Light/dark:** fit badge uses `--success` jade; over-remaining chips use `--danger`.

#### Recipes
- **Purpose:** browse, view, and save recipes; add to plan or log.
- **Top bar:** "Recipes" title, search + saved filter.
- **Layout:** bento grid of RecipeCard tiles (FoodImage, title, calories, macro chips, save heart); tapping opens the RecipeViewer sheet (ingredients, steps, macros, "add to plan" / "log now").
- **Components:** RecipeCard, FoodImage, PillChip, SaveHeart, RecipeViewer (sheet), PrimaryButton.
- **States:** default; **empty saved** ("No saved recipes yet — tap the heart to save"); **loading** (image-placeholder shimmer grid); **error** (retry); **offline** (saved recipes available from synced cache; browse-new disabled with note).
- **Interactions:** save toggles heart and **syncs to backend** (new capability — recipes were localStorage-only); add-to-plan writes into the active plan; tap scale .97.
- **Premium:** none (browsing/saving is free); Concierge Swaps within a recipe is premium.
- **Light/dark:** cards white on light; save heart uses `--macro-fat` rose when active.

#### Grocery
- **Purpose:** auto-built shopping list from the active plan, plus manual items.
- **Top bar:** "Grocery" title, clear-checked action.
- **Layout:** sectioned checklist grouped by aisle/category; each row is a GroceryItem with checkbox, name, quantity; sticky "add item" field; progress "12 of 20 got".
- **Components:** SectionHead, GroceryItem (checkbox row), Input, ProgressPill.
- **States:** default; **empty** ("Your list builds from your plan — generate a plan or add items"); **loading** (shimmer rows); **error** (retry); **offline** (fully functional from cache; edits queue and sync).
- **Interactions:** check/uncheck with tap scale .97; swipe to delete; add manual item; checked items collapse to bottom.
- **Premium:** none.
- **Light/dark:** checked rows drop to `--muted` with strike; category heads use micro-labels.

#### You / Profile
- **Purpose:** identity, goals, quick stats, and entry points to Weight, Insights, Billing, Settings.
- **Top bar:** "You" title, edit action.
- **Layout:** avatar + name + goal summary card; StatTile row (current weight, streak, plan adherence); a list of destinations (Weight, Insights, Achievements, Grocery, Billing & subscription, Settings, Help); sign-in/out state.
- **Components:** ProfileHeader, StatTile, ListRow (with chevron), Avatar, PremiumBadge.
- **States:** default (signed in); **guest** ("Create an account to sync across devices" + primary); **loading** (header + tiles shimmer); **error** (profile load fails — cached values + retry); **offline** (cached profile, edits queue).
- **Interactions:** each ListRow routes (real URL, see Part B router); edit opens profile sheet; tap scale .97.
- **Premium:** premium badge if subscribed; "Billing & subscription" always present.
- **Light/dark:** avatar radius 13; list dividers use `--hairline`.

#### Weight
- **Purpose:** log and trend body weight against goal.
- **Top bar:** "Weight" title, add-entry action.
- **Layout:** hero current weight (34px, 800, tabular-nums) + delta vs goal; trend chart (duotone line, jade over faint grid); list of recent entries with edit/delete.
- **Components:** HeroStat, TrendChart, EntryRow, AddEntrySheet, StatTile.
- **States:** default; **empty** ("Add your first weigh-in to see your trend"); **loading** (chart skeleton); **error** (retry); **offline** (log queues, chart from cache).
- **Interactions:** add entry sheet; edit/delete entries; scrub chart for values; reduced-motion disables chart draw-on animation.
- **Premium:** none.
- **Light/dark:** chart line `--brand-jade`; grid `--hairline`; goal marker `--macro-carbs` honey.

#### Insights
- **Purpose:** weekly/period analytics — adherence, macro balance, trends.
- **Top bar:** "Insights" title, period selector.
- **Layout (bento):** period SegmentedTabs (**week/month = free**; quarter/year locked behind `insights_pro`); top summary tile (avg calories vs target); macro-balance donut using the duotone set; adherence heat-strip (7/30 cells); a couple of trend mini-charts (calories, protein). Deep-history views, correlations, and export are `insights_pro`.
- **Components:** SegmentedTabs, SummaryTile, MacroDonut, HeatStrip, MiniChart, LockBadge (on pro-only periods/exports).
- **States:** default; **empty** ("Log a few days to unlock insights"); **loading** (tiles + charts shimmer); **error** (retry); **offline** (cached period + banner).
- **Interactions:** switch period (free periods render; tapping a locked quarter/year period or export routes to the Paywall); tap a cell → that day's detail; reduced-motion disables chart animation.
- **Premium:** **basic Insights is free** — current week + current month. Only **depth** is Plato Plus (`insights_pro`): longer history, quarter/year, correlations, and export show a LockBadge and route to the Paywall (§0.4).
- **Light/dark:** donut segments use `--macro-*`; heat-strip empty cells `--surface-2`, filled scale toward `--brand-jade`.

#### Paywall
- **Purpose:** convert free/trial users to **Plato Plus**; explain the 48h trial.
- **Surface:** routable bottom **GlassSheet** at `/upgrade`, **not** a full-screen or centered modal (§0.8).
- **Top bar:** close chevron only (dismisses the sheet).
- **Layout:** headline "Unlock everything Plato Plus can do"; benefit rows mapping to the five gated features (`voice_ai` voice log AI, `photo_ai` photo logging, `restaurant_mode` restaurant mode, `concierge_swaps` concierge swaps, `insights_pro` insights pro — deep history + export); plan toggle (monthly/annual) with price; primary "Start 48-hour free trial"; fine print (renews, cancel anytime); restore purchases. **Do not list barcode as a Plus benefit — barcode is free (§0.4).**
- **Components:** BenefitRow, PlanToggle, PriceTag, PrimaryButton, LegalFinePrint.
- **States:** default; **loading** (Stripe checkout spinner on primary); **error** ("Payment couldn't start — try again"); **trial-active** ("You're on a free trial — 31h left"); **offline** ("Reconnect to start your trial").
- **Interactions:** primary opens Stripe checkout; toggle swaps price; tap scale .97.
- **Premium:** this *is* the gate; contextual variant accepts a `reason` (e.g., "voice") to lead with the relevant benefit.
- **Light/dark:** primary uses `--brand-jade` (dark) / `--brand-deep` (light) for AA; benefit check icons `--success`.

#### Billing
- **Purpose:** manage an active subscription (Stripe) — plan, renewal, payment method, cancel.
- **Top bar:** "Billing & subscription" title, back.
- **Layout:** status card (plan name, price, renewal date, trial countdown if applicable); manage rows (change plan, update payment method → Stripe portal, billing history); danger row "Cancel subscription".
- **Components:** StatusCard, ListRow, StripePortalButton, DangerRow, InvoiceRow.
- **States:** default (active); **trial** (countdown + "You'll be charged on <date>"); **canceled** ("Access ends <date>", CTA to resubscribe); **loading** (status shimmer); **error** ("Couldn't load billing — retry"); **offline** ("Reconnect to manage billing").
- **Interactions:** manage actions deep-link to Stripe customer portal; cancel shows a confirm sheet with retention copy.
- **Premium:** visible to subscribers/trialists; free users see the Paywall instead.
- **Light/dark:** cancel/danger row uses `--danger`; status accents `--success`.

#### Settings
- **Purpose:** preferences — theme, units, notifications, water goal, account, data.
- **Top bar:** "Settings" title, back.
- **Layout:** grouped list — Appearance (theme: system/dark/light), Units (metric/imperial), Goals (water target, calorie/macro overrides), Notifications, Account (email, password reset, sign out), Data (export, delete account), About (version, help).
- **Components:** SettingsGroup, ToggleRow, SegmentedRow, StepperRow, ListRow, DangerRow.
- **States:** default; **loading** (rows shimmer on first load); **error** (save fails — inline "Couldn't save, retry"); **offline** (changes apply locally and queue).
- **Interactions:** toggles/steppers write immediately and sync; theme switch flips `[data-theme]`; password reset opens the reset flow.
- **Premium:** none.
- **Light/dark:** theme control previews both; group heads are micro-labels.

#### Auth
- **Purpose:** sign up / log in / reset password.
- **Surface:** routable bottom **GlassSheet** (`/auth/login · /auth/signup · /auth/reset/:token`), **not** a centered modal (§0.8).
- **Top bar:** close chevron (dismisses the sheet) or back within the reset flow.
- **Layout:** SegmentedTabs (Sign up / Log in); email + password fields; primary; "Forgot password?" → reset step (email → "Check your inbox" confirmation → new-password screen from link). Social/guest continue if applicable.
- **Components:** SegmentedTabs, Input, PasswordField, PrimaryButton, InlineError, ResetFlow.
- **States:** default; **loading** (primary spinner); **error** (inline field errors — "That email's already in use", "Wrong password"); **empty** (fields not yet filled — primary disabled); **offline** ("You're offline — connect to sign in"); **reset-sent** (confirmation state).
- **Interactions:** validate inline; Enter submits; reset flow is multi-step; tap scale .97.
- **Premium:** none.
- **Light/dark:** field focus ring `--brand-jade`; error text `--danger`.

#### Empty / Error (shared system)
- **Purpose:** one consistent visual system for all empty, error, offline, and 404 states.
- **Layout:** centered fluid **duotone illustration** (sanctioned "empty state" 3D/illustration moment), a sentence-case headline, one line of guidance, and a single primary action.
- **Components:** EmptyState (illustration + headline + body + action), ErrorState, OfflineBanner, NotFound (404), ErrorBoundaryFallback.
- **States:** empty (per-screen copy, from each brief above); generic error ("Something went wrong — try again"); offline banner (global, sticky top); 404 ("This page doesn't exist" + "Go home"); crash boundary ("Plato hit a snag" + reload).
- **Interactions:** primary retries or routes home; reduced-motion swaps animated illustrations for static duotone PNGs.
- **3D:** empty-state illustrations are sanctioned; keep them CSS/SVG duotone with a static fallback.
- **Light/dark:** illustrations use `--macro-*` duotone pairs; text `--ink`/`--sage`.

---

### Part B — Import & implement plan

### 12.7 Phased plan

The Claude Design output is a self-contained HTML bundle per screen (inline CSS/fonts/images). We do **not** ship that HTML — we harvest its tokens, structure, and copy into the existing React/Tailwind component tree. Work proceeds in four phases; **do not start a phase until the previous one is verified.**

**Phase 0 — Import & inventory (staging).** Use the `import-claude-design-from-url` tool (12.10) to bring each screen's public bundle into Vercel for side-by-side reference, and save the raw bundles under `docs/design/` in the repo as the visual source of truth. Diff each screen's emitted CSS against the 12.1 token pack; log any drift for reject-and-regenerate before writing code.

**Phase 1 — Foundations / tokens.** Land the design system before any screen.
- Replace `src/styles/tokens.css` wholesale with the 12.1 `tokens.css` (dark `:root` + `[data-theme="light"]`). This kills the legacy `#0B0F1A / #14B8A6 / #6366F1` Inter palette and the three conflicting macro palettes.
- Add `.mesh-dark`, `.glass`, `.glass-nav` to `src/styles/components.css`; delete conflicting legacy classes in `src/index.css` (`.glass-card`, `.gradient-text` with old hexes, `.app-bg-dark/light`, `.stat-number` old gradient, `.btn-primary-premium` old green). Keep the file's `@import "tailwindcss"` line.
- Add the font assets (Bricolage Grotesque, Hanken Grotesk) under `src/assets/fonts/` with `@font-face` in a new `src/styles/fonts.css`; wire `--font-display`/`--font-ui`. Remove the `* { font-family: "Inter" }` rule.
- Map the tokens into Tailwind v4's `@theme` in `src/index.css` so utilities (`bg-surface-1`, `text-ink`, `rounded-card`, etc.) resolve to the vars — Tailwind v4 is config-in-CSS, so this is where token→utility binding lives.
- Add a `motion.js`-backed reduced-motion helper and the motion tokens.
- **Verify:** app boots on the new tokens; existing screens re-skin without layout breakage; `grep` shows no remaining `#14B8A6`, `#6366F1`, `Inter`, or `Space Grotesk`.

**Phase 2 — Shell / nav / router.** Replace the state-based `activeTab` shell with real routing.
- Introduce a router (React Router v7 / `react-router-dom`). Add routes for every screen in 12.6, browser back/forward, deep links, shareable URLs, a 404 route, and an error boundary (replaces today's URL-less `activeTab` switch in `App.jsx`).
- Rebuild `MainLayout` around the router `<Outlet/>`; upgrade `BottomNav` to the floating glass nav (Home · Plans · [FAB +] · Explore · You) using `.glass-nav`, and `TopBar` to the contextual top bar. Keep `Drawer` only if still needed after You/Profile absorbs its destinations; otherwise retire it.
- Move the Welcome→Onboarding gate from `App.jsx` local state into route guards.
- Wrap the tree in an `ErrorBoundary` with the `ErrorBoundaryFallback` from the Empty/Error system.
- **Verify:** every URL loads its screen; back/forward works; 404 and error boundary render; nav clears the 104px safe area; page transitions are fade+slide 240ms and respect reduced-motion.

**Phase 3 — Screens.** Rebuild each screen against its Claude Design reference, one at a time, in Home→Onboarding→Log→…→Empty/Error order (same order they were generated, so anchors line up). For each screen: build/refresh the atoms/molecules/organisms it needs (12.8), then the page, then wire all states from its brief (default/empty/loading/error/offline/over-target). Land the four sanctioned 3D moments (Macro Orb, Plan Reveal, empty illustrations, celebrations) behind lazy-load + static fallback + reduced-motion/low-power guards.
- **Verify per screen:** matches the reference in dark and light; all states reachable; no legacy hexes/fonts; QA checklist (12.9).

**Phase 4 — Gap-fix backend & wiring.** Close the product gaps the redesign exposes, in dependency order:
1. **Deep-link routing polish** (finish shareable links / plan-share URLs from Phase 2).
2. **Backend sync for meal plans & saved recipes** (today localStorage-only) — add endpoints + client sync; Recipes save-heart and Plans now round-trip.
3. **Stripe billing** — checkout, customer portal, webhook; the 48h trial; **premium gating enforced client and server** for the five gated features (`voice_ai`, `photo_ai`, `restaurant_mode`, `concierge_swaps`, `insights_pro`). Barcode is **free** and never gated (§0.4).
4. **Real AI voice logging** (LLM macro extraction, replacing Web Speech heuristics), then **barcode scanning** and **AI photo logging** (camera → recognition → macros).
5. **Password reset flow**, **water hydration goal/target**, **meal editing** (not just delete), **plan export/share (PDF)**, **analytics/event tracking**.
- **Verify:** premium locks hold with a tampered client; plans/recipes survive a fresh device via backend sync; trial expiry flips gating; each new capability has its error/offline state.

**Cleanup (spans phases, finalized end of Phase 3):** delete `src/App-Legacy.jsx` (~740KB legacy monolith — dead once the router + rebuilt screens are live), the duplicate `*_Enhanced.jsx` organisms once their canonical versions land, and any legacy style classes superseded by the token system.

### 12.8 Component mapping (Claude Design pattern → repo component)

Named patterns from the briefs map onto the existing atoms/molecules/organisms tree. **Reuse & restyle** where a component exists; **new** where it doesn't; **replace** where the legacy version is off-system.

| Design pattern | Repo location | Action |
|---|---|---|
| PrimaryButton, secondary, ghost | `atoms/Button.jsx` | Restyle to tokens (radius 16, jade/deep fills) |
| Input, PasswordField, MacroInput | `atoms/Input.jsx` (+ new `PasswordField.jsx`) | Restyle + add password/reveal |
| GlassCard | `atoms/Card.jsx` | Restyle to `.glass` recipe |
| PillChip / Badge, LockBadge | `atoms/Badge.jsx` (+ new `PillChip.jsx`, `LockBadge.jsx`) | Restyle + add pill & lock variants |
| IconButton | `atoms/IconButton.jsx` | Restyle (tap scale .97) |
| Skeleton | `atoms/Skeleton.jsx` | Restyle shimmer to `--surface-2` |
| Avatar | new `atoms/Avatar.jsx` | New (radius 13) |
| MacroBar | `molecules/MacroCard.jsx` | Restyle to duotone gradients |
| ProgressRing / water ring | `molecules/ProgressRing.jsx` | Restyle to token colors |
| MealCard | `molecules/MealCard.jsx` | Restyle; add edit affordance |
| StatTile, SummaryTile | `molecules/StatTile.jsx` | Restyle; add variants |
| RestaurantItem, FitBadge | `molecules/RestaurantItem.jsx` | Restyle + fit badge |
| FoodImage | `molecules/FoodImage.jsx` | Keep; token borders |
| RecipeCard, SaveHeart | new `molecules/RecipeCard.jsx` | New (backed by RecipeBook data) |
| GroceryItem, ListRow, ToggleRow, StepperRow | new `molecules/*` | New rows for Grocery/Settings/You |
| TrendChart, MiniChart, MacroDonut, HeatStrip | new `molecules/charts/*` | New (Weight/Insights) |
| MacroOrb (WebGL) | new `organisms/MacroOrb.jsx` | New, lazy + fallback |
| MacroDashboard (Home macro area) | `organisms/MacroDashboard.jsx` | Restyle to bento |
| Log hub | `pages/LogMeal.jsx` + `organisms/MealLogger.jsx`, `FoodSearch.jsx` | Rebuild as sheet with mode tiles |
| VoiceLog | `organisms/VoiceLogOverlay.jsx` (canonical) | Restyle; retire `VoiceLogModal.jsx` + `VoiceLogModal_Enhanced.jsx` |
| Restaurant | `organisms/RestaurantBrowser.jsx` (canonical) | Restyle; retire `RestaurantBrowser_Enhanced.jsx` |
| MealPlanViewer, SwapButton | `organisms/MealPlanViewer.jsx`, `organisms/SmartSwaps.jsx` | Restyle; add edit + PDF share |
| RecipeViewer, RecipeBook | `organisms/RecipeBook.jsx` (+ new `RecipeViewer.jsx` sheet) | Restyle; add backend save |
| GroceryList | `organisms/GroceryList.jsx` | Restyle to sectioned checklist |
| WeightTracker | `organisms/WeightTracker.jsx` | Restyle + TrendChart |
| Insights | new `organisms/Insights.jsx` (+ `pages/Insights.jsx`) | New |
| SettingsPanel | `organisms/SettingsPanel.jsx` | Restyle; add water goal, theme, reset |
| AuthModal, ResetFlow | `organisms/AuthModal.jsx` (+ new `ResetFlow.jsx`) | Restyle + add reset |
| Paywall | `organisms/PremiumPaywallModal.jsx` | Restyle; wire Stripe + `reason` |
| Billing | new `organisms/Billing.jsx` (+ `pages/Billing.jsx`) | New (Stripe portal) |
| Toast | `organisms/Toast.jsx` | Restyle to tokens |
| EmptyState, ErrorState, NotFound, ErrorBoundaryFallback, OfflineBanner | new `organisms/system/*` | New shared system |
| FloatingNav | `layout/BottomNav.jsx` | Replace with floating glass nav |
| TopBar | `layout/TopBar.jsx` | Restyle to contextual top bar |
| Drawer | `layout/Drawer.jsx` | Retire if You absorbs it |
| MainLayout | `layout/MainLayout.jsx` | Rebuild around router `<Outlet/>` |
| FAB | `layout/FAB.jsx` | Restyle (radius 21) → opens Log sheet |

**Replace vs keep summary:**
- **Replace:** `src/styles/tokens.css` (legacy palette/Inter), legacy classes in `src/index.css`, the `activeTab` switch in `App.jsx`, `MainLayout`/`BottomNav`/`TopBar` chrome.
- **Keep & restyle:** all atoms/molecules and the canonical organisms; `context/AppContext.jsx` state shape (extend, don't rewrite); `lib/api.ts`, `hooks/*`, `services/*`, `utils/*`.
- **Delete:** `src/App-Legacy.jsx` (~740KB dead monolith, removed after Phase 3), `VoiceLogModal.jsx`, `VoiceLogModal_Enhanced.jsx`, `RestaurantBrowser_Enhanced.jsx` (duplicates), `pages/WelcomeScreen.tsx` legacy styling (rebuild), and superseded style classes.

### 12.9 The `import-claude-design-from-url` tool

Each Claude Design screen is published to a **public HTTPS URL** valid for ~1 hour, returning a **self-contained HTML bundle** (all images, fonts, styles inlined). Import each with:

```
import-claude-design-from-url({
  url:   "https://<claude-design-public-bundle-url>",   // valid ~1h, fetched server-side
  title: "Plato — Elevated Verdant — <ScreenName>"       // e.g. "…— Home"
})
```

Usage rules:
- **One call per screen**, titled `Plato — Elevated Verdant — <ScreenName>`, so imports stay individually referenceable in Vercel.
- URLs expire in ~1 hour — import promptly after generating, or re-export.
- The bundle is fetched server-side and must be **fully self-contained** (no CDN/remote fonts/images) — this matches our house-rule output contract, so a bundle that fails to import cleanly is a signal it violated the contract; regenerate.
- Imports are the **visual reference and staging** target, not the shipped app. Also archive each raw bundle under `docs/design/<screen>.html` in the repo so implementers diff against a stable copy after the URL expires.

### 12.10 QA / verification checklist

Run per screen (Phase 3) and again on the full app before release. A screen is not "done" until every box passes in **both themes**.

**Mobile fit**
- [ ] Renders correctly at 430px and down to 360px; no horizontal scroll; single column.
- [ ] Content clears the floating nav (104px bottom safe-area) and respects `env(safe-area-inset-*)` on notched devices.
- [ ] Tap targets ≥ 44px; sheets dismiss on drag-down; scroll is contained.

**Light / dark**
- [ ] Both themes ship from one build; toggling `[data-theme="light"]` never changes layout, spacing, or radii — only token values.
- [ ] Dark uses `.mesh-dark`; light uses plain `--bg-base` with no mesh.
- [ ] Interactive fills use `--brand-jade` (dark) / `--brand-deep` (light) and pass AA (see a11y).

**Reduced motion**
- [ ] `prefers-reduced-motion: reduce` disables orb fill, parallax, chart draw-on, Plan Reveal Spline, and celebration bursts; static gradient/PNG fallbacks show instead.
- [ ] No essential information is conveyed by motion alone.

**Accessibility (a11y)**
- [ ] Text contrast ≥ AA: body/ink on surfaces, `--sage` secondary, and every accent-on-surface pairing (verify jade/deep on light).
- [ ] All interactive elements keyboard-focusable with a visible `--brand-jade` focus ring; logical tab order; Enter/Escape work in sheets/modals.
- [ ] Semantic roles/labels: nav, buttons, form fields (`aria-label`/`for`), live regions for toasts and async errors; images have alt text or are marked decorative.
- [ ] Charts and the Macro Orb expose a text equivalent (values in the DOM, not only visual).
- [ ] Micro-labels' letter-spacing/uppercase is cosmetic only; underlying copy is sentence case for screen readers.

**Performance**
- [ ] Heavy 3D (Macro Orb, Plan Reveal) is lazy-loaded, paused offscreen, and skipped under low-power/reduced-motion; a static fallback renders instantly.
- [ ] Fonts are self-hosted, subset, and `font-display: swap`; no layout shift on font load (CLS ≈ 0).
- [ ] No CDN/remote requests at runtime (fonts, images, scripts all local).
- [ ] Route-level code splitting; `App-Legacy.jsx` and duplicate organisms removed from the bundle; verify final bundle size dropped versus pre-redesign.
- [ ] Skeletons appear within one frame on slow networks; offline banner shows and cached content still renders.

**Copy & tokens (regression guard)**
- [ ] No Title Case or ALL CAPS outside 10px micro-labels; all copy is real and specific.
- [ ] `grep` finds no `#14B8A6`, `#6366F1`, `#0B0F1A`, `Inter`, or `Space Grotesk`; every color resolves to a token from 12.1.
- [ ] tabular-nums on all aligned digits; hero stats are 800 weight at 34/30px.

**Product / gaps (Phase 4)**
- [ ] Deep links, back/forward, 404, and error boundary all work; plan/recipe share URLs resolve.
- [ ] Meal plans and saved recipes survive a fresh device via backend sync.
- [ ] Premium gating holds against a tampered client (server-enforced); 48h trial starts, counts down, and expires correctly; Stripe checkout, portal, and cancel all round-trip.
- [ ] Voice/barcode/photo logging produce correct macros or fail into a clear error/offline state; password reset completes end-to-end.
