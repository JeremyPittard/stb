#!/usr/bin/env python3
"""
STB Challenge Generator
Generates daily puzzles with deterministic dice rolls.
Validates that puzzles are solvable without burn.
"""

import json
import random
from datetime import date, timedelta
from functools import lru_cache

def seed_from_string(s: str) -> int:
    """Convert string seed to 32-bit integer"""
    h = 0
    for c in s:
        h = (h * 31 + ord(c)) & 0xFFFFFFFF
    return h

class Mulberry32:
    """32-bit PRNG"""
    def __init__(self, seed: int):
        self.state = seed & 0xFFFFFFFF
    
    def next(self) -> int:
        z = (self.state + 0x6D2B79F5) & 0xFFFFFFFF
        z = ((z ^ (z >> 15)) * (z | 1)) & 0xFFFFFFFF
        z = (z ^ (z + ((z ^ (z >> 7)) * (z | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        self.state = (z ^ (z >> 14)) & 0xFFFFFFFF
        return self.state
    
    def randint(self, a: int, b: int) -> int:
        return a + (self.next() % (b - a + 1))

def roll_dice(prng: Mulberry32):
    return (prng.randint(1, 6), prng.randint(1, 6))

def find_solution(tiles, dice_sum):
    """Find subset of tiles that sums to dice_sum"""
    n = len(tiles)
    for mask in range(1 << n):
        total = 0
        indices = []
        for i in range(n):
            if mask & (1 << i):
                total += tiles[i]
                indices.append(i)
        if total == dice_sum:
            return indices
    return None

@lru_cache(maxsize=4096)
def get_dice_for_seed(seed_str, count):
    """Generate dice rolls for a seed"""
    prng = Mulberry32(seed_from_string(seed_str))
    return [(prng.randint(1, 6), prng.randint(1, 6)) for _ in range(count)]

def try_solve(tiles, dice_pairs):
    """Try to solve puzzle with given dice sequence"""
    tiles = list(tiles)
    for dice in dice_pairs:
        solution = find_solution(tiles, dice[0] + dice[1])
        if solution:
            for idx in sorted(solution, reverse=True):
                tiles.pop(idx)
            if not tiles:
                return True
    return False

def can_solve_no_burn(tiles_tuple, seed, max_dice=35):
    """Check if puzzle is solvable without burn"""
    dice_pairs = get_dice_for_seed(seed, max_dice)
    return try_solve(tiles_tuple, dice_pairs)

def generate_seed():
    adjectives = ['alpha', 'beta', 'gamma', 'delta', 'omega', 'prime', 'zero', 'nova', 'solar', 'lunar']
    nouns = ['omega', 'prime', 'star', 'moon', 'sun', 'core', 'node', 'flux', 'wave', 'pulse']
    return f"{random.choice(adjectives)}-{random.choice(nouns)}-{random.randint(10, 99)}"

TILES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

def main():
    challenges = {}
    start_date = date(2026, 1, 1)
    
    print("Generating 365 days of STB challenges...")
    
    ok_without_burn = 0
    failed = 0
    
    for i in range(365):
        current_date = start_date + timedelta(days=i)
        date_key = current_date.isoformat()
        
        tiles = TILES
        tiles_tuple = tuple(tiles)
        
        for attempt in range(100):
            seed = generate_seed()
            if can_solve_no_burn(tiles_tuple, seed):
                challenges[date_key] = {
                    'tiles': tiles,
                    'seed': seed,
                }
                ok_without_burn += 1
                print(f"[OK] {date_key}: {seed}")
                break
        else:
            # Fallback - just use any seed
            seed = generate_seed()
            challenges[date_key] = {
                'tiles': tiles,
                'seed': seed,
            }
            failed += 1
            print(f"[--] {date_key}: {seed} (untested)")
    
    with open('challenges.json', 'w') as f:
        json.dump(challenges, f, indent=2)
    
    print(f"\nGenerated {len(challenges)} challenges")
    print(f"  Solvable without burn: {ok_without_burn}")
    print(f"  Untested: {failed}")

if __name__ == '__main__':
    main()
