---
name: anime-js
description: Integrate anime.js 3.2.2 for rich, timeline-based animations across the Odyssey hunt. Use for shuttle travel, typewriter, progress fills, avatar reveals, and micro-interactions. Zero extra build config — installed via npm animejs.
---

# Anime.js 3.2.2 — Odyssey Skill

Stable anime.js (3.2.2) is installed at `frontend/node_modules/animejs`. Import as:

```js
import anime from 'animejs'
```

## Odyssey conventions

- **Durations:** 180-380ms for micro (button, reveal), 1400-2000ms for travel.
- **Easing:** `easeOutCubic` for entrances, `easeInOutSine` for loops, `easeOutExpo` for hero.
- **Targets:** Prefer `ref` or `class` scoped to component. Never animate `body`.
- **Cleanup:** Always `anime.remove(target)` in `useEffect` cleanup.
- **Wrapper:** `frontend/src/lib/anime.js` re-exports `anime` plus helpers `fadeUp`, `typewriterPulse`, `shuttleDrift`.

## Where it's wired

- `ShuttleTravel.jsx` — shuttle bob + exhaust + starfield drift
- `StoryCards.jsx` — Dialogue typewriter cursor blink + card slide-up stagger
- `ProgressBar.jsx` — starlane fill + node pop
- `Leaderboard.jsx` — row stagger on mount, progress bar fill
- `App.css` — CSS keyframes kept as fallback for `prefers-reduced-motion`

## Helpers in frontend/src/lib/anime.js

- `fadeUp(el, delay)` — slideUp + fadeIn
- `pulseOnce(el)` — scale 1 → 1.03
- `shuttleLoop(shuttleEl, exhaustEl)` — infinite bob + flicker
- `starfield(el)` — drift 2s loop
- `progressFill(el, pct)` — width 0 → pct%

Use helpers over raw `anime({...})` for consistency.
