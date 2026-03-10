// src/pages/debts/Debts.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCheck,
  AlertTriangle,
  Loader2,
  HandCoins,
  BadgeDollarSign,
  TrendingDown,
  ShieldAlert,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/StatCard";
import { formatKenyanDateTime } from "@/utils/utils";
import {
  useDebtsApi,
  type Debt,
  type DebtStatus,
  type IncomeCategory,
  type CreateDebtPayload,
  type UpdateDebtPayload,
} from "@/hooks/useDebtsApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: IncomeCategory[] = [
  "PS Gaming",
  "Cyber Services",
  "Movie Rentals",
];
const PAYMENT_METHODS = ["Cash", "M-Pesa", "Card", "Bank Transfer"];
const STATUS_OPTS: (DebtStatus | "all")[] = [
  "all",
  "pending",
  "partial",
  "settled",
  "defaulted",
];

const CATEGORY_COLORS: Record<IncomeCategory, string> = {
  "PS Gaming":
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "Cyber Services":
    "bg-blue-500/10   text-blue-600   dark:text-blue-400   border-blue-500/20",
  "Movie Rentals":
    "bg-amber-500/10  text-amber-600  dark:text-amber-400  border-amber-500/20",
};

const STATUS_COLORS: Record<DebtStatus, string> = {
  pending:
    "bg-orange-500/10  text-orange-600  dark:text-orange-400  border-orange-500/20",
  partial:
    "bg-yellow-500/10  text-yellow-600  dark:text-yellow-400  border-yellow-500/20",
  settled:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  defaulted:
    "bg-red-500/10     text-red-600     dark:text-red-400     border-red-500/20",
};

