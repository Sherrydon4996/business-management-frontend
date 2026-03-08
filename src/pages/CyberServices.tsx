// src/pages/cyber-services/CyberServices.tsx

import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Monitor,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CalendarDays,
  Loader2,
} from "lucide-react";

import { useCyberServicesApi } from "@/hooks/useCyberServicesApi";
import { LoadingDataState } from "@/loaders/dataLoader";
import { formatKenyanDateTime } from "@/utils/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: 2050 - currentYear + 1 },
  (_, i) => currentYear + i,
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function CyberServices() {
  const {
    serviceList,
    isLoading,
    createService,
    updateService,
    deleteService,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCyberServicesApi();

  // ── Create form ───────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // ── Inline edit state ─────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Year filter ───────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const filteredServices = serviceList.filter(
    (s) => new Date(s.date_added).getFullYear() === selectedYear,
  );

  // ── Create ────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!name || !price) return;
    await createService({
      name,
      description: description || undefined,
      price: parseFloat(price),
    });
    setName("");
    setDescription("");
    setPrice("");
  };

  // ── Edit ──────────────────────────────────────────────────────────────────

  const startEdit = (s: (typeof serviceList)[0]) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditDesc(s.description ?? "");
    setEditPrice(String(s.price));
  };

  const cancelEdit = () => setEditId(null);

  const saveEdit = async (id: string) => {
    setSavingId(id);
    try {
      await updateService({
        id,
        name: editName,
        description: editDesc || undefined,
        price: parseFloat(editPrice),
      });
      setEditId(null);
    } finally {
      setSavingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteService(id);
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
          <Monitor className="w-7 h-7 text-primary" /> Cyber Services &amp;
          Prices
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your cyber cafe service offerings
        </p>
      </div>

      {/* Year Filter */}
      <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg w-fit">
        <CalendarDays className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Filter by Year:
        </span>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[120px] h-9">
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

      {/* Add New Service */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Service Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Printing (A3)"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Per page"
              />
            </div>
            <div>
              <Label>Price (KES) *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50"
                min="1"
              />
            </div>
          </div>
          <Button
            onClick={handleAdd}
            className="mt-4"
            disabled={isCreating || !name || !price}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Service
          </Button>
        </CardContent>
      </Card>

      {/* Service List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Service List ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <LoadingDataState title="Services" text="Fetching cyber services" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price (KES)</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((s, i) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-muted-foreground">
                      {i + 1}
                    </TableCell>

                    {editId === s.id ? (
                      /* ── Inline edit row ── */
                      <>
                        <TableCell>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="h-8"
                            placeholder="Optional"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-8 w-24"
                            min="1"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatKenyanDateTime(s.date_added)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isUpdating}
                              onClick={() => saveEdit(s.id)}
                            >
                              {savingId === s.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      /* ── Normal row ── */
                      <>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.description ?? "—"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          KES {s.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatKenyanDateTime(s.date_added)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(s)}
                              disabled={isUpdating}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(s.id)}
                              disabled={isDeleting}
                            >
                              {deletingId === s.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}

                {filteredServices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No services found for {selectedYear}
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
