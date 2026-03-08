// src/pages/daily-earnings/DailyEarnings.tsx
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, CalendarDays, TrendingUp, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WeekFilter, type WeekRange } from "@/components/WeekFilter";
import {
  useDailyEarningsApi,
  type DailyEarningRow,
} from "@/hooks/useDailyEarningsAPi";
import { LoadingDataState } from "@/loaders/dataLoader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getKenyanNow = () =>
  new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));

const MONTHS_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Returns a YYYY-MM-DD string from a Date in Kenyan time */
const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Given a week range (start = Monday, end = Sunday), return an array of 7
 * date-key strings covering every day of that week.
 */
const buildWeekDays = (range: WeekRange): string[] => {
  const days: string[] = [];
  const cursor = new Date(range.start);
  for (let i = 0; i < 7; i++) {
    days.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

/** Derive the current week's Monday–Sunday range from a Kenyan "now" date */
const getCurrentWeekRange = (now: Date): WeekRange => {
  const day = now.getDay(); // 0 = Sun … 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
};

const EMPTY_ROW = (date_key: string): DailyEarningRow => ({
  date_key,
  ps_gaming: 0,
  cyber_services: 0,
  movie_rentals: 0,
  other_income: 0,
  total_income: 0,
  total_expenses: 0,
  net_total: 0,
});

const getLabel = (total: number) => {
  if (total >= 1000)
    return {
      text: "Excellent",
      bg: "bg-emerald-500/20 border-emerald-500",
      textColor: "text-emerald-400",
    };
  if (total >= 500)
    return {
      text: "Good",
      bg: "bg-blue-500/20 border-blue-500",
      textColor: "text-blue-400",
    };
  if (total >= 200)
    return {
      text: "Fair",
      bg: "bg-yellow-500/20 border-yellow-500",
      textColor: "text-yellow-400",
    };
  return {
    text: "Bad",
    bg: "bg-red-500/20 border-red-500",
    textColor: "text-red-400",
  };
};

const getRowBg = (total: number, isEmpty: boolean) => {
  if (isEmpty) return "opacity-50";
  if (total >= 1000) return "bg-emerald-500/10";
  if (total >= 500) return "bg-blue-500/10";
  if (total >= 200) return "bg-yellow-500/10";
  return "bg-red-500/10";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DailyEarnings() {
  const { dailyRows, isLoading } = useDailyEarningsApi();

  const kenyanNow = getKenyanNow();
  const currentMonth = kenyanNow.getMonth();
  const currentYear = kenyanNow.getFullYear();
  const todayKey = toDateKey(kenyanNow);

  // Default the week range to the current week so we always have 7 days visible
  const [weekRange, setWeekRange] = useState<WeekRange>(() =>
    getCurrentWeekRange(kenyanNow),
  );

  const handleRangeChange = useCallback(
    (range: WeekRange) => setWeekRange(range),
    [],
  );

  // ── Build the 7-day grid ──────────────────────────────────────────────────

  /**
   * Index fetched rows by date_key for O(1) lookup, then map every day of
   * the selected week to either the real row or a zero-filled placeholder.
   */
  const weekRows = useMemo(() => {
    const byKey = new Map<string, DailyEarningRow>();
    for (const r of dailyRows) byKey.set(r.date_key, r);

    return buildWeekDays(weekRange).map((key) => ({
      row: byKey.get(key) ?? EMPTY_ROW(key),
      isEmpty: !byKey.has(key),
    }));
  }, [dailyRows, weekRange]);

  // ── Monthly / Yearly totals (still calculated from full dataset) ──────────

  const monthlyTotal = useMemo(
    () =>
      dailyRows
        .filter((r) => {
          const d = new Date(r.date_key + "T00:00:00+03:00");
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        })
        .reduce((s, r) => s + r.net_total, 0),
    [dailyRows, currentMonth, currentYear],
  );

  const yearlyTotal = useMemo(
    () =>
      dailyRows
        .filter(
          (r) =>
            new Date(r.date_key + "T00:00:00+03:00").getFullYear() ===
            currentYear,
        )
        .reduce((s, r) => s + r.net_total, 0),
    [dailyRows, currentYear],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" /> Daily Earnings
        </h1>
        <p className="text-muted-foreground mt-1">
          Daily breakdown of income by category minus expenses
        </p>
      </motion.div>

      {/* Daily Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Daily Totals
            </h2>
            <WeekFilter onRangeChange={handleRangeChange} />
          </div>

          {isLoading ? (
            <LoadingDataState title="Earnings" text="Fetching daily earnings" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium">
                      Date
                    </th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-medium">
                      PS Games
                    </th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-medium">
                      Cyber
                    </th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-medium">
                      Movies
                    </th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-medium">
                      Others
                    </th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-medium">
                      Expenses
                    </th>
                    <th className="text-right py-3 px-3 text-muted-foreground font-medium">
                      Total
                    </th>
                    <th className="text-left py-3 px-3 text-muted-foreground font-medium">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {weekRows.map(({ row, isEmpty }, i) => {
                    const label = getLabel(row.net_total);
                    const isToday = row.date_key === todayKey;
                    const dateObj = new Date(row.date_key + "T00:00:00+03:00");
                    const dateDisplay = dateObj.toLocaleDateString("en-KE", {
                      timeZone: "Africa/Nairobi",
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <motion.tr
                        key={row.date_key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className={[
                          "border-b border-border/50 transition-colors",
                          getRowBg(row.net_total, isEmpty),
                          isToday ? "ring-1 ring-inset ring-primary/40" : "",
                        ].join(" ")}
                      >
                        {/* Date cell */}
                        <td className="py-3 px-3 font-medium whitespace-nowrap">
                          <span
                            className={
                              isToday
                                ? "text-primary font-bold"
                                : "text-foreground"
                            }
                          >
                            {dateDisplay}
                          </span>
                          {isToday && (
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                              Today
                            </span>
                          )}
                        </td>

                        {/* Income columns */}
                        <td className="py-3 px-3 text-right text-foreground">
                          {row.ps_gaming > 0
                            ? `KES ${row.ps_gaming.toLocaleString()}`
                            : 0}
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">
                          {row.cyber_services > 0
                            ? `KES ${row.cyber_services.toLocaleString()}`
                            : "0"}
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">
                          {row.movie_rentals > 0
                            ? `KES ${row.movie_rentals.toLocaleString()}`
                            : "0"}
                        </td>
                        <td className="py-3 px-3 text-right text-foreground">
                          {row.other_income > 0
                            ? `KES ${row.other_income.toLocaleString()}`
                            : "0"}
                        </td>

                        {/* Expenses */}
                        <td className="py-3 px-3 text-right text-destructive font-medium">
                          {row.total_expenses > 0
                            ? `- KES ${row.total_expenses.toLocaleString()}`
                            : "0"}
                        </td>

                        {/* Net total */}
                        <td
                          className={`py-3 px-3 text-right font-bold ${isEmpty ? "text-muted-foreground" : row.net_total >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {isEmpty
                            ? "0"
                            : `KES ${row.net_total.toLocaleString()}`}
                        </td>

                        {/* Rating badge */}
                        <td className="py-3 px-3">
                          {isEmpty ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-muted/30 border-border text-muted-foreground">
                              No data
                            </span>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${label.bg} ${label.textColor}`}
                            >
                              {label.text}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>

                {/* Weekly subtotal footer */}
                {!isLoading && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td className="py-3 px-3 font-bold text-foreground">
                        Week Total
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-foreground">
                        KES{" "}
                        {weekRows
                          .reduce((s, { row }) => s + row.ps_gaming, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-foreground">
                        KES{" "}
                        {weekRows
                          .reduce((s, { row }) => s + row.cyber_services, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-foreground">
                        KES{" "}
                        {weekRows
                          .reduce((s, { row }) => s + row.movie_rentals, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-foreground">
                        KES{" "}
                        {weekRows
                          .reduce((s, { row }) => s + row.other_income, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-destructive">
                        - KES{" "}
                        {weekRows
                          .reduce((s, { row }) => s + row.total_expenses, 0)
                          .toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-success">
                        KES{" "}
                        {weekRows
                          .reduce((s, { row }) => s + row.net_total, 0)
                          .toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />{" "}
              Excellent (≥1,000 KES)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{" "}
              Good (≥500 KES)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />{" "}
              Fair (200–499 KES)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{" "}
              Bad (&lt;200 KES)
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Monthly & Yearly Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Net Earnings — {MONTHS_LABELS[currentMonth]} {currentYear}
              </p>
              <p
                className={`text-xl font-bold ${monthlyTotal >= 0 ? "text-primary" : "text-destructive"}`}
              >
                KES {Math.round(monthlyTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Net Earnings — {currentYear}
              </p>
              <p
                className={`text-xl font-bold ${yearlyTotal >= 0 ? "text-primary" : "text-destructive"}`}
              >
                KES {Math.round(yearlyTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
