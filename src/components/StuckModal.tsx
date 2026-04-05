interface StuckModalProps {
  onBurn: () => void;
  onEndGame: () => void;
  burnUsed: boolean;
}

export function StuckModal({ onBurn, onEndGame, burnUsed }: StuckModalProps) {
  return (
    <div className="modal-overlay" onClick={onEndGame}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>NO VALID MOVES</h3>
        <p>You can't make any move with the current dice.</p>
        
        <div className="modal-buttons">
          {!burnUsed && (
            <button className="btn btn-tv" onClick={onBurn}>
              <span className="tv-icon">📺</span> BURN
            </button>
          )}
          <button className="btn btn-secondary" onClick={onEndGame}>
            END GAME
          </button>
        </div>
      </div>
    </div>
  );
}
