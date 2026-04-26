---
title: Vite env vars always evaluate as strings in conditional checks
date: 2026-04-26
category: docs/solutions/ui-bugs/
module: stb
problem_type: ui_bug
component: tooling
symptoms:
  - VITE_SHOW_AD environment variable set to "true" never triggered ad display
  - Conditional `import.meta.env.VITE_SHOW_AD === true` always evaluated to false
root_cause: config_error
resolution_type: code_fix
severity: medium
tags: [vite, env-vars, typescript, frontend]
---

# Vite env vars always evaluate as strings in conditional checks

## Problem
When adding a feature to show ads based on the `VITE_SHOW_AD` environment variable, the ad modal never appeared even when the env var was set to `true` in `.env`.

## Symptoms
- Ad modal configured via `VITE_SHOW_AD=true` in `.env` never displayed
- The conditional check `import.meta.env.VITE_SHOW_AD === true` always failed

## What Didn't Work
Comparing the Vite env var directly to the boolean `true`:
```typescript
const showAdByDefault = import.meta.env.VITE_SHOW_AD === true;
```
This always evaluates to `false` because Vite environment variables are always strings, not booleans.

## Solution
Compare the env var to the string `"true"` instead of the boolean `true`:

**App.tsx - handlePlay callback:**
```typescript
// Before (broken)
const showAdByDefault = import.meta.env.VITE_SHOW_AD === true;

// After (working)
const showAdByDefault = import.meta.env.VITE_SHOW_AD === "true";

const handlePlay = useCallback(() => {
  if (showAdByDefault) {
    setShowPlayAd(true);
  } else {
    setShowPlayAd(false);
    setShowSplash(false);
    window.history.pushState({}, "");
  }
}, [showAdByDefault]);
```

**game.ts - getDiceForSeed dev rolls feature:**
```typescript
// Before (broken)
const useDevRolls = import.meta.env.VITE_USE_DEV_ROLLS === true;

// After (working)
const useDevRolls = import.meta.env.VITE_USE_DEV_ROLLS === "true";
```

## Why This Works
Vite (and all Vite-based frameworks like Vite + React) inject environment variables as **strings** into `import.meta.env`. Even if you set `VITE_SHOW_AD=true` in your `.env` file, JavaScript sees it as the string `"true"`, not the boolean `true`.

The comparison `=== true` checks for strict equality with the boolean `true`, which fails because `"true" === true` is `false`.

Comparing to the string `"true"` correctly matches the actual type of the env var value.

## Prevention
- **Always treat Vite env vars as strings** in comparisons
- Create a helper function if the pattern is repeated:
```typescript
const isEnvTrue = (key: string): boolean => import.meta.env[key] === "true";
```
- Document this gotcha in project onboarding docs
- Consider using explicit string values like `"1"`/`"0"` or `"yes"`/`"no"` for env-controlled features

## Related Issues
- Related: `docs/solutions/ui-bugs/stb-splash-screen-nav.md` (same project, UI bug context)
