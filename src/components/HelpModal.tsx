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
          <p>Roll two dice each turn. You must match the dice total exactly using un-shut tiles. You always roll 2 dice - even if only small tiles remain.</p>
        </div>

        <div className="help-section">
          <h3>Shutting Tiles</h3>
          <p>Select tiles that add up to the dice total. You can use any combination of tiles.</p>
        </div>

        <div className="help-section">
          <h3>Burn</h3>
          <p>If you get stuck with no valid moves, you can use the Burn feature once per game to skip the current dice.</p>
        </div>

        <div className="help-section">
          <h3>Winning</h3>
          <p>Score 0 by shutting all tiles. A "Clean Run" means you won without using Burn.</p>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          GOT IT
        </button>
      </div>
    </div>
  );
}
