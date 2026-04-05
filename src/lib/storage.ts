const STORAGE_KEYS = {
  ACTIVE_DATE: 'activeDate',
  TILE_STATE: 'tileState',
  ROLL_COUNT: 'rollCount',
  BURN_USED: 'burnUsed',
  IS_COMPLETE: 'isComplete',
  RESULT: 'result',
  CURRENT_DICE: 'currentDice',
  SELECTED_TILES: 'selectedTiles',
} as const;

export interface SavedState {
  activeDate: string;
  tileState: { value: number; isShut: boolean }[];
  rollCount: number;
  burnUsed: boolean;
  isComplete: boolean;
  result: 'win' | 'bust' | null;
  currentDice: [number, number] | null;
  selectedTiles: number[];
}

export function saveGameState(state: SavedState): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_DATE, state.activeDate);
  localStorage.setItem(STORAGE_KEYS.TILE_STATE, JSON.stringify(state.tileState));
  localStorage.setItem(STORAGE_KEYS.ROLL_COUNT, String(state.rollCount));
  localStorage.setItem(STORAGE_KEYS.BURN_USED, String(state.burnUsed));
  localStorage.setItem(STORAGE_KEYS.IS_COMPLETE, String(state.isComplete));
  localStorage.setItem(STORAGE_KEYS.RESULT, state.result || '');
  localStorage.setItem(STORAGE_KEYS.CURRENT_DICE, state.currentDice ? JSON.stringify(state.currentDice) : '');
  localStorage.setItem(STORAGE_KEYS.SELECTED_TILES, JSON.stringify(state.selectedTiles));
}

export function loadGameState(): SavedState | null {
  const activeDate = localStorage.getItem(STORAGE_KEYS.ACTIVE_DATE);
  const tileStateStr = localStorage.getItem(STORAGE_KEYS.TILE_STATE);
  const rollCount = localStorage.getItem(STORAGE_KEYS.ROLL_COUNT);
  const burnUsed = localStorage.getItem(STORAGE_KEYS.BURN_USED);
  const isComplete = localStorage.getItem(STORAGE_KEYS.IS_COMPLETE);
  const result = localStorage.getItem(STORAGE_KEYS.RESULT);
  const currentDiceStr = localStorage.getItem(STORAGE_KEYS.CURRENT_DICE);
  const selectedTilesStr = localStorage.getItem(STORAGE_KEYS.SELECTED_TILES);

  if (!tileStateStr) return null;

  return {
    activeDate: activeDate || '',
    tileState: JSON.parse(tileStateStr),
    rollCount: rollCount ? parseInt(rollCount, 10) : 0,
    burnUsed: burnUsed === 'true',
    isComplete: isComplete === 'true',
    result: (result as 'win' | 'bust' | null) || null,
    currentDice: currentDiceStr ? JSON.parse(currentDiceStr) : null,
    selectedTiles: selectedTilesStr ? JSON.parse(selectedTilesStr) : [],
  };
}

export function clearGameState(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
