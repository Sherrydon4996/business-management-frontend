// src/pages/weekly-summary/WeeklySummary.tsx

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  PiggyBank,
  Calendar,
  CalendarDays,
  HandCoins,
} from "lucide-react";
import { MONTHS_LABELS } from "@/utils/utils";
import { useWeeklySummaryApi } from "@/hooks/useWeeklysummaryApi";
import { LoadingDataState } from "@/loaders/dataLoader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getKenyanNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utc + 3 * 3_600_000);
};

const kenyanNow = getKenyanNow();
const currentYear = kenyanNow.getFullYear();
const years = Array.from(
  { length: 2050 - currentYear + 1 },
  (_, i) => currentYear + i,
);

const getSavingsColor = (savings: number) => {
  if (savings >= 5000)
    return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  if (savings >= 2000) return "bg-blue-500/15 text-blue-700 border-blue-500/30";
  if (savings >= 0) return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  return "bg-red-500/15 text-red-700 border-red-500/30";
};

const getSavingsLabel = (savings: number) => {
  if (savings >= 5000) return "Excellent";
  if (savings >= 2000) return "Good";
  if (savings >= 0) return "Fair";
  return "Loss";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklySummary() {
  const [selectedMonth, setSelectedMonth] = useState(kenyanNow.getMonth());
  const [selectedYear, setSelectedYear] = useState(kenyanNow.getFullYear());

  const { weeks, monthlyTotals, yearlyTotals, isLoading } = useWeeklySummaryApi(
    selectedMonth,
    selectedYear,
  );

  const totals = useMemo(
    () => ({
      earnings: weeks.reduce((s, w) => s + w.earnings, 0),
      contributions: weeks.reduce((s, w) => s + w.contributions, 0),
      expenses: weeks.reduce((s, w) => s + w.expenses, 0),
      savings: weeks.reduce((s, w) => s + w.savings, 0),
      debtOutstanding: weeks.reduce((s, w) => s + (w.debtOutstanding ?? 0), 0),
    }),
    [weeks],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Weekly Summary</h1>
        <p className="text-muted-foreground mt-1">
          Weekly breakdown of earnings, contributions, expenses, debts &amp;
          savings
        </p>
      </div>

      {/* Month & Year Selectors */}
      <div className="flex gap-3">
        <Select
          value={String(selectedMonth)}
          onValueChange={(v) => setSelectedMonth(Number(v))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS_LABELS.map((m, i) => (
              <SelectItem key={i} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-lg font-bold text-foreground">
                  KES {totals.earnings.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Contributions
                </p>
                <p className="text-lg font-bold text-foreground">
                  KES {totals.contributions.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-bold text-foreground">
                  KES {totals.expenses.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debt Outstanding card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <HandCoins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Outstanding Debt
                </p>
                <p
                  className={`text-lg font-bold ${totals.debtOutstanding > 0 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  KES {totals.debtOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Savings</p>
                <p
                  className={`text-lg font-bold ${totals.savings >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  KES {totals.savings.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {MONTHS_LABELS[selectedMonth]} {selectedYear} — 4 Weeks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingDataState
              title="Summary"
              text="getting weekly summary..."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                      <TableHead className="text-right">
                        Contributions
                      </TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Debt</TableHead>
                      <TableHead className="text-right">Savings</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weeks.map((week) => (
                      <TableRow key={week.weekNumber}>
                        <TableCell className="font-medium text-foreground">
                          Week {week.weekNumber}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                          {week.weekLabel}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          KES {week.earnings.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-medium">
                          KES {week.contributions.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          KES {week.expenses.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            (week.debtOutstanding ?? 0) > 0
                              ? "text-amber-600"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          KES {(week.debtOutstanding ?? 0).toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${week.savings >= 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                          KES {week.savings.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={getSavingsColor(week.savings)}
                          >
                            {getSavingsLabel(week.savings)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}

                    {weeks.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-8 text-center text-muted-foreground"
                        >
                          No data for this period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Savings = Earnings − Contributions − Expenses. &nbsp; Excellent
                ≥ 5,000 | Good ≥ 2,000 | Fair ≥ 0 | Loss &lt; 0
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Monthly & Yearly Summary Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly */}
        <Card className="p-5 border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Monthly Summary —{" "}
              {monthlyTotals
                ? `${MONTHS_LABELS[monthlyTotals.month!]} ${monthlyTotals.year}`
                : "—"}
            </p>
          </div>
          {monthlyTotals ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Earnings</span>
                <span className="font-medium text-emerald-600">
                  KES {monthlyTotals.earnings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contributions</span>
                <span className="font-medium text-blue-600">
                  KES {monthlyTotals.contributions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-medium text-destructive">
                  KES {monthlyTotals.expenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding Debt</span>
                <span
                  className={`font-medium ${(monthlyTotals.debtOutstanding ?? 0) > 0 ? "text-amber-600" : "text-muted-foreground/50"}`}
                >
                  KES {(monthlyTotals.debtOutstanding ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 mt-1">
                <span className="font-semibold text-foreground">Savings</span>
                <span
                  className={`font-bold ${monthlyTotals.savings >= 0 ? "text-emerald-600" : "text-destructive"}`}
                >
                  KES {monthlyTotals.savings.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </Card>

        {/* Yearly */}
        <Card className="p-5 border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Yearly Summary — {yearlyTotals?.year ?? "—"}
            </p>
          </div>
          {yearlyTotals ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Earnings</span>
                <span className="font-medium text-emerald-600">
                  KES {yearlyTotals.earnings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contributions</span>
                <span className="font-medium text-blue-600">
                  KES {yearlyTotals.contributions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-medium text-destructive">
                  KES {yearlyTotals.expenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding Debt</span>
                <span
                  className={`font-medium ${(yearlyTotals.debtOutstanding ?? 0) > 0 ? "text-amber-600" : "text-muted-foreground/50"}`}
                >
                  KES {(yearlyTotals.debtOutstanding ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1 mt-1">
                <span className="font-semibold text-foreground">Savings</span>
                <span
                  className={`font-bold ${yearlyTotals.savings >= 0 ? "text-emerald-600" : "text-destructive"}`}
                >
                  KES {yearlyTotals.savings.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
