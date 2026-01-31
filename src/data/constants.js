// src/data/constants.js

export const CONSTANTS = {
  // League economics
  LEAGUE_CAP: 136_000_000,
  ROTATION_PLAYERS: 10,

  // PIE baselines
  AVERAGE_PIE: 10,
  BASELINE_GAMES: 70,
  BASELINE_MINUTES: 30,

  // Production scaling
  VALUE_MULTIPLIER: 1.0,

  // ✅ MARKET TIERS (THIS WAS MISSING)
  PIE_TIERS: [
    { min: 0, max: 7, expected: 3_000_000 },
    { min: 7, max: 9, expected: 8_000_000 },
    { min: 9, max: 11, expected: 15_000_000 },
    { min: 11, max: 13, expected: 22_000_000 },
    { min: 13, max: 15, expected: 30_000_000 }, // Sub-star
    { min: 15, max: 99, expected: 45_000_000 }, // Star
  ],
};

