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

  const cols = Math.ceil(Math.sqrt(tiles.length));
  const gridRows = Math.ceil(tiles.length / cols);
  
  let gridStr = '';
  for (let row = 0; row < gridRows; row++) {
    const rowChars: string[] = [];
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      if (idx < tiles.length) {
        rowChars.push(tiles[idx].isShut ? '█' : '▫');
      }
    }
    gridStr += rowChars.join(' ') + '\n';
  }
  
  const shareText = `STB ${date}
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
