# PLATO - DESIGN SYSTEM & NANOMBANANA SPECIFICATION

## PROJECT OVERVIEW
**Plato** is a premium nutrition & meal planning app with AI-powered meal logging, voice input, personalized meal plans, and social features.

**Visual Direction:** Figma's modernity + Duolingo's friendliness & animations
**Theme:** Dark mode (premium feel)
**Primary Color:** Green (#6B8F71) with accent variations
**Target Platforms:** Web → iOS → Android (mobile-first)

---

## COLOR SYSTEM

### Primary Colors
- **Brand Green:** #6B8F71 (earthy, sophisticated)
- **Accent Green:** #7BA985 (lighter variant for accents)
- **Deep Green:** #4A5F52 (darker for emphasis)

### Neutral Colors
- **Dark BG:** #0F0F0F (almost black, premium feel)
- **Card BG:** #1A1A1A (raised surface)
- **Text Primary:** #FFFFFF (white)
- **Text Secondary:** #A0A0A0 (dim gray)
- **Border:** #2A2A2A (subtle divider)

### Accent Colors
- **Success:** #4CAF50 (green, matches brand)
- **Warning:** #FFA500 (orange)
- **Error:** #FF6B6B (red)
- **Info:** #2196F3 (blue)

---

## TYPOGRAPHY

### Fonts
- **Primary:** Inter (system font, modern)
- **Secondary:** SF Pro Display (iOS-like, clean)

### Sizes & Usage
- **H1 (Headline):** 28px, 700 weight (page titles)
- **H2 (Section):** 20px, 600 weight (section headers)
- **H3 (Subheader):** 16px, 600 weight (card titles)
- **Body Large:** 16px, 400 weight (body text)
- **Body Regular:** 14px, 400 weight (default text)
- **Body Small:** 12px, 400 weight (captions, secondary)
- **Button:** 14px, 600 weight (all buttons)

**Line Height:** 1.5 for body, 1.2 for headings
**Letter Spacing:** -0.02em for headings, 0 for body

---

## SPACING & GRID

### Base Unit: 4px
- **xs:** 4px
- **sm:** 8px
- **md:** 12px
- **lg:** 16px
- **xl:** 24px
- **2xl:** 32px
- **3xl:** 48px

### Grid
- **Desktop:** 12-column
- **Tablet:** 8-column
- **Mobile:** 4-column (full-width with padding)

---

## COMPONENTS

### Buttons
- **Primary Button:** Green BG (#6B8F71), white text, 12px padding, 8px border-radius
  - States: Default, Hover (lighter green), Active (darker), Disabled (gray)
- **Secondary Button:** Transparent, green border, green text
- **Tertiary Button:** Text only, green text
- **Icon Button:** Circular, 40x40px, centered icon

### Cards
- **Default:** Dark BG (#1A1A1A), subtle border (#2A2A2A), 12px border-radius
- **Elevated:** Higher shadow, slight lift animation on hover
- **Padding:** lg (16px) inside

### Input Fields
- **Style:** Dark BG, green border (focus state)
- **Padding:** md (12px)
- **Border Radius:** 8px
- **Focus:** Green outline (#6B8F71), shadow

### Modals
- **Backdrop:** Translucent black (#00000080)
- **Modal BG:** Dark (#1A1A1A)
- **Border Radius:** 16px
- **Padding:** 2xl (32px)

### Bottom Sheet
- **For mobile actions**
- **BG:** Dark (#1A1A1A)
- **Top Border Radius:** 24px
- **Drag Handle:** Small gray bar at top

---

## NAVIGATION

### Bottom Tab Navigation
- **Height:** 64px (mobile), 80px (tablet)
- **Items:** 5 tabs max
  1. **Home** (Dashboard & Quick Log)
  2. **Meals** (View & Plan)
  3. **Profile** (User settings & stats)
  4. **Social** (Friends & feed - *future*)
  5. **More** (Settings, help, etc.)
- **Tab Style:** Icon + label, green when active
- **Safe Area:** Respect notch/home indicator

---

## ANIMATION GUIDELINES

### Timing Functions
- **Fast:** 150ms (micro-interactions)
- **Medium:** 300ms (transitions)
- **Slow:** 500ms (entrance animations)
- **Easing:** ease-in-out (cubic-bezier(0.4, 0, 0.2, 1))

### Common Animations
- **Fade:** Opacity 0 → 1 (200ms)
- **Slide Up:** Transform translateY(20px) → 0 (300ms)
- **Scale:** Scale 0.95 → 1 (250ms)
- **Bounce:** Spring physics for playful interactions
- **Button Tap:** Scale 0.98 (100ms), then back

### Interactions
- **Button Press:** Scale down 2%, haptic feedback
- **Card Hover:** Lift up, shadow increase
- **Input Focus:** Glow effect + border color change
- **Meal Log Success:** Confetti animation + success toast

---

## LAYOUTS

### 1. HOME / DASHBOARD
**Purpose:** Quick overview, fast logging access
**Elements:**
- Header with greeting ("Good morning, [Name]")
- Daily macro progress (donut chart)
- Quick log button (floating action button, prominent)
- Meal summary (what they ate today)
- AI suggestion card (next meal idea)

**Mobile:** Full-width, stacked
**Desktop:** 2-column (left: macros, right: meal feed)

### 2. LOG MEAL (Quick Entry)
**Purpose:** 1-tap meal logging via voice
**Elements:**
- Large microphone button
- Transcription display (live)
- Voice waveform animation
- Auto-detected foods (parsed)
- Portion confirmation (modal)
- Submit button

**Flow:**
1. Tap microphone
2. Speak meal
3. System parses & shows parsed foods
4. Confirm/edit portions
5. Submit & celebrate (animation)

### 3. VIEW MEAL / MEAL DETAIL
**Purpose:** See what they ate, edit, track
**Elements:**
- Meal image (if available)
- Food items (name, portion, macros)
- Macro breakdown (mini chart)
- Edit/delete options
- Notes field

### 4. MEAL PLANS
**Purpose:** Personalized AI plans
**Display Options (toggleable):**
- **Calendar view:** Day-by-day, swipe left/right
- **Card stack:** Swipe through meals
- **List view:** Scroll through day's meals
- **Grid view:** Full week at glance

**Elements per meal:**
- Food name
- Macros (protein, carbs, fats)
- Portion size
- Image
- "Use this meal" button
- Recipe link (if available)

### 5. PROFILE / STATS
**Purpose:** Track progress, settings
**Elements:**
- User avatar + name
- Stats summary (calories logged, streak, etc.)
- Mini charts (weekly progress)
- Edit profile button
- Settings link
- Subscription status

---

## RESPONSIVE BREAKPOINTS

| Device | Width | Layout | Notes |
|--------|-------|--------|-------|
| **Mobile** | < 640px | Single column, bottom nav | Full-width cards, touch-friendly |
| **Tablet** | 640px - 1024px | 2 columns | Slightly larger tap targets |
| **Desktop** | > 1024px | 2-3 columns | Side-by-side layouts |

---

## ACCESSIBILITY

- **Color Contrast:** All text meets WCAG AA (4.5:1 min)
- **Touch Targets:** Minimum 44x44px (mobile)
- **Keyboard Nav:** Full support for desktop
- **Screen Readers:** Semantic HTML, alt text for images
- **Reduced Motion:** Respect prefers-reduced-motion

---

## NANOMBANANA COMPONENT GENERATION ORDER

### Phase 1 (MVP - 2-3 weeks)
1. **Design Tokens** (colors, typography, spacing)
2. **Atomic Components** (buttons, inputs, cards, badges)
3. **Composite Components** (navbar, footer, modals)
4. **Page Layouts** (home, log meal, view meal, plans, profile)
5. **Animations & Interactions**
6. **Navigation & Routing**

### Phase 2 (Social - later)
7. **Profile Pages** (user, friend)
8. **Social Feed** (stories, food posts)
9. **Leaderboards & Challenges**

---

## FILE STRUCTURE (Post-Redesign)

```
src/
├── components/
│   ├── atoms/           (buttons, inputs, badges, etc.)
│   ├── molecules/       (card groups, form groups, etc.)
│   ├── organisms/       (nav, header, footer, etc.)
│   ├── templates/       (page templates)
│   └── layout/          (Layout wrapper)
├── pages/
│   ├── Home.jsx
│   ├── LogMeal.jsx
│   ├── ViewMeal.jsx
│   ├── MealPlans.jsx
│   └── Profile.jsx
├── hooks/               (custom hooks for logging, plans, etc.)
├── services/            (API calls, voice, image generation)
├── theme/               (design tokens, global styles)
├── styles/              (global CSS, animations)
└── utils/               (helpers, constants)
```

---

## NEXT STEP

**NanoBanana Prompt Ready** → Build Phase 1 components
**Timeline:** Quality > Speed (2-3 weeks for solid implementation)
**Success Metric:** Premium feel + intuitive UX + smooth animations
