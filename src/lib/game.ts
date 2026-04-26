export interface Tile {
  value: number;
  isShut: boolean;
}

export interface GameState {
  activeDate: string;
  tileState: Tile[];
  rollCount: number;
  isComplete: boolean;
  result: 'win' | 'bust' | null;
  currentDice: [number, number] | null;
  selectedTiles: number[];
  isRolling: boolean;
}

export const DEFAULT_TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface Challenge {
  tiles?: number[];
  seed: string;
  difficulty?: 'Normal' | 'Hard';
}

export function getChallengeTiles(challenge: Challenge): number[] {
  return challenge.tiles || DEFAULT_TILES;
}

export interface Challenges {
  [date: string]: Challenge;
}

export function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 31) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export class Mulberry32 {
  public state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    let z = (this.state + 0x6D2B79F5) >>> 0;
    z = (z ^ (z >>> 15)) * (z | 1);
    z = (z ^ (z + ((z ^ (z >>> 7)) * (z | 61)))) >>> 0;
    this.state = z ^ (z >>> 14);
    return this.state >>> 0;
  }

  randint(a: number, b: number): number {
    return a + (this.next() % (b - a + 1));
  }
}

export function rollDice(prng: Mulberry32): [number, number] {
  return [prng.randint(1, 6), prng.randint(1, 6)];
}

export function getDiceForSeed(seed: string, count: number): [number, number][] {
  const useDevRolls = import.meta.env.VITE_USE_DEV_ROLLS === "true";
  if (useDevRolls) {
    const devRollsStr = import.meta.env.VITE_DEV_ROLLS || "3,3 3,1 3,2 3,3 3,4 3,5 3,6 4,6";
    const devRolls: [number, number][] = devRollsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s)
      .reduce<[number, number][]>((acc, val, i, arr) => {
        if (i % 2 === 0) {
          acc.push([parseInt(val), parseInt(arr[i + 1])]);
        }
        return acc;
      }, []);
    return devRolls.slice(0, count);
  }
  const prng = new Mulberry32(seedFromString(seed));
  const rolls: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDice(prng));
  }
  return rolls;
}

export function findSolution(tiles: number[], target: number): number[] | null {
  const n = tiles.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    let total = 0;
    const indices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        total += tiles[i];
        indices.push(i);
      }
    }
    if (total === target) {
      return indices;
    }
  }
  return null;
}

export function getActiveDateKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function loadChallenges(): Challenges {
  try {
    return JSON.parse(localStorage.getItem('challenges') || '{}');
  } catch {
    return {};
  }
}

export function saveChallenges(challenges: Challenges): void {
  localStorage.setItem('challenges', JSON.stringify(challenges));
}

export function getScore(tileState: Tile[]): number {
  return tileState.filter(t => !t.isShut).reduce((sum, t) => sum + t.value, 0);
}
