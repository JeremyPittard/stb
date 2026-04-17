---
title: STB Daily Puzzle Game - Implementation Notes
category: feature
date: 2026-04-05
---

# STB Daily Puzzle Game - Implementation Notes

Documentation of features and fixes implemented in the Shut The Box daily puzzle game.

## Dice Animation

The dice rolling animation cycles through random numbers for approximately 600ms before settling on the final value.

**Implementation:**
- Added `isRolling` state to track animation status
- `Dice` component cycles the display every 80ms
- After 600ms, the actual dice value is displayed

**Key code locations:**
- `src/components/Dice.tsx:32-55` - Animation effect with interval cycling
- `src/App.tsx:365` - Passes `isRolling` prop to Dice component

## StuckModal Timing

The modal that appears when no valid moves are available now waits for the dice animation to finish before showing.

**Implementation:**
- Uses `pendingStuckModal` state that gets set when a stuck condition is detected
- After dice animation completes (`isRolling` becomes false), the pending modal is displayed

**Key code locations:**
- `src/App.tsx:34` - `pendingStuckModal` state
- `src/App.tsx:128` - Sets pending modal when no valid moves
- `src/App.tsx:150-155` - Effect that shows modal after rolling completes

## Burn Button Visibility

The burn button is hidden if the player has already used their burn.

**Implementation:**
- Added `burnUsed` prop to `StuckModal`
- Button only renders if `burnUsed` is false

**Key code locations:**
- `src/components/StuckModal.tsx:15-19` - Conditional rendering of burn button
- `src/App.tsx:391-392` - Passes burnUsed to modal

## Help Modal (Updated 2026-04-17)

Replaced modal with full-screen splash. How to Play instructions now accessible via button on splash screen.

**Implementation:**
- SplashScreen component with Play and How to Play buttons
- HelpModal still exists for inline help content
- Browser back button returns to splash (via popstate listener)
- Logo placeholder SVG added above title

**Key code locations:**
- `src/components/HelpModal.tsx` - Contains both SplashScreen and HelpModal
- `src/App.tsx` - Navigation state, popstate listener, history.pushState on play

## Privacy Policy

Created a privacy policy page for Google AdSense application compliance.

**Implementation:**
- Static `/privacy.html` page
- Includes AdSense disclosure
- Linked from footer

## Share Text Formatting

Changed the share text from a single line to a grid matching the tile layout.

**Implementation:**
- Uses `Math.ceil` to calculate rows and columns properly for 9, 10, and 12 tiles
- Changed from '·' to '▫' (medium white circle) for thicker open tile indicator

**Grid calculation:**
```typescript
const cols = Math.ceil(Math.sqrt(n));
const rows = Math.ceil(n / cols);
```

## Grid Layout (Updated 2026-04-17)

Fixed to always use 10 tiles in 3+3+3+1 layout using flexbox.

**Solution:** Explicit tile width (108px) ensures exactly 3 per row.

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
- 9 tiles: 3×3 grid (108px × 3 + 24px gaps = 360px)
- Tile 10: centered below in its own row

## Share Grid Layout (Updated 2026-04-17)

Fixed share text grid to match the 3+3+3+1 game board layout instead of using dynamic grid calculation.

**Solution:** Use fixed row slices matching the game layout:

```tsx
const rows = [
  tiles.slice(0, 3),
  tiles.slice(3, 6),
  tiles.slice(6, 9),
  tiles.slice(9, 10),
];

let gridStr = '';
for (const row of rows) {
  if (row.length === 0) break;
  gridStr += row.map(t => t.isShut ? '█' : '▫').join(' ') + '\n';
}
```

## LocalStorage Persistence Bug

Game state was resetting on page refresh because of incorrect condition check.

**Problem:** The condition `!saved.isComplete` prevented loading saved state after game ended. When user refreshed the page, the code would check if game was complete and start a new game instead of showing GameOver screen.

**Solution:** Removed the `!saved.isComplete` check - now loads saved state regardless of completion status. This allows:
- Mid-game: Continue where left off
- Completed game: Show GameOver screen with result

```typescript
// Before (broken)
if (saved && saved.activeDate === activeDateKey && saved.tileState && !saved.isComplete) {

// After (fixed)
if (saved && saved.activeDate === activeDateKey && saved.tileState) {
```

**Key code location:**
- `src/App.tsx:52` - Removed `!saved.isComplete` check
