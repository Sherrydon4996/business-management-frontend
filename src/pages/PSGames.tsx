// src/pages/ps-games/PSGames.tsx

import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Gamepad2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CalendarDays,
  Timer,
  Clock,
  Loader2,
} from "lucide-react";
import { formatKenyanDateTime } from "@/utils/utils";
import { WeekFilter, type WeekRange } from "@/components/WeekFilter";
import { MONTHS_LABELS } from "@/utils/utils";
import {
  usePsGamesApi,
  useSessionsApi,
  type Session,
  type PsGame,
} from "@/hooks/usePsGamesApi";
import { LoadingDataState } from "@/loaders/dataLoader";

// ─── Constants ────────────────────────────────────────────────────────────────

const currentYearVal = new Date().getFullYear();
const years = Array.from(
  { length: 2050 - currentYearVal + 1 },
  (_, i) => currentYearVal + i,
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getKenyanNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utc + 3 * 3_600_000);
};

const eatDateFromKeyAndTime = (dateKey: string, hhmm: string): Date => {
  const [y, mo, d] = dateKey.split("-").map(Number);
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h - 3, m, 0));
};

const formatTimeFromHHMM = (hhmm: string): string => {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
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

export default function PSGames() {
  // ── Hooks ──────────────────────────────────────────────────────────────────
  const {
    gameList,
    gamesLoading,
    createGame,
    updateGame,
    toggleAvailability,
    deleteGame,
    isCreatingGame,
    isUpdatingGame,
    isTogglingGame,
    isDeletingGame,
  } = usePsGamesApi();

  const {
    sessionList,
    sessionsLoading,
    createSession,
    markSessionDone,
    deleteSession,
    isCreatingSession,
    isDeletingSession,
  } = useSessionsApi();

  // ── Game library form ──────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("PS5");
  const [price, setPrice] = useState("");
  const [minsPerGame, setMinsPerGame] = useState("15");

  // ── Inline edit state ──────────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editMins, setEditMins] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Session dialog ─────────────────────────────────────────────────────────
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionGameId, setSessionGameId] = useState(""); // stores game id
  const [sessionCustomer, setSessionCustomer] = useState("");
  const [sessionNumGames, setSessionNumGames] = useState("1");
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );

  // ── Filters ────────────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState(currentYearVal);
  const [weekRange, setWeekRange] = useState<WeekRange | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredGames = gameList.filter(
    (g) => new Date(g.date_added).getFullYear() === selectedYear,
  );

  // Look up selected game by id to avoid name-collision issues
  const selectedGameObj = gameList.find((g) => g.id === sessionGameId);
  const numGames = Number(sessionNumGames) || 0;
  const sessionTotalMins = selectedGameObj
    ? selectedGameObj.minutes_per_game * numGames
    : 0;
  const sessionTotalAmount = selectedGameObj
    ? Math.round((selectedGameObj.price_per_hour / 60) * sessionTotalMins)
    : 0;

  const filteredSessions = useMemo(() => {
    return sessionList.filter((s) => {
      if (!weekRange) return true;
      const d = new Date(s.date_key + "T00:00:00+03:00");
      return d >= weekRange.start && d <= weekRange.end;
    });
  }, [sessionList, weekRange]);

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
        .reduce((a, s) => a + s.amount, 0),
    [sessionList, currentMonth, currentYear],
  );

  const yearlyTotal = useMemo(
    () =>
      sessionList
        .filter((s) => Number(s.date_key.split("-")[0]) === currentYear)
        .reduce((a, s) => a + s.amount, 0),
    [sessionList, currentYear],
  );

  // ── Game library handlers ──────────────────────────────────────────────────

  const handleAddGame = async () => {
    if (!name || !price) return;
    await createGame({
      name,
      platform: platform || "PS5",
      price_per_hour: parseFloat(price),
      minutes_per_game: parseInt(minsPerGame) || 15,
    });
    setName("");
    setPrice("");
    setMinsPerGame("15");
    setPlatform("PS5");
  };

  const startEdit = (g: PsGame) => {
    setEditId(g.id);
    setEditName(g.name);
    setEditPlatform(g.platform);
    setEditPrice(String(g.price_per_hour));
    setEditMins(String(g.minutes_per_game));
  };

  const saveEdit = async (id: string) => {
    setSavingId(id);
    try {
      await updateGame({
        id,
        name: editName,
        platform: editPlatform,
        price_per_hour: parseFloat(editPrice),
        minutes_per_game: parseInt(editMins) || 15,
      });
      setEditId(null);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await toggleAvailability(id);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteGame = async (id: string) => {
    setDeletingGameId(id);
    try {
      await deleteGame(id);
    } finally {
      setDeletingGameId(null);
    }
  };

  // ── Session handlers ───────────────────────────────────────────────────────

  const handleStartSession = async () => {
    if (!selectedGameObj || !sessionCustomer || numGames <= 0) return;
    await createSession({
      customer_name: sessionCustomer,
      game_name: selectedGameObj.name, // pass the actual name to the API
      num_games: numGames,
      amount: sessionTotalAmount,
      total_minutes: sessionTotalMins,
    });
    setSessionOpen(false);
    setSessionGameId("");
    setSessionCustomer("");
    setSessionNumGames("1");
  };

  const handleDeleteSession = async (id: string) => {
    setDeletingSessionId(id);
    try {
      await deleteSession(id);
    } finally {
      setDeletingSessionId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Gamepad2 className="w-7 h-7 text-primary" /> PS Games &amp; Pricing
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your PlayStation game library, pricing, and active sessions
        </p>
      </div>

      {/* ── Active Sessions ── */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              Active Sessions (
              {sessionList.filter((s) => s.status === "active").length})
            </CardTitle>

            <Dialog
              open={sessionOpen}
              onOpenChange={(o) => {
                setSessionOpen(o);
                if (!o) {
                  setSessionGameId("");
                  setSessionCustomer("");
                  setSessionNumGames("1");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gradient-profit border-0 text-white hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" /> Start Game
                </Button>
              </DialogTrigger>

              {/* ── Dialog: fixed width, scrollable on small screens ── */}
              <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="px-5 pt-5 pb-0">
                  <DialogTitle className="text-base font-semibold">
                    Start PS Game Session
                  </DialogTitle>
                </DialogHeader>

                <div className="px-5 py-4 space-y-4">
                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <Label className="text-sm">Customer Name *</Label>
                    <Input
                      placeholder="Enter customer name"
                      value={sessionCustomer}
                      onChange={(e) => setSessionCustomer(e.target.value)}
                    />
                  </div>

                  {/* Select Game — uses id as value, clean label as text */}
                  <div className="space-y-1.5">
                    <Label className="text-sm">Select Game *</Label>
                    <Select
                      value={sessionGameId}
                      onValueChange={setSessionGameId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a game" />
                      </SelectTrigger>
                      <SelectContent
                        className="w-full max-w-[calc(100vw-3rem)] sm:max-w-[380px]"
                        position="popper"
                        sideOffset={4}
                      >
                        {gameList
                          .filter((g) => g.available === 1)
                          .map((g) => (
                            <SelectItem
                              key={g.id}
                              value={g.id}
                              className="py-2"
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-medium text-sm truncate">
                                  {g.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {g.minutes_per_game} min/game · KES{" "}
                                  {g.price_per_hour}/hr
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        {gameList.filter((g) => g.available === 1).length ===
                          0 && (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            No available games
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of Games */}
                  <div className="space-y-1.5">
                    <Label className="text-sm">Number of Games *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={sessionNumGames}
                      onChange={(e) => setSessionNumGames(e.target.value)}
                      placeholder="e.g. 2"
                    />
                  </div>

                  {/* Session Preview */}
                  {selectedGameObj && numGames > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Session Summary
                      </p>
                      {[
                        ["Game", selectedGameObj.name],
                        ["Per game", `${selectedGameObj.minutes_per_game} min`],
                        ["Total time", `${sessionTotalMins} min`],
                        ["Total amount", `KES ${sessionTotalAmount}`],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <span
                            className={
                              label === "Total amount"
                                ? "font-bold text-primary"
                                : "font-medium text-foreground"
                            }
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-1 pb-1">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSessionOpen(false)}
                      disabled={isCreatingSession}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStartSession}
                      className="flex-1"
                      disabled={
                        isCreatingSession ||
                        !sessionGameId ||
                        !sessionCustomer ||
                        numGames <= 0
                      }
                    >
                      {isCreatingSession ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Start Session
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <WeekFilter onRangeChange={setWeekRange} />
          {sessionsLoading ? (
            <LoadingDataState title="PS-Games" text="fetching PS games..." />
          ) : (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Games</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No sessions for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((s) => {
                    const endDate = eatDateFromKeyAndTime(
                      s.date_key,
                      s.end_time,
                    );
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {s.customer_name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {s.game_name}
                        </TableCell>
                        <TableCell>{s.num_games}</TableCell>
                        <TableCell className="text-primary font-semibold whitespace-nowrap">
                          KES {s.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatTimeFromHHMM(s.start_time)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatTimeFromHHMM(s.end_time)}
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
                        <TableCell>
                          <div className="flex gap-1">
                            {s.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => markSessionDone(s.id)}
                              >
                                <Check className="w-3 h-3 mr-1" /> Done
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={isDeletingSession}
                              onClick={() => handleDeleteSession(s.id)}
                            >
                              {deletingSessionId === s.id ? (
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
        </CardContent>
      </Card>

      {/* Monthly & Yearly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                Monthly Earnings
              </h3>
            </div>
            <p className="text-2xl font-bold text-primary">
              KES {monthlyTotal.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {MONTHS_LABELS[currentMonth]} {currentYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Yearly Earnings</h3>
            </div>
            <p className="text-2xl font-bold text-primary">
              KES {yearlyTotal.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Year {currentYear}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Game Library Filter */}
      <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg w-fit">
        <CalendarDays className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Filter Library by Year:
        </span>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue />
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

      {/* Add Game Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label>Game Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. FIFA 25"
              />
            </div>
            <div>
              <Label>Platform</Label>
              <Input
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="PS5"
              />
            </div>
            <div>
              <Label>Price/Hour (KES) *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="100"
                min="1"
              />
            </div>
            <div>
              <Label>Min/Game *</Label>
              <Input
                type="number"
                value={minsPerGame}
                onChange={(e) => setMinsPerGame(e.target.value)}
                placeholder="15"
                min="1"
              />
            </div>
          </div>
          <Button
            onClick={handleAddGame}
            className="mt-4"
            disabled={isCreatingGame || !name || !price}
          >
            {isCreatingGame ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Game
          </Button>
        </CardContent>
      </Card>

      {/* Game Library Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Game Library ({filteredGames.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {gamesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Price/Hr</TableHead>
                  <TableHead>Min/Game</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGames.map((g, i) => (
                  <TableRow key={g.id}>
                    <TableCell className="text-muted-foreground">
                      {i + 1}
                    </TableCell>

                    {editId === g.id ? (
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
                            value={editPlatform}
                            onChange={(e) => setEditPlatform(e.target.value)}
                            className="h-8 w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-8 w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editMins}
                            onChange={(e) => setEditMins(e.target.value)}
                            className="h-8 w-20"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatKenyanDateTime(g.date_added)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={g.available ? "default" : "secondary"}
                          >
                            {g.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isUpdatingGame}
                              onClick={() => saveEdit(g.id)}
                            >
                              {savingId === g.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditId(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium whitespace-nowrap">
                          {g.name}
                        </TableCell>
                        <TableCell>{g.platform}</TableCell>
                        <TableCell className="font-semibold">
                          KES {g.price_per_hour.toLocaleString()}
                        </TableCell>
                        <TableCell>{g.minutes_per_game} min</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatKenyanDateTime(g.date_added)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={g.available ? "default" : "secondary"}
                            className="cursor-pointer select-none"
                            onClick={() => handleToggle(g.id)}
                          >
                            {togglingId === g.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : g.available ? (
                              "Available"
                            ) : (
                              "Unavailable"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(g)}
                              disabled={isUpdatingGame}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteGame(g.id)}
                              disabled={isDeletingGame}
                            >
                              {deletingGameId === g.id ? (
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
                {filteredGames.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      No games found for {selectedYear}
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
