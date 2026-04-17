import { useState } from 'react';
import type { Tile } from '../lib/game';

interface GameOverProps {
  result: 'win' | 'bust';
  score: number;
  burnUsed: boolean;
  tiles: Tile[];
  date: string;
}

export function GameOver({ result, score, burnUsed, tiles, date }: GameOverProps) {
  const [copied, setCopied] = useState(false);

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
  
  const shareText = `Lock 'n Roll ${date}
Score: ${score} ${score === 0 ? '(WIN!)' : ''}
${burnUsed ? '[Burn Used]' : '[Clean Run]'}
${gridStr}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className={result === 'win' ? 'win' : 'bust'}>
          {result === 'win' ? 'YOU WIN!' : 'GAME OVER'}
        </h2>
        
        <div className="final-score">
          Score: {score}
        </div>
        
        <div className="status-badge">
          {burnUsed ? '[Burn Used]' : '[Clean Run]'}
        </div>
        
        <pre className="share-text">{shareText}</pre>
        
        <div className="modal-buttons">
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? 'COPIED!' : 'COPY'}
          </button>
        </div>
        
        <p className="come-back">Come back tomorrow for a new puzzle!</p>
      </div>
    </div>
  );
}
