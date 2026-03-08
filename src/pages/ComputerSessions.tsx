// src/pages/computer-sessions/ComputerSessions.tsx

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Plus,
  Clock,
  Trash2,
  Timer,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WeekFilter, type WeekRange } from "@/components/WeekFilter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatTime, MONTHS_LABELS } from "@/utils/utils";
import { useComputerSessionsApi } from "@/hooks/useComputerSessionsApi";
import { LoadingDataState } from "@/loaders/dataLoader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getKenyanNow = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utc + 3 * 3_600_000);
};

/**
 * Reconstruct a JS Date from a YYYY-MM-DD date_key + HH:MM EAT time string.
 * EAT = UTC+3, so we subtract 3h to get the correct UTC equivalent.
 */
const eatDateFromParts = (dateKey: string, hhmm: string): Date => {
  const [y, mo, d] = dateKey.split("-").map(Number);
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h - 3, m, 0));
};

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function CountdownTimer({ endTime }: { endTime: Date }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((endTime.getTime() - Date.now()) / 1000),
      );
      setRemaining(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isExpired = remaining <= 0;
  const isWarning = remaining > 0 && remaining <= 120;

  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-sm font-bold rounded-full px-3 py-1 ${
        isExpired
          ? "bg-destructive/15 text-destructive"
          : isWarning
            ? "bg-destructive/15 text-destructive animate-pulse"
            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      }`}
    >
      <Timer className="w-3.5 h-3.5" />
      {isExpired
        ? "DONE"
        : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ComputerSessions() {
  const {
    sessionList,
    isLoading,
    createSession,
    markDone,
    deleteSession,
    isCreating,
    isDeleting,
  } = useComputerSessionsApi();

  const [open, setOpen] = useState(false);
  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    computerNumber: "",
    amount: "",
  });

  const amountNum = Number(form.amount) || 0;
  const previewStart = getKenyanNow();
  const previewEnd = new Date(previewStart.getTime() + amountNum * 60_000);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const addSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.computerNumber || amountNum <= 0) return;
    await createSession({
      customer_name: form.customerName,
      computer_number: Number(form.computerNumber),
      amount: amountNum,
    });
    setForm({ customerName: "", computerNumber: "", amount: "" });
    setOpen(false);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSession(id);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Filtered ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!weekRange) return sessionList;
    return sessionList.filter((s) => {
      const d = new Date(s.date_key + "T00:00:00+03:00");
      return d >= weekRange.start && d <= weekRange.end;
    });
  }, [sessionList, weekRange]);

  const totalAmount = filtered.reduce((s, r) => s + r.amount, 0);
  const totalMinutes = filtered.reduce((s, r) => s + r.minutes, 0);

  // ── Monthly / Yearly totals ─────────────────────────────────────────────────

  const kenyanNow = getKenyanNow();
  const currentMonth = kenyanNow.getMonth();
  const currentYear = kenyanNow.getFullYear();

  const monthlyTotal = useMemo(
    () =>
      sessionList
        .filter((s) => {
          const [y, mo] = s.date_key.split("-").map(Number);
          return mo - 1 === currentMonth && y === currentYear;
        })
        .reduce((a, r) => a + r.amount, 0),
    [sessionList, currentMonth, currentYear],
  );

  const yearlyTotal = useMemo(
    () =>
      sessionList
        .filter((s) => Number(s.date_key.split("-")[0]) === currentYear)
        .reduce((a, r) => a + r.amount, 0),
    [sessionList, currentYear],
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Monitor className="w-8 h-8 text-primary" /> Computer Sessions
        </h1>
        <p className="text-muted-foreground mt-1">
          Track gaming/browsing sessions – 1 KES = 1 Minute
        </p>
      </motion.div>

      <WeekFilter onRangeChange={setWeekRange} />

      {/* Sessions card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Sessions ({filtered.length})
          </h2>

          {/* Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-profit border-0 text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Computer Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={addSession} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    placeholder="Name"
                    value={form.customerName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customerName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Computer Number *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={form.computerNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, computerNumber: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (KES) *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    required
                  />
                  {amountNum > 0 && (
                    <p className="text-xs text-muted-foreground">
                      = {amountNum} minutes
                    </p>
                  )}
                </div>

                {/* Preview */}
                {amountNum > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Time:</span>
                      <span className="font-medium text-foreground">
                        {formatTime(previewStart)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Time:</span>
                      <span className="font-medium text-foreground">
                        {formatTime(previewEnd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium text-foreground">
                        {amountNum} min
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCreating || amountNum <= 0}
                >
                  {isCreating && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Start Session
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingDataState
              title="sessions"
              text="preparing computer sessions"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>PC #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Minutes</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No sessions for this week
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => {
                    const startDate = eatDateFromParts(
                      s.date_key,
                      s.start_time,
                    );
                    const endDate = eatDateFromParts(s.date_key, s.end_time);
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {s.customer_name}
                        </TableCell>
                        <TableCell>{s.computer_number}</TableCell>
                        <TableCell className="text-primary font-semibold whitespace-nowrap">
                          KES {s.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{s.minutes} min</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatTime(startDate)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatTime(endDate)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.status === "active" ? "default" : "secondary"
                            }
                            className="capitalize"
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {s.status === "active" ? (
                            <CountdownTimer endTime={endDate} />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Done
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {formatDate(s.date_key)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {s.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => markDone(s.id)}
                              >
                                <Check className="w-3 h-3 mr-1" /> Done
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDeleting}
                              onClick={() => handleDelete(s.id)}
                            >
                              {deletingId === s.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Week totals footer */}
        {filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="bg-muted/50 rounded-lg px-4 py-2">
              <span className="text-muted-foreground">Week Total: </span>
              <span className="font-bold text-primary">
                KES {totalAmount.toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-2">
                ({totalMinutes} min)
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Monthly & Yearly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Monthly Total</h3>
          </div>
          <p className="text-2xl font-bold text-primary">
            KES {monthlyTotal.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {MONTHS_LABELS[currentMonth]} {currentYear} ({monthlyTotal} min)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Yearly Total</h3>
          </div>
          <p className="text-2xl font-bold text-primary">
            KES {yearlyTotal.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Year {currentYear} ({yearlyTotal} min)
          </p>
        </motion.div>
      </div>
    </div>
  );
}
