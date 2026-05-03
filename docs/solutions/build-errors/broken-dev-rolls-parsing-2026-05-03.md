---
title: Broken dev rolls parsing causes TypeScript build errors
date: 2026-05-03
category: build-errors
module: lock-n-roll
problem_type: build_error
component: tooling
symptoms:
  - 7 TypeScript errors in src/lib/game.ts:69-73
  - Untyped function calls may not accept type arguments
  - Parameters implicitly have 'any' type
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: typescript, dev-mode, dice-parsing, game-ts
---

# Broken dev rolls parsing causes TypeScript build errors

## Problem

The `getDiceForSeed` function's dev mode in `src/lib/game.ts` had two bugs: it split the dev rolls string on the wrong delimiter (comma instead of space), and missing type annotations on chain callbacks caused TypeScript to lose type inference, resulting in 7 build-blocking errors.

## Symptoms

- `error TS2347: Untyped function calls may not accept type arguments.` (line 69)
- `error TS7006: Parameter 's' implicitly has an 'any' type.` (lines 71-72)
- `error TS7006: Parameter 'acc', 'val', 'i', 'arr' implicitly has an 'any' type.` (line 73)
- Build fails completely — `npm run build` cannot proceed

## What Didn't Work

The original code split on comma: `devRollsStr.split(",")`. The dev rolls string format is `"3,3 3,1 3,2"` — space-delimited pairs with comma-separated dice within each pair. Splitting on comma broke the pairs apart into individual numbers and space-containing fragments like `"3 3"`. The code didn't crash because `parseInt("3 3")` silently returns `3`, but it produced only 4 incorrect rolls instead of the intended 8.

## Solution

Replace the broken `.split(",").map().filter().reduce()` chain with a clean space-based split and direct pair parsing:

```typescript
// Before (broken)
const devRolls: [number, number][] = devRollsStr
  .split(",")
  .map((s) => s.trim())
  .filter((s) => s)
  .reduce<[number, number][]>((acc, val, i, arr) => {
    if (i % 2 === 0) {
      acc.push([parseInt(val), parseInt(arr[i + 1])]);
    }
    return acc;
  }, []);

// After (fixed)
const devRolls: [number, number][] = devRollsStr
  .split(" ")
  .map((s: string) => s.trim())
  .filter((s: string) => s)
  .map((pair: string) => {
    const [a, b] = pair.split(",").map(Number);
    return [a, b] as [number, number];
  });
```

Three changes in one:
1. Split on `" "` (space) instead of `","` (comma) to get individual pairs
2. Add explicit `string` type annotations to `.map()` and `.filter()` callbacks
3. Replace `.reduce()` pairing with a direct `.map()` that splits each pair on comma and parses with `Number()`

## Why This Works

Splitting on space correctly separates `"3,3 3,1 3,2"` into `["3,3", "3,1", "3,2"]`. Each pair is then split on comma to get `["3", "3"]`, mapped through `Number()` to get `[3, 3]`, and returned as a typed tuple. The explicit type annotations on the first `.map()` and `.filter()` callbacks give TypeScript enough inference to type the entire chain, eliminating all cascading implicit `any` errors.

## Prevention

- When parsing structured strings with multiple delimiters, verify the primary delimiter matches the actual format before writing the chain
- Always add explicit type annotations to the first callback in a chain when TypeScript struggles with inference — it propagates through the rest
- Run `npm run build` frequently during development to catch TypeScript regressions early

## Related Issues

- Plan: docs/plans/2026-05-03-001-fix-game-ts-type-errors-plan.md
