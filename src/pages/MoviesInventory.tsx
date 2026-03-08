// src/pages/movies-inventory/MoviesInventory.tsx

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Film,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CalendarDays,
  Loader2,
} from "lucide-react";

import {
  useMoviesInventoryApi,
  type MediaItem,
} from "@/hooks/useMovieInventoryApi";
import { LoadingDataState } from "@/loaders/dataLoader";
import { formatKenyanDateTime } from "@/utils/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: 2050 - currentYear + 1 },
  (_, i) => currentYear + i,
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function MoviesInventory() {
  const {
    inventoryList,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
    isDeleting,
  } = useMoviesInventoryApi();

  // ── Create form ────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState<"movie" | "series">("movie");
  const [seasons, setSeasons] = useState("");

  // ── Inline edit state ──────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editSeasons, setEditSeasons] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Year filter ────────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const filteredItems = inventoryList.filter(
    (item) => new Date(item.date_added).getFullYear() === selectedYear,
  );

  const movies = filteredItems.filter((i) => i.type === "movie");
  const series = filteredItems.filter((i) => i.type === "series");

  // ── Create ─────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!title || !genre || !year) return;
    await createItem({
      title,
      genre,
      year,
      type,
      ...(type === "series" && seasons ? { seasons: parseInt(seasons) } : {}),
    });
    setTitle("");
    setGenre("");
    setYear("");
    setSeasons("");
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const startEdit = (item: MediaItem) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditGenre(item.genre);
    setEditYear(item.year);
    setEditSeasons(item.seasons != null ? String(item.seasons) : "");
  };

  const cancelEdit = () => setEditId(null);

  const saveEdit = async (item: MediaItem) => {
    setSavingId(item.id);
    try {
      await updateItem({
        id: item.id,
        title: editTitle,
        genre: editGenre,
        year: editYear,
        ...(item.type === "series"
          ? { seasons: editSeasons ? parseInt(editSeasons) : null }
          : {}),
      });
      setEditId(null);
    } finally {
      setSavingId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteItem(id);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Shared table renderer ──────────────────────────────────────────────────

  const renderTable = (list: MediaItem[], isSeries: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Genre</TableHead>
          <TableHead>Year</TableHead>
          {isSeries && <TableHead>Seasons</TableHead>}
          <TableHead>Date Added</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={isSeries ? 7 : 6} className="text-center py-10">
              <LoadingDataState
                title="movie Inventories"
                text="preparing movie inventories"
              />{" "}
            </TableCell>
          </TableRow>
        ) : (
          <>
            {list.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>

                {editId === item.id ? (
                  /* ── Inline edit row ── */
                  <>
                    <TableCell>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editGenre}
                        onChange={(e) => setEditGenre(e.target.value)}
                        className="h-8 w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="h-8 w-20"
                      />
                    </TableCell>
                    {isSeries && (
                      <TableCell>
                        <Input
                          type="number"
                          value={editSeasons}
                          onChange={(e) => setEditSeasons(e.target.value)}
                          className="h-8 w-16"
                          min="1"
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatKenyanDateTime(item.date_added)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isUpdating}
                          onClick={() => saveEdit(item)}
                        >
                          {savingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  /* ── Normal row ── */
                  <>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.genre}
                    </TableCell>
                    <TableCell>{item.year}</TableCell>
                    {isSeries && <TableCell>{item.seasons ?? "—"}</TableCell>}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatKenyanDateTime(item.date_added)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(item)}
                          disabled={isUpdating}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                        >
                          {deletingId === item.id ? (
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

            {list.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isSeries ? 7 : 6}
                  className="text-center text-muted-foreground py-8"
                >
                  No {isSeries ? "series" : "movies"} found for {selectedYear}
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Film className="w-7 h-7 text-primary" /> Movies &amp; Series
          Inventory
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your full collection of movies and series
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

      {/* Add New */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
            </div>
            <div>
              <Label>Genre *</Label>
              <Input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Action"
              />
            </div>
            <div>
              <Label>Year *</Label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                maxLength={4}
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "movie" | "series")}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
              </select>
            </div>
            {type === "series" && (
              <div>
                <Label>Seasons</Label>
                <Input
                  type="number"
                  value={seasons}
                  onChange={(e) => setSeasons(e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleAdd}
            className="mt-4"
            disabled={isCreating || !title || !genre || !year}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add {type === "movie" ? "Movie" : "Series"}
          </Button>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="movies">
            <TabsList className="mb-4">
              <TabsTrigger value="movies">Movies ({movies.length})</TabsTrigger>
              <TabsTrigger value="series">Series ({series.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="movies" className="overflow-x-auto">
              {renderTable(movies, false)}
            </TabsContent>
            <TabsContent value="series" className="overflow-x-auto">
              {renderTable(series, true)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
