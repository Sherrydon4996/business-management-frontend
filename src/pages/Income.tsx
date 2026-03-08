// src/pages/income/Income.tsx
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  TrendingUp,
  Search,
  Gamepad2,
  Monitor,
  Film,
  Calendar,
  CalendarDays,
  Trash2,
  Loader2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useIncomeApi } from "@/hooks/useIncomeAPi";
import { WeekFilter, type WeekRange } from "@/components/WeekFilter";
import type { Income, IncomeCategory, PaymentMethod } from "@/lib/types";
import { MONTHS_LABELS } from "@/utils/utils";
import { LoadingDataState } from "@/loaders/dataLoader";

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_CATEGORIES: IncomeCategory[] = [
  "PS Gaming",
  "Cyber Services",
  "Movie Rentals",
  "other",
];

const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "M-Pesa",
  "Card",
  "Bank Transfer",
];

const TABS = [
  {
    value: "ps",
    label: "PS Gaming",
    icon: Gamepad2,
    category: "PS Gaming" as IncomeCategory,
  },
  {
    value: "cyber",
    label: "Cyber Services",
    icon: Monitor,
    category: "Cyber Services" as IncomeCategory,
  },
  {
    value: "movie",
    label: "Movie Sales",
    icon: Film,
    category: "Movie Rentals" as IncomeCategory,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getNowEAT = (): string => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const eat = new Date(utcMs + 3 * 3_600_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${eat.getFullYear()}-${pad(eat.getMonth() + 1)}-${pad(eat.getDate())}` +
    `T${pad(eat.getHours())}:${pad(eat.getMinutes())}:${pad(eat.getSeconds())}+03:00`
  );
};

const formatKenyanDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Form State ───────────────────────────────────────────────────────────────

interface IncomeForm {
  amount: string;
  category: IncomeCategory | "";
  description: string;
  payment_method: PaymentMethod | "";
}

const EMPTY_FORM: IncomeForm = {
  amount: "",
  category: "",
  description: "",
  payment_method: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IncomePage() {
  const { user } = useAuth();
  const {
    incomeList,
    incomeLoading,
    createIncome,
    updateIncome,
    deleteIncome,
    isCreating,
    isUpdating,
    isDeleting,
  } = useIncomeApi();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Income | null>(null);

  const [form, setForm] = useState<IncomeForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<IncomeForm>(EMPTY_FORM);

  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRangeChange = useCallback(
    (range: WeekRange) => setWeekRange(range),
    [],
  );

  // ── Create ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.payment_method) return;

    await createIncome({
      amount: parseFloat(form.amount),
      category: form.category as IncomeCategory,
      description: form.description || undefined,
      payment_method: form.payment_method,
      date: getNowEAT(),
    });

    setForm(EMPTY_FORM);
    setCreateOpen(false);
  };

  // ── Edit / Update ─────────────────────────────────────────────────────────

  const openEdit = (entry: Income) => {
    setEditingEntry(entry);
    setEditForm({
      amount: String(entry.amount),
      category: entry.category,
      description: entry.description ?? "",
      payment_method: entry.payment_method,
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingEntry ||
      !editForm.amount ||
      !editForm.category ||
      !editForm.payment_method
    )
      return;

    setUpdatingId(editingEntry.id);
    try {
      await updateIncome({
        id: editingEntry.id,
        amount: parseFloat(editForm.amount),
        category: editForm.category as IncomeCategory,
        description: editForm.description || undefined,
        payment_method: editForm.payment_method as PaymentMethod,
      });
      setEditOpen(false);
      setEditingEntry(null);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteIncome(id);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filters ──────────────────────────────────────────────────────────────

  const filterByWeek = (list: Income[]) => {
    if (!weekRange) return list;
    return list.filter((e) => {
      const d = new Date(e.date);
      return d >= weekRange.start && d <= weekRange.end;
    });
  };

  const filterBySearch = (list: Income[]) =>
    list.filter(
      (e) =>
        (e.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        e.payment_method.toLowerCase().includes(search.toLowerCase()),
    );

  // ── Totals ────────────────────────────────────────────────────────────────

  const now = new Date();
  const eatOffset = 3 * 3_600_000;
  const kenyanNow = new Date(
    now.getTime() + now.getTimezoneOffset() * 60_000 + eatOffset,
  );
  const currentMonth = kenyanNow.getMonth();
  const currentYear = kenyanNow.getFullYear();

  const monthlyTotal = useMemo(
    () =>
      incomeList
        .filter((e) => {
          const d = new Date(e.date);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        })
        .reduce((s, e) => s + e.amount, 0),
    [incomeList, currentMonth, currentYear],
  );

  const yearlyTotal = useMemo(
    () =>
      incomeList
        .filter((e) => new Date(e.date).getFullYear() === currentYear)
        .reduce((s, e) => s + e.amount, 0),
    [incomeList, currentYear],
  );

  // ── Shared form fields renderer ───────────────────────────────────────────

  const renderFormFields = (
    f: IncomeForm,
    setF: React.Dispatch<React.SetStateAction<IncomeForm>>,
  ) => (
    <>
      <div className="space-y-2">
        <Label>Amount (KES) *</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={f.amount}
          onChange={(e) =>
            setF((prev) => ({ ...prev, amount: e.target.value }))
          }
          required
          min="1"
        />
      </div>
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select
          value={f.category}
          onValueChange={(v) =>
            setF((prev) => ({ ...prev, category: v as IncomeCategory }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {INCOME_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Payment Method *</Label>
        <Select
          value={f.payment_method}
          onValueChange={(v) =>
            setF((prev) => ({ ...prev, payment_method: v as PaymentMethod }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
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
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          placeholder="Optional description"
          value={f.description}
          onChange={(e) =>
            setF((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>
    </>
  );

  // ── Tab renderer ─────────────────────────────────────────────────────────

  const renderTab = (category: IncomeCategory) => {
    const data = filterBySearch(
      filterByWeek(incomeList).filter((e) => e.category === category),
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = data.reduce((s, e) => s + e.amount, 0);

    return (
      <div className="space-y-4">
        <div className="gradient-income text-white px-6 py-3 rounded-xl inline-block">
          <p className="text-sm text-white/80">{category} Total</p>
          <p className="text-2xl font-bold">KES {total.toLocaleString()}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {incomeLoading ? (
            <LoadingDataState title="Income" text="Fetching income data..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Payment
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      By
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((e, i) => (
                    <motion.tr
                      key={e.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground text-xs whitespace-nowrap">
                        {formatKenyanDateTime(e.date)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {e.description ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {e.payment_method}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {e.recorded_by}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-success whitespace-nowrap">
                        + KES {e.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* ── Edit button ── */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            disabled={isUpdating}
                            onClick={() => openEdit(e)}
                          >
                            {updatingId === e.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Pencil className="w-4 h-4" />
                            )}
                          </Button>

                          {/* ── Delete button ── */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isDeleting}
                            onClick={() => handleDelete(e.id)}
                          >
                            {deletingId === e.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}

                  {data.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-success" /> Income
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all business income by category
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ── Create Dialog ── */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-income border-0 text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Income</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {renderFormFields(form, setForm)}
                <p className="text-xs text-muted-foreground">
                  Time will be recorded automatically in Kenyan time (EAT
                  +03:00)
                </p>
                <Button
                  type="submit"
                  className="w-full gradient-income border-0 text-white"
                  disabled={isCreating}
                >
                  {isCreating && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Income
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Income Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            {renderFormFields(editForm, setEditForm)}
            <p className="text-xs text-muted-foreground">
              The original date/time will be preserved unless intentionally
              changed via the API.
            </p>
            <Button
              type="submit"
              className="w-full gradient-income border-0 text-white"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Income
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Week filter */}
      <WeekFilter onRangeChange={handleRangeChange} />

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="ps" className="w-full">
          <TabsList className="mb-4">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-2"
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              {renderTab(t.category)}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Monthly & Yearly Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Total Income — {MONTHS_LABELS[currentMonth]} {currentYear}
              </p>
              <p className="text-xl font-bold text-emerald-600">
                KES {Math.round(monthlyTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Total Income — {currentYear}
              </p>
              <p className="text-xl font-bold text-emerald-600">
                KES {Math.round(yearlyTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
