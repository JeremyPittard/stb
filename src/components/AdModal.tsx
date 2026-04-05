import type { AdConfig } from '../lib/ads';

interface AdModalProps {
  config: AdConfig;
  onClose: (success: boolean) => void;
}

export function AdModal({ config, onClose }: AdModalProps) {
  return (
    <div className="modal-overlay" onClick={() => onClose(true)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => onClose(true)}>×</button>
        
        <h2 className="ad-title">{config.title}</h2>
        {config.body && <p className="ad-body">{config.body}</p>}
        
        {config.imageUrl && (
          <img src={config.imageUrl} alt={config.title} className="ad-image" />
        )}
        
        <p className="ad-instruction">Take a moment to learn about our sponsor</p>
        
        {config.link && (
          <a 
            href={config.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ad-link"
            onClick={e => e.stopPropagation()}
          >
            {config.linkText || 'Learn More'}
          </a>
        )}
      </div>
    </div>
  );
}
