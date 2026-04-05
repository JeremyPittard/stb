# **Technical Specification: Project STB**

### **1\. Core System Logic & RNG**

- **Game Type:** A daily, deterministic, seeded puzzle based on matching a variable array of numbers to the sum of two 6-sided dice.

- **Objective:** "Shut" every number in the daily array.

- **Deterministic Randomness:**
  - **PRNG:** Must use a 32-bit Pseudo-Random Number Generator (e.g., **Mulberry32**).

  - **Seed:** Initialized via the `seed` string in the daily JSON.

  - **Sequence:** Dice rolls are an immutable result of the `seed` and the `rollCount`.

  - **Constraint:** `Math.random()` is strictly forbidden. All players globally must see the exact same dice sequence for the same sequence of moves.

### **2\. Temporal Synchronization**

- **Global Reset:** **00:00 UTC** daily.

- **Date Logic:** The application derives the "Current Day" key using the user's system time converted to a UTC ISO string: `const activeDateKey = new Date().toISOString().split('T')[0];`

- **Lifecycle:** On initialization, the app compares the `localStorage` `activeDate` with the `activeDateKey`. If they differ, the app must purge the previous session and initialize the new day's data from the JSON.

### **3\. Data Schema (`challenges.json`)**

The application consumes a JSON dictionary where keys are ISO dates. The `tiles` array is the Source of Truth for the board state.

JSON

```
{
  "2026-04-05": {
    "tiles": [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "seed": "alpha-omega-92",
    "difficulty": "Normal"
  }
}

```

### **4\. Persistence (`localStorage`)**

The following state must be persisted to ensure game integrity:

| Key          | Type            | Description                                                            |
| ------------ | --------------- | ---------------------------------------------------------------------- |
| `activeDate` | `string`        | The current UTC date key (`YYYY-MM-DD`).                               |
| `tileState`  | `Array<Object>` | Objects representing the initial tiles, including an `isShut` boolean. |
| `history`    | `Array<Array>`  | Snapshots of `tileState` pushed after every successful "Commit."       |
| `rollCount`  | `number`        | The current integer index for the PRNG sequence.                       |
| `burnUsed`   | `boolean`       | Tracks if the one-time "Burn" ad was watched.                          |
| `isComplete` | `boolean`       | State lock: If true, the board is non-interactive (Win or Bust).       |

Export to Sheets

### **5\. Feature-Locked Ad Mechanic: The Burn**

- **Trigger:** Available once per session when a player hits a "Bust" (no legal moves) or chooses to skip a difficult roll.

- **Action:** Triggered via a mock `useAds` rewarded video callback.

- **Logic:**
  1.  The current dice values are discarded.

  2.  `rollCount` increments by 1.

  3.  The app fetches the next deterministic dice pair from the sequence.

  4.  `burnUsed` is set to `true`.

- **Integrity:** Because the next roll is also seeded, the "Burn" result is consistent for all players who choose to use it at that specific moment, maintaining the global shared seed.

### **6\. Gameplay State Machine**

1.  **`INIT` & Recovery**: Load `tiles` and `seed` for the current UTC date. If `challenges.json` lacks an entry, display an "Update Required" error UI. If `rollCount > 0`, fast-forward the PRNG to recover current dice.

2.  **`ROLL`**: Increment `rollCount`. Generate two values (1--6) via the seeded PRNG.

3.  **`DECISION`**: User toggles tiles from the `tileState`. The "Commit" action is disabled until the sum of selected tiles exactly matches the dice sum.

4.  **`COMMIT`**:
    - Selected tiles are marked `isShut: true`.

    - Push the previous `tileState` to the `history` array.

5.  **`VALIDATION`**:
    - **Win:** If all tiles in `tileState` are `isShut`, set `isComplete: true`.

    - **Bust:** If no mathematical combination of remaining tiles can equal the current dice sum, check for the Ad-Gate.

    - **Ad-Gate:** Offer the **Burn**. If `burnUsed` is already true, or the user declines, set `isComplete: true`.

### **7\. Data Generation & Validation (`gen.py`)**

A standalone script is required to generate the 365-day `challenges.json`.

- **Solver:** A recursive script that "plays" every seed.

- **Validation Guarantee:** Challenges are only saved if the solver finds at least one path to a Score 0. The solver must also calculate the "Burn Path" (ensuring that if a player burns a roll, the game remains winnable).

- **Variable Board:** Supports custom tile arrays per date (e.g., 1-9, 1-12, or custom sets).

### **8\. Social Sharing Protocol**

The app generates a plain-text clipboard string:

- Project Name + Date (e.g., `STB 2026-04-05`)

- Final Score (0 = Win)

- Status Badge: `[Clean Run]` or `[Burn Used]`

- A visual grid using high-contrast emojis representing the final `isShut` status of the `tiles` array.
