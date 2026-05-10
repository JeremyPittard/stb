---
title: Lives system — double life loss from effect/timeout dual processing
date: 2026-05-10
category: logic-errors
module: stb-game
problem_type: logic_error
component: frontend_stimulus
symptoms:
  - "Double life loss on commit bust — commit's setTimeout and roll useEffect both process the same next dice roll"
  - "Inline life-lost toast causes layout shift on visibility toggle"
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [lives-system, react-effects, async-timing, modal-overlay]
---

# Lives system — double life loss from effect/timeout dual processing

## Problem

After adding a 3-lives system where busts cost one life instead of ending the game immediately, players lost two lives on every bust that followed a tile commit. The game became unplayable.

## Symptoms

- Life counter decremented by 2 on a single bust after committing tiles
- Inline "LOST A LIFE" notification caused the game layout to jump when it appeared/disappeared
- Auto-dismiss after 1.5s left players confused about what happened

## What Didn't Work

- Auditing the bust logic itself — each individual bust path only subtracted 1 life, the math was correct
- Tuning timeout durations — the problem wasn't timing, it was duplicate execution
- The roll `useEffect` and the commit handler's `setTimeout` both independently rolled the exact same next dice, each running the bust check

## Solution

### Fix 1: Eliminate the dual-processing path

The `handleCommit` function set `isRolling: true` in its `setState`, which triggered the roll `useEffect` (listening on `state?.isRolling`). Meanwhile, the commit's own `setTimeout` at 400ms also processed the next roll. Both paths ran the same bust logic independently.

**Before** — commit handler triggered the roll effect:
```typescript
setState(prev => prev && {
  ...prev,
  tileState: newTileState,
  selectedTiles: [],
  currentDice: null,
  isRolling: true,  // triggered roll useEffect
});
```

**After** — commit handler does NOT set `isRolling`:
```typescript
autoRollRef.current = true;
setState(prev => prev && {
  ...prev,
  tileState: newTileState,
  selectedTiles: [],
  currentDice: null,
  // isRolling omitted — auto-roll handled by setTimeout only
});
```

Added an `autoRollRef` (`useRef(false)`) to prevent manual rolls during auto-roll delay:
```typescript
const handleRoll = useCallback(() => {
  if (!state || !challenge || state.isRolling || autoRollRef.current) return;
  setState((prev) => prev && { ...prev, isRolling: true });
}, [state, challenge]);
```

### Fix 2: Convert toast to modal

The life-lost notification was an inline `<div>` that shifted the game layout and auto-cleared after 1.5s. Replaced with a proper modal overlay using existing `modal-overlay`/`modal-content` classes:

```typescript
{state.lifeJustLost && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>No Moves</h2>
      <p>Lives: {state.lives}/{MAX_LIVES}</p>
      <div className="modal-buttons">
        <button className="btn btn-primary" onClick={handleContinue}>
          CONTINUE
        </button>
      </div>
    </div>
  </div>
)}
```

The `handleContinue` callback closes the modal and triggers the next roll atomically:
```typescript
const handleContinue = useCallback(() => {
  setState((prev) => prev && {
    ...prev,
    lifeJustLost: false,
    currentDice: null,
    isRolling: true,
  });
}, []);
```

## Why This Works

The root cause was a dual-processing path on commit — both the roll `useEffect` and the commit's `setTimeout` reacted to the same next dice roll independently. Removing `isRolling: true` from the commit's `setState` eliminated the effect trigger, leaving the `setTimeout` as the sole processor. The `autoRollRef` guard prevents the manual roll button from firing during the 400ms auto-roll window. The modal gives players explicit acknowledgment and control over resuming play.

## Prevention

- Events should have exactly one owner — if a `setTimeout` handles a transition, don't also trigger an effect that handles the same thing
- Use ref-based guards (`autoRollRef`) for pathways that should be mutually exclusive (auto vs. manual)
- For user-facing notifications, prefer explicit acknowledgment (modal/button) over auto-clearing toasts that break layout
- When implementing game state transitions, audit all paths that could process the same input (effects, timeouts, direct calls) and ensure only one fires

## Related Issues

- `docs/solutions/stb-daily-puzzle-features.md` — overlaps on same files (App.tsx, storage.ts, Dice.tsx) and async-timing patterns. May benefit from consolidation review.
