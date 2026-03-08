// src/pages/dashboard/Dashboard.tsx

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Minus,
  BarChart3,
  Bot,
  CalendarDays,
  CalendarRange,
  CalendarCheck2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDashboardApi } from "@/hooks/useDashboardApi";
import { formatKenyanDateTime } from "@/lib/mockData";
import { DashboardSkeleton } from "@/loaders/spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  "#1A73E8",
  "#34A853",
  "#EA4335",
  "#FBBC04",
  "#9334E6",
  "#24C1E0",
];

const TOOLTIP_STYLE = {
  borderRadius: 4,
  border: "1px solid #e0e0e0",
  background: "#fff",
  fontSize: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  color: "#202124",
};

// ─── Period Card ──────────────────────────────────────────────────────────────

interface PeriodCardProps {
  icon: React.ElementType;
  label: string;
  income: number;
  expenses: number;
  profit: number;
  delay?: number;
}

function PeriodCard({
  icon: Icon,
  label,
  income,
  expenses,
  profit,
  delay = 0,
}: PeriodCardProps) {
  const isPositive = profit >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card flex flex-col"
    >
      {/* Top accent bar */}
      <div
        className={`h-[3px] w-full ${isPositive ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-red-500 to-red-400"}`}
      />

      <div className="px-5 pt-4 pb-5 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
              {label}
            </span>
          </div>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
        </div>

        {/* Net profit — hero number */}
        <div>
          <p
            className={`text-[26px] font-semibold tabular-nums leading-none tracking-tight ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
          >
            {isPositive ? "+" : "−"}{" "}
            <span className="text-[13px] font-medium mr-0.5 opacity-70">
              KES
            </span>
            {Math.abs(profit).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">
            {isPositive ? "Net Profit" : "Net Loss"}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Income / Expenses row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] shrink-0" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Income
              </span>
            </div>
            <p className="text-[13px] font-semibold tabular-nums text-[#1A73E8]">
              KES {income.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Expenses
              </span>
            </div>
            <p className="text-[13px] font-semibold tabular-nums text-red-500">
              KES {expenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chart Panel ──────────────────────────────────────────────────────────────

function ChartPanel({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-border">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Index() {
  const navigate = useNavigate();
  const { stats, isLoading } = useDashboardApi();

  if (isLoading && !stats) return <DashboardSkeleton />;

  const s = {
    todayIncome: stats?.todayIncome ?? 0,
    todayExpenses: stats?.todayExpenses ?? 0,
    todayProfit: stats?.todayProfit ?? 0,
    weekIncome: stats?.weekIncome ?? 0,
    weekExpenses: stats?.weekExpenses ?? 0,
    weekProfit: stats?.weekProfit ?? 0,
    monthIncome: stats?.monthIncome ?? 0,
    monthExpenses: stats?.monthExpenses ?? 0,
    monthProfit: stats?.monthProfit ?? 0,
    yearIncome: stats?.yearIncome ?? 0,
    yearExpenses: stats?.yearExpenses ?? 0,
    yearProfit: stats?.yearProfit ?? 0,
    last30Days: stats?.last30Days ?? [],
    incomeByCat: stats?.incomeByCat ?? [],
    expensesByCat: stats?.expensesByCat ?? [],
    weeklyComparison: stats?.weeklyComparison ?? [],
    recentTransactions: stats?.recentTransactions ?? [],
  };

  return (
    <div className="space-y-7 pb-10 max-w-[1200px]">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Real-time overview of your business finances
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => navigate("/income")}
              size="sm"
              className="h-8 px-3.5 text-[13px] rounded-lg bg-[#1A73E8] hover:bg-[#1557b0] text-white border-0 font-medium shadow-none"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Record Income
            </Button>
            <Button
              onClick={() => navigate("/expenses")}
              size="sm"
              className="h-8 px-3.5 text-[13px] rounded-lg bg-card hover:bg-muted text-red-500 border border-border font-medium shadow-none"
            >
              <Minus className="w-3.5 h-3.5 mr-1.5" /> Record Expense
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              size="sm"
              variant="outline"
              className="h-8 px-3.5 text-[13px] rounded-lg font-medium shadow-none"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Reports
            </Button>
            <Button
              onClick={() => navigate("/ai-assistant")}
              size="sm"
              className="h-8 px-3.5 text-[13px] rounded-lg bg-[#9334E6] hover:bg-[#7b2bc4] text-white border-0 font-medium shadow-none"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5" /> AI Assistant
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── 4 Period Cards ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
            Performance Overview
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <PeriodCard
            icon={CalendarDays}
            label="Today"
            income={s.todayIncome}
            expenses={s.todayExpenses}
            profit={s.todayProfit}
            delay={0.05}
          />
          <PeriodCard
            icon={CalendarRange}
            label="This Week"
            income={s.weekIncome}
            expenses={s.weekExpenses}
            profit={s.weekProfit}
            delay={0.1}
          />
          <PeriodCard
            icon={CalendarCheck2}
            label="This Month"
            income={s.monthIncome}
            expenses={s.monthExpenses}
            profit={s.monthProfit}
            delay={0.15}
          />
          <PeriodCard
            icon={PiggyBank}
            label="This Year"
            income={s.yearIncome}
            expenses={s.yearExpenses}
            profit={s.yearProfit}
            delay={0.2}
          />
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPanel title="Income vs Expenses — Last 30 Days" delay={0.3}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={s.last30Days} margin={{ left: -10, right: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#1A73E8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EA4335"
                strokeWidth={2}
                dot={false}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Weekly Performance — Last 6 Weeks" delay={0.35}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={s.weeklyComparison}
              margin={{ left: -10, right: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Bar dataKey="income" fill="#1A73E8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="#EA4335" radius={[3, 3, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Income by Category" delay={0.4}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={s.incomeByCat}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {s.incomeByCat.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Expenses by Category" delay={0.45}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={s.expensesByCat}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {s.expensesByCat.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => `KES ${v.toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* ── Recent Transactions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-foreground">
            Recent Transactions
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {s.recentTransactions.length} entries
          </span>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-border sm:hidden">
          {s.recentTransactions.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            s.recentTransactions.map((t) => (
              <div
                key={t.id}
                className="px-4 py-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                        t.type === "income"
                          ? "bg-blue-500/10 text-[#1A73E8]"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "INCOME" : "EXPENSE"}
                    </span>
                    <span className="text-[12px] text-muted-foreground truncate">
                      {t.category}
                    </span>
                  </div>
                  {t.description !== "—" && (
                    <p className="text-[12px] text-foreground truncate mt-0.5">
                      {t.description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {formatKenyanDateTime(t.date)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[13px] font-semibold tabular-nums whitespace-nowrap ${
                    t.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500"
                  }`}
                >
                  {t.type === "income" ? "+" : "−"} KES{" "}
                  {t.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-muted/40">
                {[
                  "Date & Time",
                  "Type",
                  "Category",
                  "Description",
                  "Amount",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`py-2.5 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.06em] border-b border-border ${
                      i === 4 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.recentTransactions.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-border/60 hover:bg-muted/30 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}
                >
                  <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                    {formatKenyanDateTime(t.date)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm ${
                        t.type === "income"
                          ? "bg-blue-500/10 text-[#1A73E8]"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "INCOME" : "EXPENSE"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-foreground">{t.category}</td>
                  <td className="py-2.5 px-4 text-muted-foreground max-w-[200px] truncate">
                    {t.description}
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right font-semibold tabular-nums whitespace-nowrap ${
                      t.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"} KES{" "}
                    {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {s.recentTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-[13px] text-muted-foreground"
                  >
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
