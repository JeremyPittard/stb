---
title: fix TypeScript errors in game.ts dev rolls parsing
type: fix
status: active
date: 2026-05-03
---

# Fix TypeScript Errors in game.ts Dev Rolls Parsing

## Overview

7 TypeScript errors in `src/lib/game.ts:69-73` related to parsing dev dice rolls. Two bugs: the string split delimiter is wrong, and missing type annotations cause implicit `any` errors.

## Problem Frame

The `getDiceForSeed` function's dev mode parses `VITE_DEV_ROLLS` (default: `"3,3 3,1 3,2 3,3 3,4 3,5 3,6 4,6"`). The format uses spaces between pairs and commas within pairs, but the code splits on comma, which breaks pairs apart. Additionally, the `.reduce` initial value `[]` has no type, causing the generic reduce to lose type inference and cascade implicit `any` errors to all callback parameters.

## Requirements Trace

- R1. Fix the parsing delimiter to correctly split dev roll pairs
- R2. Add type annotations to eliminate implicit `any` errors
- R3. `npm run build` passes with zero TypeScript errors

## Scope Boundaries

- Fix only `src/lib/game.ts` lines 65-87
- No behavior changes to the non-dev (PRNG) path
- No changes to other files

## Key Technical Decisions

- **Split on space, not comma**: The dev rolls format `"3,3 3,1 3,2"` is space-delimited pairs with comma-separated dice within each pair. Split on `" "` instead of `","`.
- **Use typed reduce initial value**: Pass `[] as [number, number][]` as the reduce accumulator so TypeScript infers types correctly. This eliminates all cascading implicit `any` errors in one move.
- **Simplify the chain**: After splitting on spaces, `.map()` parses each `"3,3"` string into `[number, number]` tuples directly — no need for `.reduce()` to pair elements.

## Implementation Units

- [x] **Unit 1: Fix dev rolls parsing logic and add type annotations**

**Goal:** Correctly parse dev roll strings and eliminate all 7 TypeScript errors.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Modify: `src/lib/game.ts`

**Approach:**
- Replace `.split(",")` with `.split(" ")`
- Replace the `.map().filter().reduce()` chain with a simpler `.map()` that splits on comma and parses each pair
- Add explicit type annotation to the `.map()` callback parameter

**Patterns to follow:**
- Existing tuple type `[number, number]` used throughout the file

**Test scenarios:**
- Happy path: `"3,3 3,1 3,2"` parses to `[[3,3], [3,1], [3,2]]`
- Edge case: empty string returns empty array
- Edge case: trailing space in `"3,3 "` handled correctly
- Happy path: result is correctly sliced to `count` rolls

**Verification:**
- `npm run build` completes with zero TypeScript errors
- Dev rolls mode returns correct `[number, number][]` array
