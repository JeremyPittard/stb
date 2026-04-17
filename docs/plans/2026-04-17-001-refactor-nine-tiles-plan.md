---
title: "Simplify to 9 tiles and improve solvability"
type: refactor
status: completed
date: 2026-04-17
---

# Simplify to 10 Tiles and Improve Solvability

## Overview

Standardize the game to always use 10 tiles (values 1-10) matching the traditional Shut The Box. Improve solvability by adjusting the challenge generator's validation parameters. Tile 10 is centered in a separate bottom row.

**Layout:**
```
  1   2   3
  4   5   6
  7   8   9
     10
```

## Problem Frame

Currently the game generates challenges with either 9 or 12 tiles based on the day of year. This adds unnecessary complexity. With 9 tiles summing to 45, the game is already mathematically interesting. The current solvability check looks for solutions within 25 dice rolls, which may be too strict.

## Scope Boundaries

- Only modify tile count and solvability parameters
- Do not change core game mechanics (rolling dice, shutting tiles)
- Do not modify the visual layout or UI

## Key Technical Decisions

1. **Standardize to 10 tiles**: Always generate tiles `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` - traditional Shut The Box layout
2. **Increase max dice rolls for solvability check**: Current limit is 25 rolls. Increase to 35 to make puzzles more reliably solvable
3. **Remove difficulty field**: Since all challenges now use 10 tiles, the difficulty distinction is gone

## Implementation Units

- [ ] **Unit 1: Simplify gen.py tile generation**

**Goal:** Always generate 9 tiles, remove difficulty field, increase solvability threshold

**Files:**
- Modify: `gen.py`

**Approach:**
- Replace `generate_tile_set()` with constant `TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
- Update `can_solve_no_burn()` to use 35 rolls instead of 25
- Remove difficulty assignment from challenge object

**Patterns to follow:**
- Existing gen.py structure

**Test scenarios:**
- Verify 365 challenges generate successfully
- Count of "OK" vs untested should improve

**Verification:**
- Run `python gen.py` and verify output shows higher solvable count

- [ ] **Unit 2: Regenerate challenges.json**

**Goal:** Generate new challenges with 10 tiles and improved solvability

**Files:**
- Modify: `challenges.json`

**Approach:**
- Run the updated generator to overwrite challenges.json

**Verification:**
- challenges.json contains 365 entries
- All entries have 10 tiles (no 12-tile variants)
- All entries have `"tiles": [1,2,3,4,5,6,7,8,9,10]` in some order (seeded shuffle)

- [ ] **Unit 3: Update TileGrid layout for 3+3+3+1 arrangement**

**Goal:** Render tiles 1-9 in a 3x3 grid with tile 10 centered below

**Files:**
- Modify: `src/components/TileGrid.tsx`
- Modify: `src/App.css`

**Approach:**
- Change TileGrid to accept a layout configuration or render specific tile positions
- Position tiles 1-3 in row 1, 4-6 in row 2, 7-9 in row 3
- Tile 10 centered below, offset by half its width
- CSS Grid or flexbox can handle the centering

**Patterns to follow:**
- Existing TileGrid component structure

**Verification:**
- Tiles 1-9 form a 3x3 grid
- Tile 10 is centered below the grid

- [ ] **Unit 4: Update frontend to remove difficulty display**

**Goal:** Remove difficulty badge since it's no longer meaningful

**Files:**
- Modify: `src/App.tsx`

**Approach:**
- Remove the difficulty badge/display element that shows `challenge.difficulty`
- The Challenge interface can keep the `difficulty` field for backward compat, but it will always be "Normal"

**Verification:**
- Build passes: `npm run build`
- No difficulty badge visible in UI

## System-Wide Impact

- **API compatibility**: Challenge interface unchanged (difficulty field still exists but is always "Normal")
- **LocalStorage**: Existing game saves will still load correctly

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Existing users' in-progress games use different tile counts | Their localStorage will still load - no migration needed |
| Different tile count affects solvability | Increased solvability check (35 rolls) compensates |

## Documentation / Operational Notes

- Run `python gen.py` to regenerate challenges when deploying
- Current challenges.json has mixed 9/12 tile challenges - must regenerate for this change to take effect
- Tile 10 centered below creates asymmetric layout - ensure CSS handles centering correctly