const getNowEATIso = () => {
  const now = new Date();
  const eatMs = now.getTime() + 3 * 3_600_000;
  const d = new Date(eatMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00+03:00`
  );
};

const currentYear = () => String(new Date().getFullYear());

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DebtStatus }) {
  const labels: Record<DebtStatus, string> = {
    pending: "Pending",
    partial: "Partial",
    settled: "Settled",
    defaulted: "Bad Debt",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function CategoryBadge({ cat }: { cat: IncomeCategory }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${CATEGORY_COLORS[cat]}`}
    >
      {cat}
    </span>
  );
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = (): CreateDebtPayload => ({
  customer_name: "",
  customer_phone: "",
  amount: 0,
  income_category: "PS Gaming",
  description: "",
  payment_method: "Cash",
  date: getNowEATIso(),
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Debts() {
  // ── Filters ───────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>(currentYear());
  const [search, setSearch] = useState("");

  const apiFilters: Record<string, string> = {};
  if (statusFilter !== "all") apiFilters.status = statusFilter;
  if (categoryFilter !== "all") apiFilters.category = categoryFilter;
  if (yearFilter) apiFilters.year = yearFilter;

  const {
    debts,
    summary,
    isLoading,
    deletingId,
    settlingId,
    defaultingId,
    savingId,
    createDebt,
    isCreating,
    updateDebt,
    deleteDebt,
    settleDebt,
    toggleDefault,
  } = useDebtsApi(apiFilters);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState<CreateDebtPayload>(emptyForm());
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [editForm, setEditForm] = useState<UpdateDebtPayload>({});
  const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
  const [settleAmt, setSettleAmt] = useState<string>("");
  const [settleAll, setSettleAll] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = debts.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.customer_name.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.income_category.toLowerCase().includes(q)
    );
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(emptyForm());
    setCreateOpen(true);
  };

  const handleCreate = () => {
    if (!form.customer_name.trim() || !form.amount) return;
    createDebt(
      { ...form, amount: Number(form.amount) },
      { onSuccess: () => setCreateOpen(false) },
    );
  };

  const openEdit = (d: Debt) => {
    setEditDebt(d);
    setEditForm({
      customer_name: d.customer_name,
      customer_phone: d.customer_phone ?? "",
      amount: d.amount,
      income_category: d.income_category,
      description: d.description ?? "",
      payment_method: d.payment_method,
      date: d.date,
    });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editDebt) return;
    updateDebt(
      {
        id: editDebt.id,
        ...editForm,
        amount: editForm.amount ? Number(editForm.amount) : undefined,
      },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  const openSettle = (d: Debt) => {
    setActiveDebt(d);
    setSettleAmt("");
    setSettleAll(false);
    setSettleOpen(true);
  };

  const handleSettle = () => {
    if (!activeDebt) return;
    settleDebt(
      {
        id: activeDebt.id,
        ...(settleAll
          ? { settle_all: true }
          : { settle_amount: Number(settleAmt) }),
      },
      { onSuccess: () => setSettleOpen(false) },
    );
  };

  const openDelete = (d: Debt) => {
    setActiveDebt(d);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!activeDebt) return;
    deleteDebt(activeDebt.id, { onSuccess: () => setDeleteOpen(false) });
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <HandCoins className="w-7 h-7 text-primary" /> Debts
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track customer debts · settlements auto-post to the correct income
          category
        </p>
      </motion.div>

      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Owed"
            value={summary.total_owed ?? 0}
            icon={BadgeDollarSign}
            variant="total"
            delay={0}
          />
          <StatCard
            title="Total Collected"
            value={summary.total_collected ?? 0}
            icon={CheckCheck}
            variant="income"
            delay={80}
          />
          <StatCard
            title="Still Outstanding"
            value={summary.total_outstanding ?? 0}
            icon={TrendingDown}
            variant="expense"
            delay={160}
          />
          <StatCard
            title="Bad Debts"
            value={summary.defaulted_count ?? 0}
            icon={ShieldAlert}
            variant="profit"
            delay={240}
            format="count"
          />
        </div>
      )}

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 text-xs font-medium">
        {[
          { label: `All (${summary.total_count ?? 0})`, val: "all" },
          { label: `Pending (${summary.pending_count ?? 0})`, val: "pending" },
          { label: `Partial (${summary.partial_count ?? 0})`, val: "partial" },
          { label: `Settled (${summary.settled_count ?? 0})`, val: "settled" },
          {
            label: `Bad Debt (${summary.defaulted_count ?? 0})`,
            val: "defaulted",
          },
        ].map((s) => (
          <button
            key={s.val}
            onClick={() => setStatusFilter(s.val)}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === s.val
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-accent"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Filters + Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-44 text-sm"
            />
          </div>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year filter */}
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-9 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["2026", "2025", "2024"].map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={openCreate}
          className="gradient-income border-0 text-white h-9 text-sm shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Record Debt
        </Button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      "Customer",
                      "Category",
                      "Amount",
                      "Settled",
                      "Balance",
                      "Method",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${i >= 7 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No debts found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((d) => (
                    <tr
                      key={d.id}
                      className={`border-b border-border/50 transition-colors ${
                        d.status === "defaulted"
                          ? "bg-red-500/5 hover:bg-red-500/10"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground leading-tight">
                          {d.customer_name}
                        </div>
                        {d.customer_phone && (
                          <div className="text-[11px] text-muted-foreground">
                            {d.customer_phone}
                          </div>
                        )}
                        {d.description && (
                          <div className="text-[11px] text-muted-foreground/60 truncate max-w-[160px]">
                            {d.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge cat={d.income_category} />
                      </td>
                      <td className="py-3 px-4 font-semibold tabular-nums">
                        KES {d.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {d.amount_settled > 0
                          ? `KES ${d.amount_settled.toLocaleString()}`
                          : "—"}
                      </td>
                      <td
                        className={`py-3 px-4 font-bold tabular-nums ${d.balance > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        KES {d.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {d.payment_method}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatKenyanDateTime(d.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Settle button — only when not settled/defaulted */}
                          {d.status !== "settled" &&
                            d.status !== "defaulted" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10"
                                title="Settle payment"
                                onClick={() => openSettle(d)}
                                disabled={settlingId === d.id}
                              >
                                {settlingId === d.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            )}
                          {/* Edit */}
                          {d.status !== "settled" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Edit"
                              onClick={() => openEdit(d)}
                              disabled={savingId === d.id}
                            >
                              {savingId === d.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Pencil className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                          {/* Default toggle */}
                          {d.status !== "settled" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-7 w-7 ${d.status === "defaulted" ? "text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:text-red-500"}`}
                              title={
                                d.status === "defaulted"
                                  ? "Remove bad debt flag"
                                  : "Mark as bad debt"
                              }
                              onClick={() => toggleDefault(d.id)}
                              disabled={defaultingId === d.id}
                            >
                              {defaultingId === d.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                          {/* Delete */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Delete"
                            onClick={() => openDelete(d)}
                            disabled={deletingId === d.id}
                          >
                            {deletingId === d.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {filtered.length === 0 && (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No debts found.
                </p>
              )}
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className={`p-4 space-y-2 ${d.status === "defaulted" ? "bg-red-500/5" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {d.customer_name}
                      </p>
                      {d.customer_phone && (
                        <p className="text-xs text-muted-foreground">
                          {d.customer_phone}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={d.status} />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge cat={d.income_category} />
                    <span className="text-xs text-muted-foreground">
                      {d.payment_method}
                    </span>
                  </div>

                  {d.description && (
                    <p className="text-xs text-muted-foreground">
                      {d.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-bold">
                        KES {d.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Settled</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {d.amount_settled > 0
                          ? `KES ${d.amount_settled.toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Balance</p>
                      <p
                        className={`font-bold ${d.balance > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        KES {d.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground/60">
                    {formatKenyanDateTime(d.date)}
                  </p>

                  <div className="flex gap-1.5 pt-1">
                    {d.status !== "settled" && d.status !== "defaulted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                        onClick={() => openSettle(d)}
                        disabled={settlingId === d.id}
                      >
                        {settlingId === d.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCheck className="w-3 h-3 mr-1" />
                        )}
                        Settle
                      </Button>
                    )}
                    {d.status !== "settled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => openEdit(d)}
                      >
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    )}
                    {d.status !== "settled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 text-xs ${d.status === "defaulted" ? "text-red-500" : "text-muted-foreground"}`}
                        onClick={() => toggleDefault(d.id)}
                        disabled={defaultingId === d.id}
                      >
                        {defaultingId === d.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {d.status === "defaulted" ? "Un-default" : "Bad Debt"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-muted-foreground hover:text-destructive ml-auto"
                      onClick={() => openDelete(d)}
                      disabled={deletingId === d.id}
                    >
                      {deletingId === d.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* ── CREATE DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-primary" /> Record New Debt
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Customer Name *
                </label>
                <Input
                  placeholder="John Doe"
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customer_name: e.target.value }))
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Phone
                </label>
                <Input
                  placeholder="0712 345 678"
                  value={form.customer_phone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customer_phone: e.target.value }))
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Amount (KES) *
                </label>
                <Input
                  type="number"
                  min={1}
                  placeholder="500"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Payment Method
                </label>
                <Select
                  value={form.payment_method}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, payment_method: v }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Income Category *
              </label>
              <Select
                value={form.income_category}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    income_category: v as IncomeCategory,
                  }))
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground/60">
                When settled, income posts to this category automatically
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input
                placeholder="e.g. 2 games of FIFA on PS5"
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                isCreating || !form.customer_name.trim() || !form.amount
              }
              className="gradient-income border-0 text-white"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Record Debt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ───────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Debt —{" "}
              {editDebt?.customer_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Customer Name
                </label>
                <Input
                  value={editForm.customer_name ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      customer_name: e.target.value,
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Phone
                </label>
                <Input
                  value={editForm.customer_phone ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      customer_phone: e.target.value,
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {editDebt?.status === "pending" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Amount (KES)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={editForm.amount ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      amount: Number(e.target.value),
                    }))
                  }
                  className="h-9 text-sm"
                />
                <p className="text-[10px] text-muted-foreground/60">
                  Amount can only be changed before any payment is made
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <Select
                  value={editForm.income_category ?? "PS Gaming"}
                  onValueChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      income_category: v as IncomeCategory,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Payment Method
                </label>
                <Select
                  value={editForm.payment_method ?? "Cash"}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, payment_method: v }))
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input
                value={editForm.description ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={savingId === editDebt?.id}
              className="gradient-income border-0 text-white"
            >
              {savingId === editDebt?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SETTLE DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-500" /> Settle Payment
            </DialogTitle>
          </DialogHeader>

          {activeDebt && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {activeDebt.customer_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <CategoryBadge cat={activeDebt.income_category} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Debt</span>
                  <span className="font-semibold">
                    KES {activeDebt.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Settled</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    KES {activeDebt.amount_settled.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="text-muted-foreground font-medium">
                    Balance Due
                  </span>
                  <span className="font-bold text-destructive">
                    KES {activeDebt.balance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Amount to Settle (KES)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={activeDebt.balance}
                  placeholder={`Max: ${activeDebt.balance}`}
                  value={settleAll ? activeDebt.balance : settleAmt}
                  onChange={(e) => {
                    setSettleAmt(e.target.value);
                    setSettleAll(false);
                  }}
                  disabled={settleAll}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="settle-all"
                  checked={settleAll}
                  onChange={(e) => {
                    setSettleAll(e.target.checked);
                    if (e.target.checked) setSettleAmt("");
                  }}
                  className="w-4 h-4 accent-primary"
                />
                <label
                  htmlFor="settle-all"
                  className="text-sm cursor-pointer select-none"
                >
                  Settle full remaining balance (KES{" "}
                  {activeDebt.balance.toLocaleString()})
                </label>
              </div>

              <p className="text-[11px] text-muted-foreground/70 bg-primary/5 rounded-lg px-3 py-2 border border-primary/10">
                ✓ Income of{" "}
                <strong>
                  KES{" "}
                  {settleAll
                    ? activeDebt.balance.toLocaleString()
                    : (Number(settleAmt) || 0).toLocaleString()}
                </strong>{" "}
                will be automatically posted to{" "}
                <strong>{activeDebt.income_category}</strong>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSettle}
              disabled={
                settlingId === activeDebt?.id ||
                (!settleAll && (!settleAmt || Number(settleAmt) <= 0))
              }
              className="bg-emerald-600 hover:bg-emerald-700 border-0 text-white"
            >
              {settlingId === activeDebt?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCheck className="w-4 h-4 mr-2" />
              )}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Debt
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete the debt for{" "}
            <strong>{activeDebt?.customer_name}</strong>?
            {activeDebt && activeDebt.amount_settled > 0 && (
              <span className="block mt-1 text-amber-600 dark:text-amber-400">
                ⚠️ KES {activeDebt.amount_settled.toLocaleString()} has already
                been settled — those income records will remain.
              </span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingId === activeDebt?.id}
            >
              {deletingId === activeDebt?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
