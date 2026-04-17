---
title: Splash Screen and UI Navigation Refinements
date: 2026-04-17
category: docs/solutions/ui-bugs
module: stb-game
problem_type: ui_bug
component: tooling
symptoms:
  - Help modal appeared as overlay, interrupting game flow
  - No accessible way to return to splash without page refresh
root_cause: workflow_issue
resolution_type: code_fix
severity: medium
tags: [splash-screen, navigation, accessibility]
---

# Splash Screen and UI Navigation Refinements

## Problem

The "How to Play" modal appeared as an overlay, interrupting game flow. Players couldn't easily return to the splash screen using browser navigation.

## Solution

### Replaced Modal with Splash Screen

Converted HelpModal into a full-screen SplashScreen that shows on every visit:

```tsx
interface SplashScreenProps {
  date: string;
  onPlay: () => void;
  onHelp: () => void;
}

export function SplashScreen({ date, onPlay, onHelp }: SplashScreenProps) {
  return (
    <div className="splash-screen">
      <svg className="splash-logo" viewBox="0 0 120 120" fill="none">
        <rect x="10" y="10" width="100" height="100" rx="8" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3"/>
        <text x="60" y="75" textAnchor="middle" fontSize="48" fontWeight="bold" fill="currentColor">?</text>
      </svg>
      <h1 className="title">Lock 'n Roll</h1>
      <div className="date">{date}</div>

      <div className="splash-buttons">
        <button className="btn btn-secondary" onClick={onHelp}>
          How to Play
        </button>
        <button className="btn btn-primary" onClick={onPlay}>
          Play
        </button>
      </div>

      <footer className="footer">
        <a href="/privacy.html" target="_blank">Privacy Policy</a>
      </footer>
    </div>
  );
}
```

### Browser Navigation Support

Added `popstate` event listener to allow browser back button to return to splash:

```tsx
useEffect(() => {
  const handlePopState = () => {
    setShowSplash(true);
  };
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);

const handlePlay = useCallback(() => {
  window.history.pushState({}, '');
  setShowSplash(false);
}, []);
```

### Removed Title/Date from Game Screen

Game screen no longer shows title/date - these are only on splash:

```tsx
// Game screen - minimal header
return (
  <div className="app game-screen">
    <div className="status">
      ...
    </div>
    ...
  </div>
);
```

### CSS Updates

```css
.game-screen {
  padding-top: 48px;
}

.splash-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.splash-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 200px;
  margin-top: 24px;
}

.splash-screen .footer {
  margin-top: 48px;
}
```

### Logo Placeholder

Added placeholder SVG (120x120 box with "?") above title for future logo replacement.

## Manual CSS Tweaks

- **Date margin**: Changed to 24px margin-bottom
- **Game screen padding**: 48px top, 16px sides
- **Mobile dice size**: 84x84px to match tile size
- **Mobile tile size**: 84px (adjusted from 108px desktop)

## Key Files

- `src/components/HelpModal.tsx` - Contains both SplashScreen and HelpModal
- `src/App.tsx` - Navigation state and history management
- `src/App.css` - Splash and game screen styling

## Accessibility

- Browser back button returns to splash (no UI button needed)
- Help modal still accessible from splash screen
- Standard footer links preserved on splash
