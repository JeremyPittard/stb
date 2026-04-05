interface StuckModalProps {
  onBurn: () => void;
  onEndGame: () => void;
}

export function StuckModal({ onBurn, onEndGame }: StuckModalProps) {
  return (
    <div className="modal-overlay" onClick={onEndGame}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>NO VALID MOVES</h3>
        <p>You can't make any move with the current dice.</p>
        
        <div className="modal-buttons">
          <button className="btn btn-tv" onClick={onBurn}>
            <span className="tv-icon">📺</span> BURN
          </button>
          <button className="btn btn-secondary" onClick={onEndGame}>
            END GAME
          </button>
        </div>
      </div>
    </div>
  );
}
