# Plato

AI-assisted nutrition and meal-planning app — log meals, track macros, and get personalized targets without the spreadsheet.

<!-- TODO: add screenshot or GIF of the meal log / dashboard -->

**Live demo:** [eatplato.app](https://eatplato.app)

## What it does

Plato replaces manual macro tracking with a fast logging flow backed by the USDA FoodData Central database: search or scan a food, log it, and see calories/protein/carbs/fat roll up against a daily target automatically. It also tracks weight and water intake over time, computes a logging streak to encourage consistency, and generates meal plans from a user's onboarding profile (goals, restrictions, macro targets).

## Tech stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Framer Motion
- **Backend:** Express + TypeScript (`server.ts`), run via `tsx`
- **Database:** SQLite (`better-sqlite3`)
- **Auth:** JWT, bcrypt password hashing
- **Nutrition data:** USDA FoodData Central API
- **Hosting:** Vercel (frontend), Railway (backend)

## Architecture

The Express server in `server.ts` owns auth, meal/water/weight logging, and profile endpoints under `/api/*`, backed by a local SQLite database. In production it also serves the built Vite frontend directly (`app.get('*', ...)` fallback to `index.html`), so the whole app can run as a single Railway service; the Vercel deployment is a separate static frontend that talks to the Railway API via `VITE_API_URL`. USDA lookups are proxied server-side so the API key never reaches the client, and fall back to USDA's public `DEMO_KEY` (rate-limited) when no key is configured.

## Running locally

```bash
npm install
cp .env.example .env   # fill in JWT_SECRET at minimum
npm run dev:full        # Express API + Vite dev server on :3000
```

Or run the frontend only against a remote API with `npm run dev`.

## Deployment

Frontend deploys to Vercel (`vercel.json` handles the SPA rewrite). The Express backend deploys to Railway; point the Vercel frontend at it via `VITE_API_URL`. Both need `JWT_SECRET` set to a real random value — the server refuses to boot in production without it.

## Status / roadmap

Core logging, streaks, and meal plans are live. Stripe-based premium tier is scaffolded in `.env.example` but not yet wired up.
