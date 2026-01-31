import { useEffect, useState } from "react";
import Papa from "papaparse";

/* =========================
   Helpers
========================= */

function normalizeKeys(row) {
  const clean = {};
  Object.keys(row).forEach((key) => {
    const normalizedKey = key
      .replace(/^\uFEFF/, "") // remove BOM
      .trim()
      .toLowerCase();
    clean[normalizedKey] = row[key];
  });
  return clean;
}

function normalizeId(value) {
  if (value == null) return null;
  return String(value).trim();
}

function parseSalary(value) {
  if (!value) return null;
  return Number(String(value).replace(/[$,]/g, ""));
}

/* =========================
   Hook
========================= */

export default function usePlayerData() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCSV(path) {
      const res = await fetch(path);
      const text = await res.text();

      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data.map(normalizeKeys));
          },
          error: reject,
        });
      });
    }

    async function loadData() {
      try {
        setLoading(true);

        const pieRows = await loadCSV("/data/pie.csv");
        const salaryRows = await loadCSV("/data/salaries.csv");

        console.log("PIE rows loaded:", pieRows.length);
        console.log("Salary rows loaded:", salaryRows.length);
        console.log("PIE sample:", pieRows[0]);
        console.log("Salary sample:", salaryRows[0]);

        /* =========================
           Build salary lookup
        ========================= */

        const salaryById = {};
        salaryRows.forEach((row) => {
          const id = normalizeId(row.player_id);
          if (!id) return;

          salaryById[id] = {
            "2025-26": parseSalary(row["2025-26"]),
            "2026-27": parseSalary(row["2026-27"]),
            "2027-28": parseSalary(row["2027-28"]),
            "2028-29": parseSalary(row["2028-29"]),
          };
        });

        /* =========================
           Merge datasets
        ========================= */

        const merged = pieRows
          .map((row) => {
            const id = normalizeId(row.player_id);
            if (!id) return null;

            return {
              player_id: id,
              name: row.player?.trim(), // ✅ FIX
              team: row.team,
              pie: row.pie != null ? Number(row.pie) : null,
              minutes: row.minutes ? Number(row.minutes) : null,
              salaries: salaryById[id] || null,
            };
          })
          .filter(
            (p) =>
              p &&
              p.player_id &&
              p.name &&
              (p.pie != null || p.salaries != null)
          );

        console.log("Merged players:", merged.length);
        console.log("Sample merged player:", merged[0]);

        setPlayers(merged);
      } catch (err) {
        console.error("Failed to load player data:", err);
        setError(err.message || "Failed to load player data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { players, loading, error };
}












