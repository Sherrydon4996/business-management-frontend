// src/pages/contributions/Contributions.tsx
// EDIT NOTE (2026-03-19): Defaults explicitly confirmed + tiny non-breaking tweaks
// (header text, comment, whitespace & one inline note) so GitHub detects change
// and live deployment picks it up immediately. Core logic 100% unchanged.

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CalendarDays,
  Loader2,
  Trash2,
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
import { WeekFilter, type WeekRange } from "@/components/WeekFilter";
import { MONTHS_LABELS } from "@/utils/utils";
import { formatKenyanDateTime } from "@/utils/utils";
import {
  useContributionsApi,
  type Contribution,
  type ContributionType,
  type ContributionStatus,
} from "@/hooks/useContributionsApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = ["Cash", "M-Pesa", "Card", "Bank Transfer"];

const CONTRIBUTION_STATUSES: ContributionStatus[] = [
  "paid",
  "pending",
  "overdue",
];

const TYPE_DEFAULTS: Record<ContributionType, number | null> = {
  weekly_group: 500, // ← Confirmed
  cooperative_bank: 1000, // ← Confirmed
  caritas_bank: 500, // ← Confirmed
  custom: null,
};

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

const getKenyanNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utc + 3 * 3_600_000);
};

// ─── Form Types ───────────────────────────────────────────────────────────────

interface ContribForm {
  amount: string;
  type: ContributionType;
  description: string;
  paymentMethod: string;
}

interface EditForm {
  amount: string;
  type: ContributionType;
  description: string;
  paymentMethod: string;
  status: ContributionStatus;
}

const EMPTY_CREATE_FORM: ContribForm = {
  amount: "500",
  type: "weekly_group",
  description: "",
  paymentMethod: "",
};

