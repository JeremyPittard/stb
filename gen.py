#!/usr/bin/env python3
"""
STB Challenge Generator
Generates daily puzzles with deterministic dice rolls.
Simple version - generates seeds and validates basic dice rolling works.
"""

import json
import random
from datetime import date, timedelta

def seed_from_string(s: str) -> int:
    """Convert string seed to 32-bit integer"""
    h = 0
    for c in s:
        h = (h * 31 + ord(c)) & 0xFFFFFFFF
    return h

class Mulberry32:
    """32-bit PRNG"""
    def __init__(self, seed: int):
        self.state = seed
    
    def next(self) -> int:
        z = (self.state + 0x6D2B79F5) & 0xFFFFFFFF
        z = (z ^ (z >> 15)) * (z | 1)
        z = (z ^ (z + (z ^ (z >> 7)) * (z | 61))) & 0xFFFFFFFF
        return (z ^ (z >> 14)) & 0xFFFFFFFF
    
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

def can_solve(tiles, seed, max_rolls=15):
    """Check if puzzle is solvable - fast check"""
    prng = Mulberry32(seed_from_string(seed))
    
    for _ in range(max_rolls):
        dice = roll_dice(prng)
        solution = find_solution(tiles, dice[0] + dice[1])
        if solution:
            for idx in sorted(solution, reverse=True):
                tiles = [t for i, t in enumerate(tiles) if i != idx]
                if not tiles:
                    return True
    
    return False

def generate_seed():
    adjectives = ['alpha', 'beta', 'gamma', 'delta', 'omega', 'prime', 'zero', 'nova', 'solar', 'lunar']
    nouns = ['omega', 'prime', 'star', 'moon', 'sun', 'core', 'node', 'flux', 'wave', 'pulse']
    return f"{random.choice(adjectives)}-{random.choice(nouns)}-{random.randint(10, 99)}"

def generate_tile_set(day_of_year):
    base = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    if day_of_year % 3 == 0:
        return base + [10, 11, 12]
    elif day_of_year % 5 == 0:
        return base + [10]
    return base

def main():
    challenges = {}
    start_date = date(2026, 1, 1)
    
    print("Generating 365 days of STB challenges...")
    
    for i in range(365):
        current_date = start_date + timedelta(days=i)
        date_key = current_date.isoformat()
        
        tiles = generate_tile_set(i)
        
        for attempt in range(50):
            seed = generate_seed()
            if can_solve(tiles[:], seed):
                challenges[date_key] = {
                    'tiles': tiles,
                    'seed': seed,
                    'difficulty': 'Normal' if len(tiles) <= 9 else 'Hard'
                }
                print(f"[OK] {date_key}: {len(tiles)} tiles, {seed}")
                break
        else:
            # Fallback - just use any seed
            seed = generate_seed()
            challenges[date_key] = {
                'tiles': tiles,
                'seed': seed,
                'difficulty': 'Normal' if len(tiles) <= 9 else 'Hard'
            }
            print(f"[--] {date_key}: {len(tiles)} tiles, {seed} (untested)")
    
    with open('challenges.json', 'w') as f:
        json.dump(challenges, f, indent=2)
    
    print(f"\nGenerated {len(challenges)} challenges to challenges.json")

if __name__ == '__main__':
    main()
