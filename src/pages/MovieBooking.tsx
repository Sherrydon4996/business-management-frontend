// src/pages/movie-bookings/MovieBooking.tsx

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clapperboard, Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { WeekFilter, type WeekRange } from "@/components/WeekFilter";
import {
  useMovieBookingsApi,
  type MovieBooking,
  type BookingType,
  type BookingStatus,
} from "@/hooks/useMovieBookingsApi";
import { LoadingDataState } from "@/loaders/dataLoader";
import { formatKenyanDateTime } from "@/utils/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES: BookingStatus[] = [
  "active",
  "pending",
  "delivered",
  "cancelled",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Today's date as YYYY-MM-DD in Kenyan time */
const getKenyanToday = (): string => {
  const now = new Date();
  const eatMs =
    now.getTime() + now.getTimezoneOffset() * 60_000 + 3 * 3_600_000;
  const eat = new Date(eatMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${eat.getFullYear()}-${pad(eat.getMonth() + 1)}-${pad(eat.getDate())}`;
};

const statusVariant = (s: BookingStatus) => {
  if (s === "active") return "default";
  if (s === "pending") return "secondary";
  if (s === "delivered") return "outline";
  return "destructive"; // cancelled / overdue
};

const statusColor = (s: BookingStatus) => {
  if (s === "active")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
  if (s === "pending") return "bg-blue-500/10 text-blue-700 border-blue-500/30";
  if (s === "delivered")
    return "bg-purple-500/10 text-purple-700 border-purple-500/30";
  return "bg-red-500/10 text-red-700 border-red-500/30"; // cancelled / overdue
};

// ─── Form Types ───────────────────────────────────────────────────────────────

interface BookingForm {
  customerName: string;
  customerPhone: string;
  title: string;
  type: BookingType;
  pickDate: string;
  // returnDate: string;
  amount: string;
}

interface EditForm extends BookingForm {
  status: BookingStatus;
}

const today = getKenyanToday();

const EMPTY_FORM: BookingForm = {
  customerName: "",
  customerPhone: "",
  title: "",
  type: "movie",
  pickDate: today,
  // returnDate: today,
  amount: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MovieBooking() {
  const {
    bookingList,
    bookingsLoading,
    createBooking,
    updateStatus,
    updateBooking,
    deleteBooking,
    isCreating,
    isUpdatingStatus,
    isUpdating,
    isDeleting,
  } = useMovieBookingsApi();

  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MovieBooking | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    ...EMPTY_FORM,
    status: "active",
  });

  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);
  const [statusLoadId, setStatusLoadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRangeChange = useCallback(
    (range: WeekRange) => setWeekRange(range),
    [],
  );

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return bookingList
      .filter((b) => {
        if (!weekRange) return true;
        const d = new Date(b.booked_at);
        return d >= weekRange.start && d <= weekRange.end;
      })
      .sort(
        (a, b) =>
          new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime(),
      );
  }, [bookingList, weekRange]);

  // ── Create ────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (
      !form.customerName ||
      !form.title ||
      !form.pickDate ||
      // !form.returnDate ||
      !form.amount
    )
      return;

    await createBooking({
      customer_name: form.customerName,
      customer_phone: form.customerPhone || undefined,
      title: form.title,
      type: form.type,
      pick_date: form.pickDate,
      // return_date: form.returnDate,
      amount: parseFloat(form.amount),
    });

    setForm(EMPTY_FORM);
  };

  // ── Quick status change ───────────────────────────────────────────────────

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    setStatusLoadId(id);
    try {
      await updateStatus({ id, status });
    } finally {
      setStatusLoadId(null);
    }
  };

  // ── Edit / Update ─────────────────────────────────────────────────────────

  const openEdit = (b: MovieBooking) => {
    setEditingEntry(b);
    setEditForm({
      customerName: b.customer_name,
      customerPhone: b.customer_phone ?? "",
      title: b.title,
      type: b.type,
      pickDate: b.pick_date,
      // returnDate: b.return_date,
      amount: String(b.amount),
      status: b.status,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEntry) return;
    setUpdatingId(editingEntry.id);
    try {
      await updateBooking({
        id: editingEntry.id,
        customer_name: editForm.customerName,
        customer_phone: editForm.customerPhone || undefined,
        title: editForm.title,
        type: editForm.type,
        pick_date: editForm.pickDate,
        //return_date: editForm.returnDate,
        amount: parseFloat(editForm.amount),
        status: editForm.status,
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
      await deleteBooking(id);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clapperboard className="w-7 h-7 text-primary" /> Movie &amp; Series
          Bookings
        </h1>
        <p className="text-muted-foreground mt-1">
          Track customer movie and series rentals. Bookings past their pick-up
          date are automatically cancelled.
        </p>
      </div>

      <WeekFilter onRangeChange={handleRangeChange} />

      {/* New Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                placeholder="e.g. John Kamau"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.customerPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerPhone: e.target.value }))
                }
                placeholder="0712345678"
              />
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Movie or series name"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v: BookingType) =>
                  setForm((f) => ({ ...f, type: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="series">Series</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pick-up Date *</Label>
              <Input
                type="date"
                value={form.pickDate}
                min={today}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pickDate: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Date the customer will collect the movie. Defaults to today
                (immediate).
              </p>
            </div>
            {/* <div>
              <Label>Return Date *</Label>
              <Input
                type="date"
                value={form.returnDate}
                min={form.pickDate || today}
                onChange={(e) =>
                  setForm((f) => ({ ...f, returnDate: e.target.value }))
                }
              />
            </div> */}
            <div>
              <Label>Amount (KES) *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="100"
                min="1"
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4" disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Booking
          </Button>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Customer Name *</Label>
              <Input
                value={editForm.customerName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, customerName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.customerPhone}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, customerPhone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(v: BookingType) =>
                  setEditForm((f) => ({ ...f, type: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="series">Series</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pick-up Date *</Label>
              <Input
                type="date"
                value={editForm.pickDate}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, pickDate: e.target.value }))
                }
              />
            </div>
            {/* <div>
              <Label>Return Date *</Label>
              <Input
                type="date"
                value={editForm.returnDate}
                min={editForm.pickDate}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, returnDate: e.target.value }))
                }
              />
            </div> */}
            <div>
              <Label>Amount (KES) *</Label>
              <Input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, amount: e.target.value }))
                }
                min="1"
              />
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={editForm.status}
                onValueChange={(v: BookingStatus) =>
                  setEditForm((f) => ({ ...f, status: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="capitalize">{s}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full mt-4"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Booking
          </Button>
        </DialogContent>
      </Dialog>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bookings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {bookingsLoading ? (
            <LoadingDataState
              title="M-Bookings"
              text="searching for movie bookings..."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Pick-up</TableHead>
                  {/* <TableHead>Return By</TableHead> */}
                  <TableHead>Booked At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {b.customer_name}
                    </TableCell>
                    <TableCell>{b.customer_phone ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {b.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {b.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      KES {b.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {b.pick_date}
                    </TableCell>
                    {/* <TableCell className="whitespace-nowrap">
                      {b.return_date}
                    </TableCell> */}
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatKenyanDateTime(b.booked_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${statusColor(b.status)}`}
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Quick status actions */}
                        {b.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleStatusChange(b.id, "delivered")
                            }
                          >
                            {statusLoadId === b.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Delivered"
                            )}
                          </Button>
                        )}
                        {b.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            disabled={isUpdatingStatus}
                            onClick={() => handleStatusChange(b.id, "active")}
                          >
                            {statusLoadId === b.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        )}
                        {(b.status === "active" || b.status === "pending") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-700 border-red-300 hover:bg-red-50"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleStatusChange(b.id, "cancelled")
                            }
                          >
                            {statusLoadId === b.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Cancel"
                            )}
                          </Button>
                        )}

                        {/* Edit */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-primary"
                          disabled={isUpdating}
                          onClick={() => openEdit(b)}
                        >
                          {updatingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Pencil className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Delete */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={isDeleting}
                          onClick={() => handleDelete(b.id)}
                        >
                          {deletingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-muted-foreground py-8"
                    >
                      No bookings for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
