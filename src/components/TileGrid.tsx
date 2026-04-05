import type { Tile } from '../lib/game';

interface TileGridProps {
  tiles: Tile[];
  selectedTiles: number[];
  onToggle: (index: number) => void;
  disabled: boolean;
}

export function TileGrid({ tiles, selectedTiles, onToggle, disabled }: TileGridProps) {
  return (
    <div className="tile-grid" role="group" aria-label="Tile selection grid">
      {tiles.map((tile, index) => {
        const isSelected = selectedTiles.includes(index);
        const label = tile.isShut 
          ? `Tile ${tile.value}, shut`
          : isSelected 
            ? `Tile ${tile.value}, selected`
            : `Tile ${tile.value}, open`;
        return (
          <button
            key={index}
            className={`tile ${tile.isShut ? 'shut' : ''} ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && !tile.isShut && onToggle(index)}
            disabled={disabled || tile.isShut}
            aria-label={label}
            aria-pressed={isSelected}
          >
            <span className="tile-value">{tile.value}</span>
            {tile.isShut && <span className="tile-x">X</span>}
          </button>
        );
      })}
    </div>
  );
}
