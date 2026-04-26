---
title: "Vite env vars are strings, not booleans"
date: 2026-04-26
module: vite-env
problem_type: logic_error
component: development_workflow
symptoms:
  - Boolean comparison using === true failed on Vite env var
  - import.meta.env.VITE_SHOW_AD === true always evaluated to false
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - vite
  - environment-variables
  - boolean-comparison
---

# Vite env vars are strings, not booleans

## Problem

When adding `.env` variables to control features, a comparison using `=== true` failed silently — the feature never activated regardless of the env value.

## Symptoms

- VITE_SHOW_AD env var set to "true" but ad modal never appeared
- Conditional logic with env vars appeared correct but behavior was broken

## What Didn't Work

```typescript
// Wrong: env vars are strings
const showAdByDefault = import.meta.env.VITE_SHOW_AD === true;
```

This evaluates to `false` even when `VITE_SHOW_AD=true` in `.env`, because Vite exposes env vars as strings.

## Solution

Always compare Vite env vars to string literals:

```typescript
// Correct: compare to "true" string
const showAdByDefault = import.meta.env.VITE_SHOW_AD === "true";
```

Full example from App.tsx:

```typescript
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

## Why This Works

Vite injects env vars as strings into `import.meta.env`. Whether you set `VITE_FOO=true` or `VITE_FOO=false`, the value is `"true"` or `"false"` (strings). The `=== true` comparison compares a string to a boolean, always returning `false`.

## Prevention

- When adding Vite env vars, always compare to `"true"` or `"false"` string literals
- For multiple boolean envs, consider a helper function:

```typescript
const envBool = (key: string, defaultValue = false): boolean => {
  const val = import.meta.env[key];
  return val === "true" || (val === undefined && defaultValue);
};
```