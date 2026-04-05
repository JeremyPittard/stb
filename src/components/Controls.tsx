interface ControlsProps {
  onRoll: () => void;
  onCommit: () => void;
  canCommit: boolean;
  canRoll: boolean;
}

export function Controls({
  onRoll,
  onCommit,
  canCommit,
  canRoll,
}: ControlsProps) {
  const canPlay = canRoll || canCommit;
  const isCommit = canCommit;

  const handlePlay = () => {
    if (canCommit) {
      onCommit();
    } else if (canRoll) {
      onRoll();
    }
  };

  return (
    <div className="controls">
      <div className="control-row">
        <button 
          className={`btn ${isCommit ? 'btn-success' : 'btn-primary'}`}
          onClick={handlePlay}
          disabled={!canPlay}
        >
          {isCommit ? `LOCK & ROLL` : 'ROLL DICE'}
        </button>
      </div>
    </div>
  );
}