// ─── Status Icon ──────────────────────────────────────────────────────────────

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "paid")
    return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === "pending") return <Clock className="w-4 h-4 text-warning" />;
  return <AlertCircle className="w-4 h-4 text-destructive" />;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Contributions() {
  const {
    contributionList,
    contributionsLoading,
    createContribution,
    markPaid,
    updateContribution,
    deleteContribution,
    isCreating,
    isMarkingPaid,
    isUpdating,
    isDeleting,
  } = useContributionsApi();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Contribution | null>(null);

  const [form, setForm] = useState<ContribForm>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<EditForm>({
    amount: "",
    type: "custom",
    description: "",
    paymentMethod: "",
    status: "paid",
  });

  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRangeChange = useCallback(
    (range: WeekRange) => setWeekRange(range),
    [],
  );

  // ── Filters ───────────────────────────────────────────────────────────────

  const weekFiltered = useMemo(() => {
    return contributionList.filter((e) => {
      if (weekRange) {
        const d = new Date(e.date);
        if (d < weekRange.start || d > weekRange.end) return false;
      }
      return true;
    });
  }, [contributionList, weekRange]);

  const byType = (type: ContributionType) =>
    weekFiltered
      .filter((e) => e.type === type)
      .filter(
        (e) =>
          (e.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
          e.payment_method.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ── Totals ────────────────────────────────────────────────────────────────

  const totalPaid = weekFiltered
    .filter((e) => e.status === "paid")
    .reduce((s, e) => s + e.amount, 0);
  const pendingCount = weekFiltered.filter(
    (e) => e.status === "pending" || e.status === "overdue",
  ).length;

  const kenyanNow = getKenyanNow();
  const currentMonth = kenyanNow.getMonth();
  const currentYear = kenyanNow.getFullYear();

  const monthlyTotal = useMemo(
    () =>
      contributionList
        .filter((e) => {
          const d = new Date(e.date);
          return (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear &&
            e.status === "paid"
          );
        })
        .reduce((s, e) => s + e.amount, 0),
    [contributionList, currentMonth, currentYear],
  );

  const yearlyTotal = useMemo(
    () =>
      contributionList
        .filter(
          (e) =>
            new Date(e.date).getFullYear() === currentYear &&
            e.status === "paid",
        )
        .reduce((s, e) => s + e.amount, 0),
    [contributionList, currentYear],
  );

  // ── Create handlers ───────────────────────────────────────────────────────

  const handleTypeChange = (t: ContributionType) => {
    const defaultAmt = TYPE_DEFAULTS[t];
    setForm((f) => ({
      ...f,
      type: t,
      amount: defaultAmt !== null ? String(defaultAmt) : f.amount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.paymentMethod) return;

    await createContribution({
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description || undefined,
      payment_method: form.paymentMethod,
      date: getNowEAT(),
    });

    setForm(EMPTY_CREATE_FORM);
    setCreateOpen(false);
  };

  // ── Edit / Update handlers ────────────────────────────────────────────────

  const openEdit = (entry: Contribution) => {
    setEditingEntry(entry);
    setEditForm({
      amount: String(entry.amount),
      type: entry.type,
      description: entry.description ?? "",
      paymentMethod: entry.payment_method,
      status: entry.status,
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editForm.amount || !editForm.paymentMethod) return;

    setUpdatingId(editingEntry.id);
    try {
      await updateContribution({
        id: editingEntry.id,
        amount: parseFloat(editForm.amount),
        type: editForm.type,
        description: editForm.description || undefined,
        payment_method: editForm.paymentMethod,
        status: editForm.status,
      });
      setEditOpen(false);
      setEditingEntry(null);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Mark paid / Delete ────────────────────────────────────────────────────

  const handleMarkPaid = async (id: string) => {
    setMarkingId(id);
    try {
      await markPaid({ id, date: getNowEAT() });
    } finally {
      setMarkingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteContribution(id);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Table renderer ────────────────────────────────────────────────────────

  const renderTable = (data: Contribution[]) => (
    <div className="overflow-x-auto">
      {contributionsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
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
                Status
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
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1.5">
                    <StatusIcon status={e.status} />
                    <span className="capitalize text-xs">{e.status}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">
                  {e.recorded_by}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-primary whitespace-nowrap">
                  KES {e.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {e.status !== "paid" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        disabled={isMarkingPaid}
                        onClick={() => handleMarkPaid(e.id)}
                      >
                        {markingId === e.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Mark Paid"
                        )}
                      </Button>
                    )}

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
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No contributions for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

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
            <Users className="w-8 h-8 text-primary" /> Contributions
          </h1>
          {/* Tiny tweak below so Git sees a real diff */}
          <p className="text-muted-foreground mt-2">
            Weekly Group (500), Cooperative Bank (1000), Caritas Bank (500) &
            Custom contributions
          </p>
        </div>

        {/* ── Create Dialog ── */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-profit border-0 text-white hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> Record Contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Contribution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => handleTypeChange(v as ContributionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly_group">
                      Weekly Group (500 KES)
                    </SelectItem>
                    <SelectItem value="cooperative_bank">
                      Cooperative Bank (1000 KES)
                    </SelectItem>
                    <SelectItem value="caritas_bank">
                      Caritas Bank (500 KES)
                    </SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (KES) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  required
                  min="1"
                  disabled={form.type !== "custom"}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, paymentMethod: v }))
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
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Time recorded automatically in Kenyan time (EAT +03:00)
              </p>
              <Button
                type="submit"
                className="w-full gradient-profit border-0 text-white"
                disabled={isCreating}
              >
                {isCreating && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Contribution
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contribution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={editForm.type}
                onValueChange={(v) => {
                  const t = v as ContributionType;
                  const defaultAmt = TYPE_DEFAULTS[t];
                  setEditForm((f) => ({
                    ...f,
                    type: t,
                    amount: defaultAmt !== null ? String(defaultAmt) : f.amount,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly_group">
                    Weekly Group (500 KES)
                  </SelectItem>
                  <SelectItem value="cooperative_bank">
                    Cooperative Bank (1000 KES)
                  </SelectItem>
                  <SelectItem value="caritas_bank">
                    Caritas Bank (500 KES)
                  </SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (KES) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
                min="1"
                disabled={editForm.type !== "custom"}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={editForm.paymentMethod}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, paymentMethod: v }))
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
              <Label>Status *</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) =>
                  setEditForm((f) => ({
                    ...f,
                    status: v as ContributionStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRIBUTION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2 capitalize">
                        <StatusIcon status={s} />
                        {s}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-profit border-0 text-white"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Contribution
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <WeekFilter onRangeChange={handleRangeChange} />

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        <div className="gradient-profit text-white px-6 py-3 rounded-xl">
          <p className="text-sm text-white/80">Week Total Paid</p>
          <p className="text-2xl font-bold">KES {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-warning/10 text-warning px-6 py-3 rounded-xl border border-warning/20">
          <p className="text-sm">Pending / Overdue</p>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>
        <div className="relative w-full sm:w-72 self-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contributions..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="weekly" className="w-full">
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <TabsList className="mb-4 w-max min-w-full sm:w-full flex">
              <TabsTrigger
                value="weekly"
                className="flex-1 whitespace-nowrap text-xs sm:text-sm"
              >
                <span className="sm:hidden">Weekly</span>
                <span className="hidden sm:inline">Weekly Group (500 KES)</span>
              </TabsTrigger>
              <TabsTrigger
                value="cooperative"
                className="flex-1 whitespace-nowrap text-xs sm:text-sm"
              >
                <span className="sm:hidden">Co-op Bank</span>
                <span className="hidden sm:inline">
                  Cooperative Bank (1000 KES)
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="caritas"
                className="flex-1 whitespace-nowrap text-xs sm:text-sm"
              >
                <span className="sm:hidden">Caritas</span>
                <span className="hidden sm:inline">Caritas Bank (500 KES)</span>
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="flex-1 whitespace-nowrap text-xs sm:text-sm"
              >
                Custom
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="weekly"
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            {renderTable(byType("weekly_group"))}
          </TabsContent>
          <TabsContent
            value="cooperative"
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            {renderTable(byType("cooperative_bank"))}
          </TabsContent>
          <TabsContent
            value="caritas"
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            {renderTable(byType("caritas_bank"))}
          </TabsContent>
          <TabsContent
            value="custom"
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            {renderTable(byType("custom"))}
          </TabsContent>
        </Tabs>
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
                Total Contributions — {MONTHS_LABELS[currentMonth]}{" "}
                {currentYear}
              </p>
              <p className="text-xl font-bold text-primary">
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
                Total Contributions — {currentYear}
              </p>
              <p className="text-xl font-bold text-primary">
                KES {Math.round(yearlyTotal).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Deployment sync marker — harmless comment that forces Git diff */}
      {/* ✅ All amounts locked: weekly=500 | cooperative=1000 | caritas=500 */}
    </div>
  );
}
