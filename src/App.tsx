import { useState, useEffect, useCallback } from "react";
import {
  getActiveDateKey,
  getDiceForSeed,
  findSolution,
  getScore,
  getChallengeTiles,
  type Challenge,
  type GameState,
} from "./lib/game";
import {
  saveGameState,
  loadGameState,
  clearGameState,
  markHelpSeen,
  type SavedState,
} from "./lib/storage";
import { TileGrid } from "./components/TileGrid";
import { Dice } from "./components/Dice";
import { Controls } from "./components/Controls";
import { GameOver } from "./components/GameOver";
import { SplashScreen, HelpModal } from "./components/HelpModal";
import { PlayAdModal } from "./components/PlayAdModal";
import "./App.css";

import challengesData from "../challenges.json";

function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState<boolean | null>(null);
  const [showPlayAd, setShowPlayAd] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handlePlay = useCallback(() => {
    setShowPlayAd(true);
  }, []);

  const handleAdContinue = useCallback(() => {
    setShowPlayAd(false);
    setShowSplash(false);
    window.history.pushState({}, "");
  }, []);

  const activeDateKey = getActiveDateKey();

  useEffect(() => {
    const handlePopState = () => {
      setShowSplash(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const todayChallenges = challengesData as Record<string, Challenge>;
    const todayChallenge = todayChallenges[activeDateKey];

    if (!todayChallenge) {
      setError("No challenge found for today. Check back tomorrow!");
      return;
    }

    setChallenge(todayChallenge);

    const saved = loadGameState();

    if (saved && saved.activeDate === activeDateKey && saved.tileState) {
      let dice: [number, number] | null = null;
      if (saved.currentDice) {
        dice = saved.currentDice;
      } else if (saved.rollCount && saved.rollCount > 0) {
        const allRolls = getDiceForSeed(todayChallenge.seed, saved.rollCount);
        dice = allRolls[saved.rollCount - 1];
      }

      const hasProgress = saved.rollCount && saved.rollCount > 0;
      const isAlreadyComplete = saved.isComplete || false;
      setShowSplash(!hasProgress);

      setState({
        activeDate: saved.activeDate!,
        tileState: saved.tileState,
        rollCount: saved.rollCount || 0,
        isComplete: isAlreadyComplete,
        result: saved.result || null,
        currentDice: dice,
        selectedTiles: saved.selectedTiles || [],
        isRolling: false,
      });
    } else {
      clearGameState();
      setShowSplash(true);
      setState({
        activeDate: activeDateKey,
        tileState: getChallengeTiles(todayChallenge).map((value) => ({
          value,
          isShut: false,
        })),
        rollCount: 0,
        isComplete: false,
        result: null,
        currentDice: null,
        selectedTiles: [],
        isRolling: false,
      });
    }
  }, [activeDateKey]);

  useEffect(() => {
    if (state) {
      const savedState: SavedState = {
        activeDate: state.activeDate,
        tileState: state.tileState,
        rollCount: state.rollCount,
        isComplete: state.isComplete,
        result: state.result,
        currentDice: state.currentDice,
        selectedTiles: state.selectedTiles,
      };
      saveGameState(savedState);
    }
  }, [state]);

  const handleRoll = useCallback(() => {
    if (!state || !challenge || state.isRolling) return;
    setState((prev) => prev && { ...prev, isRolling: true });
  }, [state, challenge]);

  useEffect(() => {
    if (!state || !challenge || !state.isRolling) return;

    const timeout = setTimeout(() => {
      const newRollCount = state.rollCount + 1;
      const allRolls = getDiceForSeed(challenge.seed, newRollCount);
      const dice = allRolls[newRollCount - 1];
      const diceSum = dice[0] + dice[1];

      const openTiles = state.tileState
        .filter((t) => !t.isShut)
        .map((t) => t.value);
      const canMakeMove = findSolution(openTiles, diceSum);

      if (!canMakeMove) {
        setState(
          (prev) =>
            prev && {
              ...prev,
              rollCount: newRollCount,
              currentDice: dice,
              selectedTiles: [],
              isComplete: true,
              result: "bust",
              isRolling: false,
            },
        );
        return;
      }

      setState(
        (prev) =>
          prev && {
            ...prev,
            rollCount: newRollCount,
            currentDice: dice,
            selectedTiles: [],
          },
      );

      setTimeout(() => {
        setState((prev) => prev && { ...prev, isRolling: false });
      }, 50);
    });

    return () => clearTimeout(timeout);
  }, [state?.isRolling]);

  const handleToggleTile = useCallback(
    (index: number) => {
      if (!state || !state.currentDice) return;

      setState((prev) => {
        if (!prev) return prev;
        const isSelected = prev.selectedTiles.includes(index);
        return {
          ...prev,
          selectedTiles: isSelected
            ? prev.selectedTiles.filter((i) => i !== index)
            : [...prev.selectedTiles, index],
        };
      });
    },
    [state],
  );

  const handleCommit = useCallback(() => {
    if (!state || !challenge) return;

    const dice = state.currentDice;
    if (!dice) return;

    const diceSum = dice[0] + dice[1];
    const selectedSum = state.selectedTiles.reduce(
      (sum, i) => sum + state.tileState[i].value,
      0,
    );

    if (selectedSum !== diceSum) return;

    const newTileState = state.tileState.map((t, i) => {
      if (state.selectedTiles.includes(i)) {
        return { ...t, isShut: true };
      }
      return t;
    });

    const score = getScore(newTileState);
    const isWin = score === 0;

    if (isWin) {
      setState(
        (prev) =>
          prev && {
            ...prev,
            tileState: newTileState,
            selectedTiles: [],
            currentDice: null,
            isComplete: true,
            result: "win",
            isRolling: false,
          },
      );
      return;
    }

    setState(
      (prev) =>
        prev && {
          ...prev,
          tileState: newTileState,
          selectedTiles: [],
          currentDice: null,
          isRolling: true,
        },
    );

    setTimeout(() => {
      const newRollCount = state.rollCount + 1;
      const allRolls = getDiceForSeed(challenge.seed, newRollCount);
      const newDice = allRolls[newRollCount - 1];
      const diceSum = newDice[0] + newDice[1];

      const openTiles = newTileState
        .filter((t) => !t.isShut)
        .map((t) => t.value);
      const canMakeMove = findSolution(openTiles, diceSum);

      if (!canMakeMove) {
        setState(
          (prev) =>
            prev && {
              ...prev,
              rollCount: newRollCount,
              currentDice: newDice,
              selectedTiles: [],
              isComplete: true,
              result: "bust",
              isRolling: false,
            },
        );
        return;
      }

      setState(
        (prev) =>
          prev && {
            ...prev,
            rollCount: newRollCount,
            currentDice: newDice,
          },
      );

      setTimeout(() => {
        setState((prev) => prev && { ...prev, isRolling: false });
      }, 50);
    }, 400);
  }, [state, challenge]);

  const handleSplashHelp = useCallback(() => {
    setShowHelpModal(true);
  }, []);

  if (error) {
    return (
      <div className="app">
        <h1 className="title">Lock 'n Roll</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!state || !challenge) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const diceSum = state.currentDice
    ? state.currentDice[0] + state.currentDice[1]
    : 0;
  const selectedSum = state.selectedTiles.reduce(
    (sum, i) => sum + state.tileState[i].value,
    0,
  );
  const canCommit =
    state.currentDice !== null &&
    selectedSum === diceSum &&
    state.selectedTiles.length > 0;
  const canRoll = state.currentDice === null && !state.isComplete;
  const score = getScore(state.tileState);

  if (showSplash === null) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (showSplash) {
    return (
      <>
        <SplashScreen
          date={activeDateKey}
          onPlay={handlePlay}
          onHelp={handleSplashHelp}
        />
        {showPlayAd && <PlayAdModal onContinue={handleAdContinue} />}
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      </>
    );
  }

  if (state.isComplete && state.result) {
    return (
      <div className="app">
        <GameOver
          result={state.result}
          score={score}
          tiles={state.tileState}
          date={activeDateKey}
        />
      </div>
    );
  }

  return (
    <div className="app game-screen">
      <div className="status">
        <span>Rolls: {state.rollCount}</span>
        <span>Score: {score}</span>
      </div>

      <Dice dice={state.currentDice} isRolling={state.isRolling} />

      <TileGrid
        tiles={state.tileState}
        selectedTiles={state.selectedTiles}
        onToggle={handleToggleTile}
        disabled={state.currentDice === null}
      />

      <Controls
        onRoll={handleRoll}
        onCommit={handleCommit}
        canCommit={canCommit}
        canRoll={canRoll}
      />

      <footer className="footer">
        <button className="footer-btn" onClick={() => setShowHelpModal(true)}>
          How to Play
        </button>
        <a href="/privacy.html" target="_blank">
          Privacy Policy
        </a>
      </footer>

      {showHelpModal && (
        <HelpModal
          onClose={() => {
            setShowHelpModal(false);
            markHelpSeen();
          }}
        />
      )}
    </div>
  );
}

export default App;
