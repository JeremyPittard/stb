interface SplashScreenProps {
  date: string;
  onPlay: () => void;
  onHelp: () => void;
}

export function SplashScreen({ date, onPlay, onHelp }: SplashScreenProps) {
  return (
    <div className="splash-screen">
      <svg className="splash-logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="help-title">How To Play</h2>
        
        <div className="help-section">
          <h3>Goal</h3>
          <p>Shut all numbered tiles to win. Your score is the sum of remaining un-shut tiles.</p>
        </div>

        <div className="help-section">
          <h3>Rolling</h3>
          <p>Roll two dice each turn. You must match the dice total exactly using un-shut tiles.</p>
        </div>

        <div className="help-section">
          <h3>Shutting Tiles</h3>
          <p>Select tiles that add up to the dice total. You can use any combination.</p>
        </div>

        <div className="help-section">
          <h3>Game Over</h3>
          <p>If you can't make a move with the dice, your game ends. No continuations.</p>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          GOT IT
        </button>
      </div>
    </div>
  );
}
