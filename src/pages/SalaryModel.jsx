import { useMemo, useState } from "react";
import usePlayerData from "../hooks/usePlayerData";
import FirstUseWalkthrough from "./FirstUseWalkthrough";
import {
  calculatePIEValue,
  calculateExpectedSalary,
  calculateTierAdjustedExpectedSalary,
  getPIETwitter,
  calculateImpactPerDollar,
  evaluateContract,
} from "../models/pieModel";

export default function SalaryModel() {
  const { players, loading, error } = usePlayerData();

  /* =========================
     WALKTHROUGH STATE
  ========================= */
  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    return !localStorage.getItem("walkthroughSeen");
  });

  const closeWalkthrough = () => {
    localStorage.setItem("walkthroughSeen", "true");
    setShowWalkthrough(false);
  };

  /* =========================
     CORE STATE
  ========================= */
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Compare state
  const [compareMode, setCompareMode] = useState(false);
  const [compareQuery, setCompareQuery] = useState("");
  const [comparePlayer, setComparePlayer] = useState(null);

  // Assumptions (shared)
  const [gamesPlayed, setGamesPlayed] = useState(70);
  const [minutesPerGame, setMinutesPerGame] = useState(30);
  const [adjustment, setAdjustment] = useState(0);

  /* =========================
     SEARCH
  ========================= */
  const filteredPlayers = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    return players.filter(
      (p) =>
        typeof p.name === "string" &&
        p.name.toLowerCase().includes(q)
    );
  }, [query, players]);

  const filteredComparePlayers = useMemo(() => {
    if (!compareQuery) return [];
    const q = compareQuery.toLowerCase();

    return players.filter(
      (p) =>
        typeof p.name === "string" &&
        p.name.toLowerCase().includes(q) &&
        p.player_id !== selectedPlayer?.player_id
    );
  }, [compareQuery, players, selectedPlayer]);

  /* =========================
     EARLY STATES
  ========================= */
  if (loading) {
    return <div className="page">Loading players…</div>;
  }

  if (error) {
    return <div className="page">Error loading data.</div>;
  }

  /* =========================
     DATA SAFETY
  ========================= */
  const actualSalary =
    selectedPlayer?.salaries?.["2025-26"] ?? null;

  const compareActualSalary =
    comparePlayer?.salaries?.["2025-26"] ?? null;

  /* =========================
     MODEL CALCULATIONS (PRIMARY)
  ========================= */
  const productionValue =
    selectedPlayer?.pie != null
      ? calculatePIEValue({
          pie: selectedPlayer.pie,
          gamesPlayed,
          minutesPerGame,
          adjustment,
        })
      : null;

  const baseExpectedSalary =
    selectedPlayer?.pie != null
      ? calculateExpectedSalary({
          pie: selectedPlayer.pie,
          minutesPerGame,
        })
      : null;

  const tier =
    selectedPlayer?.pie != null
      ? getPIETwitter(selectedPlayer.pie)
      : null;

  const tierAdjustedExpectedSalary =
    selectedPlayer && baseExpectedSalary
      ? calculateTierAdjustedExpectedSalary({
          pie: selectedPlayer.pie,
          baseExpectedSalary,
        })
      : null;

  const impactPerDollar =
    selectedPlayer && actualSalary
      ? calculateImpactPerDollar({
          pie: selectedPlayer.pie,
          actualSalary,
        })
      : null;

  const contractEvaluation =
    selectedPlayer && tierAdjustedExpectedSalary
      ? evaluateContract({
          pie: selectedPlayer.pie,
          actualSalary,
          tierAdjustedExpectedSalary,
        })
      : { label: "—", tone: "neutral" };

  /* =========================
     MODEL CALCULATIONS (COMPARE)
  ========================= */
  const compareTier =
    comparePlayer?.pie != null
      ? getPIETwitter(comparePlayer.pie)
      : null;

  const compareBaseExpectedSalary =
    comparePlayer?.pie != null
      ? calculateExpectedSalary({
          pie: comparePlayer.pie,
          minutesPerGame,
        })
      : null;

  const compareTierAdjustedExpectedSalary =
    comparePlayer && compareBaseExpectedSalary
      ? calculateTierAdjustedExpectedSalary({
          pie: comparePlayer.pie,
          baseExpectedSalary: compareBaseExpectedSalary,
        })
      : null;

  const compareImpactPerDollar =
    comparePlayer && compareActualSalary
      ? calculateImpactPerDollar({
          pie: comparePlayer.pie,
          actualSalary: compareActualSalary,
        })
      : null;

  const compareContractEvaluation =
    comparePlayer && compareTierAdjustedExpectedSalary
      ? evaluateContract({
          pie: comparePlayer.pie,
          actualSalary: compareActualSalary,
          tierAdjustedExpectedSalary:
            compareTierAdjustedExpectedSalary,
        })
      : { label: "—", tone: "neutral" };

  /* =========================
     SALARY SURPLUS
  ========================= */
  const salarySurplus =
    actualSalary && tierAdjustedExpectedSalary
      ? actualSalary - tierAdjustedExpectedSalary
      : null;

  const compareSalarySurplus =
    compareActualSalary && compareTierAdjustedExpectedSalary
      ? compareActualSalary -
        compareTierAdjustedExpectedSalary
      : null;

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="page">
      {showWalkthrough && (
        <FirstUseWalkthrough onClose={closeWalkthrough} />
      )}

      {/* Header */}
      <div className="card">
        <h1>NBA Salary Value Model</h1>
        <p className="subtle">
          PIE-driven impact, CBA-aware contract evaluation.
        </p>
      </div>

      {/* COMMAND BAR */}
      <div className="card command-bar">
        <input
          className="input command-input"
          placeholder="Search player…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedPlayer(null);
            setCompareMode(false);
            setComparePlayer(null);
          }}
        />

        {selectedPlayer && (
          <>
            <span className="badge">
              PIE {productionValue?.toFixed(1)}
            </span>
            <span className="badge blue">
              {tier?.label}
            </span>
          </>
        )}
      </div>

      {/* SEARCH RESULTS */}
      {query && filteredPlayers.length > 0 && (
        <div className="card search-results">
          {filteredPlayers.slice(0, 12).map((p, idx) => (
            <div
              key={`${p.player_id}-${idx}`}
              className="search-item"
              onClick={() => {
                setSelectedPlayer(p);
                setQuery(p.name);
              }}
            >
              {p.name} — PIE {p.pie}
            </div>
          ))}
        </div>
      )}

      {/* ACTION BAR */}
      {selectedPlayer && (
        <div className="action-bar">
          <button
            className="btn-primary"
            onClick={() =>
              setCompareMode((v) => !v)
            }
          >
            {compareMode ? "Exit Compare" : "Compare Player"}
          </button>

          <button className="btn-primary">
            Trade Scenario
          </button>

          <button className="btn-primary">
            Cap Impact
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              setGamesPlayed(70);
              setMinutesPerGame(30);
              setAdjustment(0);
            }}
          >
            Reset
          </button>
        </div>
      )}

      {/* COMPARE SEARCH */}
      {compareMode && (
        <div className="card">
          <h3>Compare Against</h3>
          <input
            className="input"
            placeholder="Search player to compare…"
            value={compareQuery}
            onChange={(e) => {
              setCompareQuery(e.target.value);
              setComparePlayer(null);
            }}
          />

          {compareQuery &&
            filteredComparePlayers.length > 0 && (
              <div className="search-results">
                {filteredComparePlayers
                  .slice(0, 10)
                  .map((p) => (
                    <div
                      key={p.player_id}
                      className="search-item"
                      onClick={() => {
                        setComparePlayer(p);
                        setCompareQuery(p.name);
                      }}
                    >
                      {p.name} — PIE {p.pie}
                    </div>
                  ))}
              </div>
            )}
        </div>
      )}

      {/* SALARY STATS (PRONOUNCED) */}
      {selectedPlayer && (
        <div className="card salary-stats">
          <div className="salary-stat">
            <div className="salary-label">Actual Salary</div>
            <div className="salary-value">
              ${actualSalary
                ? (actualSalary / 1_000_000).toFixed(1)
                : "—"}
              M
            </div>
          </div>

          <div className="salary-stat">
            <div className="salary-label">Expected Salary</div>
            <div className="salary-value neutral">
              ${tierAdjustedExpectedSalary
                ? (
                    tierAdjustedExpectedSalary /
                    1_000_000
                  ).toFixed(1)
                : "—"}
              M
            </div>
          </div>

          <div className="salary-stat">
            <div className="salary-label">
              Contract Surplus
            </div>
            <div
              className={`salary-value ${
                salarySurplus > 0
                  ? "negative"
                  : salarySurplus < 0
                  ? "positive"
                  : ""
              }`}
            >
              {salarySurplus != null
                ? `${salarySurplus > 0 ? "-" : "+"}$${Math.abs(
                    salarySurplus / 1_000_000
                  ).toFixed(1)}M`
                : "—"}
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY + CONTRACT VALUE */}
      {selectedPlayer && (
        <>
          <div className="card value-grid">
            <div>
              <div className="value-label">
                {selectedPlayer.name}
              </div>
              <div className="value-main">
                {tier?.label ?? "—"}
              </div>
            </div>

            {compareMode && comparePlayer && (
              <div>
                <div className="value-label">
                  {comparePlayer.name}
                </div>
                <div className="value-main">
                  {compareTier?.label ?? "—"}
                </div>
              </div>
            )}
          </div>

          <div className="card value-grid">
            <div>
              <div className="value-label">
                Contract Evaluation
              </div>
              <div
                className={`value-main ${
                  contractEvaluation.tone === "positive"
                    ? "value-positive"
                    : contractEvaluation.tone === "negative"
                    ? "value-negative"
                    : ""
                }`}
              >
                {contractEvaluation.label}
              </div>

              {impactPerDollar && (
                <div className="subtle">
                  Impact per Cap Dollar:{" "}
                  {impactPerDollar}× league average
                </div>
              )}
            </div>

            {compareMode && comparePlayer && (
              <div>
                <div className="value-label">
                  Contract Evaluation
                </div>
                <div
                  className={`value-main ${
                    compareContractEvaluation.tone ===
                    "positive"
                      ? "value-positive"
                      : compareContractEvaluation.tone ===
                        "negative"
                      ? "value-negative"
                      : ""
                  }`}
                >
                  {compareContractEvaluation.label}
                </div>

                {compareImpactPerDollar && (
                  <div className="subtle">
                    Impact per Cap Dollar:{" "}
                    {compareImpactPerDollar}× league average
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}




























