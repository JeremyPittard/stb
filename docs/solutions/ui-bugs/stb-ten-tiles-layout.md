---
title: Simplify STB to 10 tiles with centered layout
date: 2026-04-17
updated: 2026-04-17
category: docs/solutions/ui-bugs
module: stb-game
problem_type: ui_bug
component: tooling
symptoms:
  - Tiles used varying counts (9 or 12) based on day of year
  - Difficulty badge shown even though all challenges now uniform
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [tiles, layout, game-design]
---

# Simplify STB to 10 Tiles with Centered Layout

## Problem

The game used 9 or 12 tiles depending on the day of year, adding unnecessary complexity. All challenges should use the standard 10-tile configuration matching traditional Shut The Box. Tile 10 should be centered in its own row at the bottom.

## Solution

### gen.py Changes

Changed tile generation from conditional to constant:

```python
# Before
def generate_tile_set(day_of_year):
    base = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    if day_of_year % 2 == 0:
        return base + [10, 11, 12]
    return base

# After
TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

Increased solvability check from 25 to 35 dice rolls:

```python
def can_solve_no_burn(tiles_tuple, seed, max_dice=35):
```

### CSS Layout

Explicit tile width ensures exactly 3 per row:

```css
.tile-grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 360px;
}

.tile {
  width: 108px;
  aspect-ratio: 1;
}
```

This creates:
- 3 tiles per row (108px × 3 + 12px gaps × 2 = 348px)
- Tiles 1-9 fill 3 rows
- Tile 10 centers in its own row

### Removed Difficulty Badge

Removed from App.tsx since all challenges are now uniform.

### Made difficulty Field Optional

```typescript
// Before
difficulty: 'Normal' | 'Hard';

// After  
difficulty?: 'Normal' | 'Hard';
```

## Manual CSS Tweaks

After initial implementation, the following manual adjustments were made:

- **Tile sizing on mobile**: Adjusted to 84px to match button sizes
- **Dice sizing on mobile**: Changed to 84x84 to match tiles
- **Tile grid max-width**: Adjusted to fit 3 tiles comfortably
- **Date margin**: Changed to 24px margin-bottom

## Why This Works

Flexbox `wrap` naturally handles the 3+3+3+1 layout:
- First 9 tiles fill 3×3 grid
- Tile 10 wraps to new row and centers due to `justify-content: center`
- The narrower width (80px vs ~120px for others) ensures it doesn't span multiple columns

## Prevention

- Document tile count expectations in spec.md when game design changes
- Consider validation in challenge generator to ensure consistent tile counts
