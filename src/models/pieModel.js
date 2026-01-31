// src/models/pieModel.js
import { CONSTANTS } from "../data/constants";

/* =========================================================
   PIE TIERS (ROLE CONTEXT)
   ========================================================= */

export const PIE_TIERS = [
  {
    id: "SUPERSTAR",
    label: "Franchise Superstar",
    minPIE: 17,
    evaluation: "CBA_CAPPED",
  },
  {
    id: "STAR",
    label: "Max Contract Player",
    minPIE: 14,
    evaluation: "STAR_PREMIUM",
  },
  {
    id: "VALUE",
    label: "High-Value Starter",
    minPIE: 11,
    evaluation: "VALUE_ECONOMY",
  },
  {
    id: "ROTATION",
    label: "Rotation Player",
    minPIE: 0,
    evaluation: "VALUE_ECONOMY",
  },
];

export function getPIETwitter(pie) {
  if (pie == null || isNaN(pie)) return null;
  return (
    PIE_TIERS.find((t) => pie >= t.minPIE) ??
    PIE_TIERS[PIE_TIERS.length - 1]
  );
}

/* =========================================================
   ON-COURT PRODUCTION VALUE (AVAILABILITY-AWARE)
   ========================================================= */

export function calculatePIEValue({
  pie,
  gamesPlayed,
  minutesPerGame,
  adjustment = 0,
}) {
  if (pie == null || isNaN(pie)) return null;

  const {
    LEAGUE_CAP,
    ROTATION_PLAYERS,
    AVERAGE_PIE,
    BASELINE_GAMES,
    BASELINE_MINUTES,
    VALUE_MULTIPLIER,
  } = CONSTANTS;

  const avgRotationValue = LEAGUE_CAP / ROTATION_PLAYERS;
  const adjustedPIE = pie + adjustment;
  const impactRatio = adjustedPIE / AVERAGE_PIE;

  const availabilityFactor =
    (gamesPlayed / BASELINE_GAMES) *
    (minutesPerGame / BASELINE_MINUTES);

  return Math.round(
    avgRotationValue *
      impactRatio *
      availabilityFactor *
      VALUE_MULTIPLIER
  );
}

/* =========================================================
   BASE EXPECTED MARKET SALARY (LINEAR)
   ========================================================= */

export function calculateExpectedSalary({
  pie,
  minutesPerGame,
}) {
  if (pie == null || isNaN(pie)) return null;

  const {
    LEAGUE_CAP,
    ROTATION_PLAYERS,
    AVERAGE_PIE,
  } = CONSTANTS;

  const avgRotationValue = LEAGUE_CAP / ROTATION_PLAYERS;
  const impactRatio = pie / AVERAGE_PIE;
  const minutesFactor = minutesPerGame / 30;

  return Math.round(
    avgRotationValue * impactRatio * minutesFactor
  );
}

/* =========================================================
   TIER-ADJUSTED EXPECTED SALARY
   ========================================================= */

export function calculateTierAdjustedExpectedSalary({
  pie,
  baseExpectedSalary,
}) {
  if (pie == null || baseExpectedSalary == null)
    return null;

  const tier = getPIETwitter(pie);
  if (!tier) return baseExpectedSalary;

  const multipliers = {
    SUPERSTAR: 1.25, // allow max inflation
    STAR: 1.05,
    VALUE: 0.9,
    ROTATION: 0.8,
  };

  return Math.round(
    baseExpectedSalary *
      (multipliers[tier.id] ?? 1)
  );
}

/* =========================================================
   IMPACT PER DOLLAR (THE FIX)
   ========================================================= */

export function calculateImpactPerDollar({
  pie,
  actualSalary,
}) {
  if (!pie || !actualSalary) return null;

  const leagueAvgPIE = 15;
  const leagueAvgSalary = 20_000_000;

  const playerRatio = pie / actualSalary;
  const leagueRatio = leagueAvgPIE / leagueAvgSalary;

  return Number((playerRatio / leagueRatio).toFixed(2));
}

/* =========================================================
   CONTRACT EVALUATION (REALITY-AWARE)
   ========================================================= */

export function evaluateContract({
  pie,
  actualSalary,
  tierAdjustedExpectedSalary,
}) {
  if (!pie || !actualSalary)
    return { label: "—", tone: "neutral" };

  const tier = getPIETwitter(pie);

  // Superstars are CBA constrained — surplus is meaningless
  if (tier.evaluation === "CBA_CAPPED") {
    return {
      label: "CBA-Capped Superstar",
      tone: "elite",
    };
  }

  // Stars get softened surplus logic
  if (tier.evaluation === "STAR_PREMIUM") {
    const softenedSurplus =
      (tierAdjustedExpectedSalary - actualSalary) * 0.5;

    if (softenedSurplus >= 5_000_000)
      return { label: "Positive Star Value", tone: "positive" };

    if (softenedSurplus >= -5_000_000)
      return { label: "Acceptable Star Premium", tone: "neutral" };

    return { label: "Risky Star Bet", tone: "negative" };
  }

  // Value economy (full math applies)
  const surplus =
    tierAdjustedExpectedSalary - actualSalary;

  if (surplus >= 10_000_000)
    return { label: "Elite Value Contract", tone: "positive" };

  if (surplus >= 3_000_000)
    return { label: "Strong Value", tone: "positive" };

  if (surplus >= -3_000_000)
    return { label: "Market Neutral", tone: "neutral" };

  return { label: "Inefficient Contract", tone: "negative" };
}








