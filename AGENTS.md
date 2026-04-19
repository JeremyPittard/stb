# AGENTS.md - Lock 'n Roll Game

**Compound Engineering**: This repo uses [Compound Engineering](https://compoundengineering.com) workflow. Documentation lives in `docs/solutions/`. Run `ce:compound-refresh` after major changes to keep docs aligned with code.

## Project Overview

- **Type**: React/TypeScript/Vite web game
- **Core functionality**: Daily Shut The Box puzzle game with seeded dice rolls
- **Deployment**: Static files (dist/)

## Code Organization

```
src/
├── components/     # React components (Controls, Dice, TileGrid, GameOver, etc.)
├── lib/           # Game logic (game.ts, storage.ts, ads.tsx)
├── App.tsx        # Main game component
├── App.css        # All styling
└── main.tsx       # Entry point
```

## Key Conventions

- **Styling**: Plain CSS (no frameworks), monochrome arcade aesthetic
- **State**: React useState + localStorage for persistence
- **Testing**: Manual browser testing (no automated tests)
- **Build**: `npm run build` produces dist/

## Game Logic

- **Seeded PRNG**: Mulberry32 - same seed = same dice sequence
- **Daily puzzles**: 365 challenges in challenges.json
- **Persistence**: localStorage saves tileState, rollCount, isComplete, result
- **Game flow**: Click Play → see ad modal → click Continue → game starts
- **Game over**: When no valid move possible, game ends immediately (no continuation)

## Common Tasks

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Regenerate challenges | `python gen.py` |

## Key Files

- `src/lib/game.ts` - PRNG, solution finding, scoring
- `src/lib/storage.ts` - localStorage persistence
- `challenges.json` - 365 daily puzzles

## Review Checklist

Before committing:
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] Game playable in browser
- [ ] localStorage persistence works

## Documentation

- `docs/solutions/` - Implementation notes and bug fixes
- `spec.md` - Original technical specification
- `public/privacy.html` - Privacy policy for AdSense
