import { useMemo } from "react";

function addDays(d: Date, n: number) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  x.setDate(x.getDate() + (day === 0 ? -6 : 1 - day));
  return x;
}

function formatKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type CellMeta = { key: string; count: number | null; label: string };
type ColumnMeta = { weekIndex: number; weekStartKey: string; cells: CellMeta[] };

function buildGrid(year: number, days: Record<string, number>) {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const rangeEnd = year === today.getFullYear() ? todayStart : dec31;

  let weekStart = startOfWeekMonday(jan1);
  const columns: ColumnMeta[] = [];
  let weekIndex = 0;

  while (weekStart <= rangeEnd && columns.length < 56) {
    const monday = new Date(weekStart);
    const cells: CellMeta[] = [];
    for (let r = 0; r < 7; r++) {
      const d = addDays(monday, r);
      if (d < jan1 || d > rangeEnd) {
        cells.push({ key: "", count: null, label: "" });
      } else {
        const key = formatKey(d);
        cells.push({
          key,
          count: days[key] ?? 0,
          label: d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
        });
      }
    }
    columns.push({ weekIndex, weekStartKey: formatKey(monday), cells });
    weekStart = addDays(weekStart, 7);
    weekIndex++;
  }

  return { columns };
}

function buildMonthLabels(columns: ColumnMeta[], year: number) {
  const seenMonths = new Set<number>();
  return columns.map((col) => {
    const monday = new Date(col.weekStartKey + "T12:00:00");
    for (let r = 0; r < 7; r++) {
      const d = addDays(monday, r);
      if (d.getFullYear() !== year) continue;
      const m = d.getMonth();
      if (!seenMonths.has(m) && d.getDate() <= 7) {
        seenMonths.add(m);
        return d.toLocaleDateString("en-IN", { month: "short" });
      }
    }
    return "";
  });
}

const CELL = 13;
const GAP = 3;
const DAY_LABEL_W = 30;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LEVEL_STYLE: Record<number, React.CSSProperties> = {
  0: { background: "#f3f4f6", border: "1px solid #e5e7eb" },
  4: { background: "#10b981", border: "1px solid rgba(5,150,105,0.6)", boxShadow: "0 0 6px rgba(16,185,129,0.3)" },
};
const SUNDAY_STYLE: Record<number, React.CSSProperties> = {
  0: { background: "#e9e9ee", border: "1px solid #d1d1db" },
  4: { background: "#10b981", border: "1px solid rgba(5,150,105,0.6)", boxShadow: "0 0 6px rgba(16,185,129,0.3)" },
};

export function MemberAttendanceHeatmap({
  year,
  days,
  totalVisits,
  uniqueDays,
}: {
  year: number;
  days: Record<string, number>;
  totalVisits: number;
  uniqueDays: number;
}) {
  const { columns } = useMemo(() => buildGrid(year, days), [year, days]);
  const monthLabels = useMemo(() => buildMonthLabels(columns, year), [columns, year]);

  if (columns.length === 0)
    return <p className="text-sm text-gray-500 py-6 text-center">No data for this year.</p>;

  // Grid: col 0 = day labels, cols 1..N = weeks
  //       row 0 = month labels, rows 1..7 = Mon–Sun
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `${DAY_LABEL_W}px repeat(${columns.length}, ${CELL}px)`,
    gridTemplateRows: `14px repeat(7, ${CELL}px)`,
    gap: `${GAP}px`,
    alignItems: "center",
  };

  return (
    <div className="space-y-4">
      {/* Total count summary */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-gray-900 leading-none tabular-nums">{totalVisits}</span>
          <span className="text-[11px] text-gray-400 mt-0.5">Total visits</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-2xl font-black text-gray-900 leading-none tabular-nums">{uniqueDays}</span>
          <span className="text-[11px] text-gray-400 mt-0.5">Active days</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex flex-col">
          <span className="text-2xl font-black text-gray-900 leading-none tabular-nums">
            {uniqueDays > 0 ? (totalVisits / uniqueDays).toFixed(1) : "—"}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">Avg / day</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div style={{ minWidth: DAY_LABEL_W + columns.length * (CELL + GAP) }}>
          <div style={gridStyle}>
            {/* ── Row 0: month labels ── */}
            {/* top-left spacer */}
            <div style={{ gridColumn: 1, gridRow: 1 }} />
            {monthLabels.map((text, ci) => (
              <div
                key={ci}
                style={{
                  gridColumn: ci + 2,
                  gridRow: 1,
                  fontSize: 10,
                  color: "#6b7280",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "visible",
                }}
              >
                {text}
              </div>
            ))}

            {/* ── Rows 1–7: day labels ── */}
            {DAYS.map((d, ri) => {
              const isSun = ri === 6;
              return (
                <div
                  key={d}
                  style={{
                    gridColumn: 1,
                    gridRow: ri + 2,
                    fontSize: 10,
                    color: isSun ? "#a78bfa" : "#9ca3af",
                    fontWeight: isSun ? 600 : 400,
                    textAlign: "right",
                    paddingRight: 6,
                    lineHeight: `${CELL}px`,
                  }}
                >
                  {d}
                </div>
              );
            })}

            {/* ── Cells ── */}
            {columns.map((col, ci) =>
              col.cells.map((cell, ri) => {
                if (cell.count === null)
                  return <div key={`${ci}-${ri}`} style={{ gridColumn: ci + 2, gridRow: ri + 2 }} />;
                const visited = cell.count > 0;
                const isSun = ri === 6;
                const styleMap = isSun ? SUNDAY_STYLE : LEVEL_STYLE;
                return (
                  <div
                    key={cell.key}
                    title={`${cell.label}${visited ? " · visited" : ""}`}
                    style={{
                      gridColumn: ci + 2,
                      gridRow: ri + 2,
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      ...(visited ? styleMap[4] : styleMap[0]),
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-[11px] text-gray-400">Each square = one day · <span style={{ color: "#a78bfa" }}>Sun</span> rows are highlighted</p>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <div style={{ width: CELL, height: CELL, borderRadius: 3, ...LEVEL_STYLE[0] }} />
          <span>Not visited</span>
          <div style={{ width: CELL, height: CELL, borderRadius: 3, ...LEVEL_STYLE[4] }} />
          <span>Visited</span>
          <div style={{ width: CELL, height: CELL, borderRadius: 3, ...SUNDAY_STYLE[0] }} />
          <span style={{ color: "#a78bfa" }}>Sunday</span>
        </div>
      </div>
    </div>
  );
}
