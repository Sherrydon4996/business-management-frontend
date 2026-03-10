// src/pages/reports/Reports.tsx

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  HandCoins,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useReportsApi } from "@/hooks/useReportsApi";
import { LoadingDataState } from "@/loaders/dataLoader";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  "#1E40AF",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--card))",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Reports() {
  const {
    monthIncome,
    monthExpenses,
    netProfit,
    savingsRate,
    debtTotalIssued,
    debtTotalSettled,
    debtTotalOutstanding,
    debtTotalDefaulted,
    debtTotalCount,
    debtPendingCount,
    debtPartialCount,
    debtDefaultedCount,
    incomeByCat,
    expensesByCat,
    last30Days,
    debtLast30Days,
    isLoading,
  } = useReportsApi();

  if (isLoading && monthIncome === 0 && last30Days.length === 0) {
    return <LoadingDataState title="Reports" text="Getting Reports" />;
  }

  // ── Summary cards ─────────────────────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Income",
      value: monthIncome,
      icon: TrendingUp,
      cls: "gradient-income",
    },
    {
      label: "Total Expenses",
      value: monthExpenses,
      icon: TrendingDown,
      cls: "gradient-expense",
    },
    {
      label: "Net Profit/Loss",
      value: netProfit,
      icon: Wallet,
      cls: "gradient-profit",
    },
    {
      label: "Savings Rate",
      value: savingsRate,
      icon: Percent,
      cls: "gradient-total",
      suffix: "%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" /> Reports &amp; Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          This month's financial overview
        </p>
      </motion.div>

      {/* ── Income / Expense summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${c.cls} rounded-xl p-5 text-white`}
          >
            <div className="flex items-center gap-2 mb-2">
              <c.icon className="w-5 h-5 text-white/80" />
              <p className="text-sm text-white/80">{c.label}</p>
            </div>
            <p className="text-2xl font-bold">
              {c.suffix
                ? `${c.value}${c.suffix}`
                : `KES ${Number(c.value).toLocaleString()}`}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Debt summary card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <HandCoins className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Debt Overview
          </h3>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            All-time
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Issued */}
          <div className="rounded-lg bg-amber-500/8 border border-amber-500/15 p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Total Issued
            </p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              KES {debtTotalIssued.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {debtTotalCount} debt{debtTotalCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Settled */}
          <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/15 p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Total Settled
            </p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              KES {debtTotalSettled.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {debtTotalIssued > 0
                ? `${Math.round((debtTotalSettled / debtTotalIssued) * 100)}% recovery`
                : "—"}
            </p>
          </div>

          {/* Outstanding */}
          <div
            className={`rounded-lg border p-4 ${
              debtTotalOutstanding > 0
                ? "bg-red-500/8 border-red-500/15"
                : "bg-muted/40 border-border"
            }`}
          >
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Outstanding
            </p>
            <p
              className={`text-xl font-bold tabular-nums ${
                debtTotalOutstanding > 0
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              KES {debtTotalOutstanding.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {debtPendingCount + debtPartialCount} unpaid
            </p>
          </div>

          {/* Bad Debt */}
          <div
            className={`rounded-lg border p-4 ${
              debtTotalDefaulted > 0
                ? "bg-red-500/5 border-red-500/10"
                : "bg-muted/40 border-border"
            }`}
          >
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Bad Debt
            </p>
            <p
              className={`text-xl font-bold tabular-nums ${
                debtTotalDefaulted > 0
                  ? "text-red-500/70"
                  : "text-muted-foreground"
              }`}
            >
              KES {debtTotalDefaulted.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {debtDefaultedCount} defaulted
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line — Income vs Expenses 30 days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Income Trend (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={last30Days}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line — Debt issued vs settled 30 days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Debt Activity (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={debtLast30Days}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="issued"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="settled"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="outstanding"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 3"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie — Income by category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Income by Category
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={incomeByCat}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {incomeByCat.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie — Expenses by category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expensesByCat}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {expensesByCat.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Progress bars — Income breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl border border-border p-6 shadow-sm lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Income vs Expense Breakdown
          </h3>
          {incomeByCat.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No income data yet.
            </p>
          ) : (
            <div className="space-y-4">
              {incomeByCat.map((item, i) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-success font-medium">
                      KES {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          monthIncome > 0
                            ? `${Math.min((item.value / monthIncome) * 100, 100)}%`
                            : "0%",
                      }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
