# Cali Valley — Cali Valley Studios client app

**Built by Grok** (Grok Bot), from the plan signed off in Cali Valley Bots v1.5 — see [`docs/PLAN.md`](docs/PLAN.md).
Native Expo app (iOS / Android through Expo Go) **and** a web version through the Expo Router web target, from one codebase.

- Live web preview: https://cali-valley-studios.travisleeswift.workers.dev
- Design system showcase: https://cali-valley-studios.travisleeswift.workers.dev/design

## Stage status

| Stage | What | Status |
|---|---|---|
| 1 | Tokens, UI components, the Horizon, layout primitives | **Done** |
| 2 | Repository layer, outbox, SAMPLE data | Pending |
| 3 | Questionnaire and communities | Pending |
| 4 | Consultant, guard, brief and send | Pending |
| 5 | Portal, tickets, team, account, read-only owner inbox | Pending |
| 6 | Migration changes, seed users, database tests | Pending |
| 7 | Live sign-in, attachments, realtime, notifications | Pending |
| 8 | Store checklist (eas.json drafted, not run) | Pending |

## Run it on your laptop (web)

Needs Node 20 or newer.

```bash
npm install
npx expo start --web
```

It opens in your browser. Drag the window narrower or wider to see the three layouts:
compact (< 600 pt), medium (600–839) and expanded (≥ 840, two panes).

To build a static copy you can host anywhere: `npx expo export -p web` (output in `dist/`).

## Run it on your phone (Expo Go)

```bash
npm install
npx expo start
```

Install **Expo Go** from the App Store / Play Store and scan the QR code (phone and laptop on the same Wi-Fi).
No Expo account is needed for this.

## What Stage 1 contains

- `src/theme/tokens.ts` — "The Horizon" written as roles: colour roles (ground, surface, raised, hairline, text, text-muted, text-dim, action / on-action, signal, danger, success), type scale (Space Grotesk 700 40/44, 30/36, 22/28, 500 18/24; Inter 16/24, 14/20, 13/18, 11/16 overline +1.6), 4 pt spacing, gutters, radii, motion.
- `src/components/ui.tsx` — Button, Chip, Card, Field, Pill, Empty, Skeleton (1.2 s shimmer), Banner (with the offline banner), Tag (SAMPLE / To be added, dashed action hairline), each to the four-state rule.
- `src/components/Horizon.tsx` — the one line of light: static mark, step progress, Golden hour send (rises and floods gold for 900 ms, fades over 120 ms, settles as the header line; tap skips; Reduce Motion = 160 ms cross-fade).
- `src/components/layout.tsx` + `src/lib/useWidthClass.ts` — Screen (safe areas, gutters, max width 560), TwoPane (≥ 840), StickyFooter (bottom 96 pt, rides the keyboard, stacks at 160 % text).
- `src/lib/prefs.tsx` — Reduce Motion (system + preview switch) and haptics with an off switch. `src/lib/env.ts` — Skia flag (off), placeholders.
- `app/index.tsx` — Welcome. `app/design.tsx` — the showcase of every token, component state and Horizon use at all three widths.
- Placeholder icon and splash: the horizon line on ground.

## Decisions locked by Travis

- The Horizon + Golden hour approved. App name **Cali Valley**. Welcome line: *We design the spec and come up with all the options.* The drawn horizon is the temporary logo; no stock hero footage.
- Sign-in happens at "Request my free quote" (Stage 4/7). Simulated consultant before that point.
- Phone, tablet and web layouts.
- Live consultant (later stage): Travis's own API, 60 turns per user per day plus a studio-wide daily cap, simulated fallback.
- Team members cannot see community answers by default.
- Placeholders until set: response time **2 business days**, reopen window **30 days**, retention **2 years**.
- No Expo accounts, store accounts, bundle IDs or email provider yet.

## Notes

- Expo SDK 58 (latest stable at build time), Expo Router, TypeScript strict. Versions set with `npx expo install`.
- The horizon uses `expo-linear-gradient` + opacity so it runs in Expo Go and on web. The Skia shader is `[CONFIRM]` in the plan; `env.useSkiaHorizon` is off and nothing depends on Skia.
- No secrets or keys anywhere in the app.
- `npm run typecheck` runs `tsc --noEmit`.
- Deploy: `npx expo export -p web && node scripts/deploy-gen.mjs` produces a single Cloudflare Worker with the files embedded.
