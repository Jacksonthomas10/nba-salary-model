export default function ProjectionTable({ salaries, projectedValue }) {
  // salaries = { 2025: 27700000, 2026: 29500000, ... }

  const seasons = Object.keys(salaries)
    .map(Number)
    .sort((a, b) => a - b);

  let totalSurplus = 0;

  return (
    <div className="card">
      <h3>Multi-Year Projections</h3>

      <table className="table">
        <thead>
          <tr>
            <th>Season</th>
            <th>Projected Value</th>
            <th>Actual Salary</th>
            <th>Surplus</th>
          </tr>
        </thead>

        <tbody>
          {seasons.map((season) => {
            const salary = salaries[season];
            const surplus =
              projectedValue != null && salary != null
                ? projectedValue - salary
                : null;

            if (surplus != null) {
              totalSurplus += surplus;
            }

            return (
              <tr key={season}>
                <td>
                  {season}–{String(season + 1).slice(-2)}
                </td>

                <td>
                  {projectedValue
                    ? `$${(projectedValue / 1_000_000).toFixed(1)}M`
                    : "—"}
                </td>

                <td>
                  {salary
                    ? `$${(salary / 1_000_000).toFixed(1)}M`
                    : "Free Agent"}
                </td>

                <td
                  style={{
                    color:
                      surplus == null
                        ? "#475569"
                        : surplus >= 0
                        ? "#16a34a"
                        : "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  {surplus != null
                    ? `${surplus >= 0 ? "+" : ""}$${(
                        surplus / 1_000_000
                      ).toFixed(1)}M`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTAL SURPLUS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
          fontWeight: 700,
        }}
      >
        <span>Total Contract Surplus</span>
        <span
          style={{
            color:
              totalSurplus >= 0 ? "#16a34a" : "#dc2626",
          }}
        >
          {`${totalSurplus >= 0 ? "+" : ""}$${(
            totalSurplus / 1_000_000
          ).toFixed(1)}M`}
        </span>
      </div>
    </div>
  );
}

