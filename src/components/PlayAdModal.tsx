interface PlayAdModalProps {
  onContinue: () => void;
}

export function PlayAdModal({ onContinue }: PlayAdModalProps) {
  return (
    <div className="play-ad-overlay">
      <div className="play-ad-content">
        <div className="play-ad-placeholder">
          <div className="play-ad-slot">
            ADVERTISEMENT
          </div>
        </div>
        <button className="btn btn-primary btn-continue" onClick={onContinue}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}