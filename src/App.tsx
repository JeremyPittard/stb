import { useState, useEffect, useCallback } from 'react';
import {
  getActiveDateKey,
  getDiceForSeed,
  findSolution,
  getScore,
  type Challenge,
  type GameState,
} from './lib/game';
import {
  saveGameState,
  loadGameState,
  clearGameState,
  type SavedState,
} from './lib/storage';
import { getAdConfig } from './lib/ads';
import { TileGrid } from './components/TileGrid';
import { Dice } from './components/Dice';
import { Controls } from './components/Controls';
import { GameOver } from './components/GameOver';
import { AdModal } from './components/AdModal';
import { StuckModal } from './components/StuckModal';
import './App.css';

import challengesData from '../challenges.json';

function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showStuckModal, setShowStuckModal] = useState(false);

  const activeDateKey = getActiveDateKey();

  useEffect(() => {
    const todayChallenges = challengesData as Record<string, Challenge>;
    const todayChallenge = todayChallenges[activeDateKey];

    if (!todayChallenge) {
      setError('No challenge found for today. Check back tomorrow!');
      return;
    }

    setChallenge(todayChallenge);

    const saved = loadGameState();

    if (saved && saved.activeDate === activeDateKey && saved.tileState && !saved.isComplete) {
      let dice: [number, number] | null = null;
      if (saved.currentDice) {
        dice = saved.currentDice;
      } else if (saved.rollCount && saved.rollCount > 0) {
        const allRolls = getDiceForSeed(todayChallenge.seed, saved.rollCount);
        dice = allRolls[saved.rollCount - 1];
      }

      setState({
        activeDate: saved.activeDate!,
        tileState: saved.tileState,
        rollCount: saved.rollCount || 0,
        burnUsed: saved.burnUsed || false,
        isComplete: saved.isComplete || false,
        result: saved.result || null,
        currentDice: dice,
        selectedTiles: saved.selectedTiles || [],
        isRolling: false,
      });
    } else {
      clearGameState();
      setState({
        activeDate: activeDateKey,
        tileState: todayChallenge.tiles.map(value => ({ value, isShut: false })),
        rollCount: 0,
        burnUsed: false,
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
        burnUsed: state.burnUsed,
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
    setState(prev => prev && ({ ...prev, isRolling: true }));
  }, [state, challenge]);

  useEffect(() => {
    if (!state || !challenge || !state.isRolling) return;

    const timeout = setTimeout(() => {
      const newRollCount = state.rollCount + 1;
      const allRolls = getDiceForSeed(challenge.seed, newRollCount);
      const dice = allRolls[newRollCount - 1];
      const diceSum = dice[0] + dice[1];

      const openTiles = state.tileState.filter(t => !t.isShut).map(t => t.value);
      const canMakeMove = findSolution(openTiles, diceSum);

      if (!canMakeMove) {
        setShowStuckModal(true);
        setState(prev => prev && ({ ...prev, isRolling: false }));
        return;
      }

      setState(prev => prev && ({
        ...prev,
        rollCount: newRollCount,
        currentDice: dice,
        selectedTiles: [],
      }));

      setTimeout(() => {
        setState(prev => prev && ({ ...prev, isRolling: false }));
      }, 50);
    }, 400);

    return () => clearTimeout(timeout);
  }, [state?.isRolling]);

  const handleToggleTile = useCallback((index: number) => {
    if (!state || !state.currentDice) return;

    setState(prev => {
      if (!prev) return prev;
      const isSelected = prev.selectedTiles.includes(index);
      return {
        ...prev,
        selectedTiles: isSelected
          ? prev.selectedTiles.filter(i => i !== index)
          : [...prev.selectedTiles, index],
      };
    });
  }, [state]);

  const handleCommit = useCallback(() => {
    if (!state || !challenge) return;

    const dice = state.currentDice;
    if (!dice) return;

    const diceSum = dice[0] + dice[1];
    const selectedSum = state.selectedTiles.reduce((sum, i) => sum + state.tileState[i].value, 0);

    if (selectedSum !== diceSum) return;

    const newTileState = state.tileState.map((t, i) => {
      if (state.selectedTiles.includes(i)) {
        return { ...t, isShut: true };
      }
      return t;
    });

    const score = getScore(newTileState);
    const isWin = score === 0;

    let isBust = false;
    if (!isWin) {
      const openTiles = newTileState.filter(t => !t.isShut).map(t => t.value);
      const allRolls = getDiceForSeed(challenge.seed, 20);
      let canMakeMove = false;
      for (const [d1, d2] of allRolls) {
        if (findSolution(openTiles, d1 + d2)) {
          canMakeMove = true;
          break;
        }
      }
      if (!canMakeMove) {
        isBust = true;
      }
    }

    if (isWin || isBust) {
      setState(prev => prev && ({
        ...prev,
        tileState: newTileState,
        selectedTiles: [],
        currentDice: null,
        isComplete: isWin || isBust,
        result: isWin ? 'win' : 'bust',
        isRolling: false,
      }));
      return;
    }

    setState(prev => prev && ({
      ...prev,
      tileState: newTileState,
      selectedTiles: [],
      currentDice: null,
      isRolling: true,
    }));

    setTimeout(() => {
      const newRollCount = state.rollCount + 1;
      const allRolls = getDiceForSeed(challenge.seed, newRollCount);
      const newDice = allRolls[newRollCount - 1];

      setState(prev => prev && ({
        ...prev,
        rollCount: newRollCount,
        currentDice: newDice,
        isRolling: false,
      }));
    }, 400);
  }, [state, challenge]);

  const handleAdClose = useCallback((success: boolean) => {
    setShowAdModal(false);
    if (success && state && challenge) {
      const newRollCount = state.rollCount + 1;
      const allRolls = getDiceForSeed(challenge.seed, newRollCount);
      const dice = allRolls[newRollCount - 1];

      const newTileState = state.tileState;
      const score = getScore(newTileState);
      const isWin = score === 0;

      let isBust = false;
      if (!isWin) {
        const openTiles = newTileState.filter(t => !t.isShut).map(t => t.value);
        const allFutureRolls = getDiceForSeed(challenge.seed, 20);
        let canMakeMove = false;
        for (const [d1, d2] of allFutureRolls) {
          if (findSolution(openTiles, d1 + d2)) {
            canMakeMove = true;
            break;
          }
        }
        if (!canMakeMove) {
          isBust = true;
        }
      }

      setState(prev => prev && ({
        ...prev,
        rollCount: newRollCount,
        currentDice: dice,
        burnUsed: true,
        selectedTiles: [],
        isComplete: isWin || isBust,
        result: isWin ? 'win' : (isBust ? 'bust' : null),
      }));
    }
  }, [state, challenge]);

  if (error) {
    return (
      <div className="app">
        <div className="error-screen">
          <h1>STB</h1>
          <p className="error-message">{error}</p>
        </div>
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

  const diceSum = state.currentDice ? state.currentDice[0] + state.currentDice[1] : 0;
  const selectedSum = state.selectedTiles.reduce((sum, i) => sum + state.tileState[i].value, 0);
  const canCommit = state.currentDice !== null && selectedSum === diceSum && state.selectedTiles.length > 0;
  const canRoll = state.currentDice === null && !state.isComplete;
  const score = getScore(state.tileState);

  if (state.isComplete && state.result) {
    return (
      <div className="app">
        <h1 className="title">STB</h1>
        <GameOver
          result={state.result}
          score={score}
          burnUsed={state.burnUsed}
          tiles={state.tileState}
          date={activeDateKey}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <h1 className="title">STB</h1>
      <div className="date">{activeDateKey}</div>
      <div className="difficulty">{challenge.difficulty}</div>

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

      {showAdModal && (
        <AdModal config={getAdConfig()} onClose={handleAdClose} />
      )}

      {showStuckModal && (
        <StuckModal 
          onBurn={() => {
            if (!state?.burnUsed) {
              setShowStuckModal(false);
              setShowAdModal(true);
            }
          }} 
          onEndGame={() => {
            setState(prev => prev && ({
              ...prev,
              isComplete: true,
              result: 'bust',
            }));
            setShowStuckModal(false);
          }} 
        />
      )}
    </div>
  );
}

export default App;
