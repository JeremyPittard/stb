import { useEffect, useState, useRef } from 'react';

interface DiceProps {
  dice: [number, number] | null;
  isRolling?: boolean;
}

function Die({ value }: { value: number }) {
  const pipPositions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const pips = pipPositions[value] || [];

  return (
    <div className="die" role="img" aria-label={`Die showing ${value}`}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className={`pip ${pips.includes(i) ? 'active' : ''}`} />
      ))}
    </div>
  );
}

export function Dice({ dice, isRolling }: DiceProps) {
  const [displayDice, setDisplayDice] = useState<[number, number] | null>(dice);
  const prevDiceRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    const prev = prevDiceRef.current;
    
    if (isRolling || (dice && prev !== null && dice !== prev)) {
      prevDiceRef.current = dice;
      
      const interval = setInterval(() => {
        setDisplayDice([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ]);
      }, 80);

      setTimeout(() => {
        clearInterval(interval);
        if (dice) setDisplayDice(dice);
      }, 600);

      return () => clearInterval(interval);
    } else if (dice) {
      prevDiceRef.current = dice;
      setDisplayDice(dice);
    }
  }, [dice, isRolling]);

  const diceLabel = dice ? `Dice showing ${dice[0]} and ${dice[1]}, total ${dice[0] + dice[1]}` : 'Dice not yet rolled';

  if (!displayDice) {
    return (
      <div className="dice-container" role="group" aria-label={diceLabel}>
        <div className="die die-empty" aria-hidden="true">?</div>
        <div className="die die-empty" aria-hidden="true">?</div>
      </div>
    );
  }

  return (
    <div className="dice-container" role="group" aria-label={diceLabel} aria-live="polite">
      <Die value={displayDice[0]} />
      <Die value={displayDice[1]} />
    </div>
  );
}
