import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getKenyanNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3 * 3600000);
};

const currentYear = getKenyanNow().getFullYear();
const years = Array.from(
  { length: 2050 - currentYear + 1 },
  (_, i) => currentYear + i,
);

export interface WeekRange {
  start: Date;
  end: Date;
  weekNumber: number;
  label: string;
}

export function getWeeksForMonth(year: number, month: number): WeekRange[] {
  const weeks: WeekRange[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0); // last day of month
  const totalDays = lastDay.getDate();

  // Split into 4 even-ish weeks, always anchored to the 1st
  const baseSize = Math.floor(totalDays / 4); // e.g. 7 for 28-day month
  const remainder = totalDays % 4; // extra days go to last week

  let dayOffset = 0;

  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const start = new Date(year, month, 1 + dayOffset);
    start.setHours(0, 0, 0, 0);

    // Last week absorbs remainder days
    const size = weekNum === 4 ? baseSize + remainder : baseSize;
    const end = new Date(year, month, 1 + dayOffset + size - 1);
    end.setHours(23, 59, 59, 999);

    const formatD = (d: Date) =>
      d.toLocaleDateString("en-KE", { month: "short", day: "numeric" });

    weeks.push({
      start,
      end,
      weekNumber: weekNum,
      label: `Week ${weekNum}: ${formatD(start)} – ${formatD(end)}`,
    });

    dayOffset += size;
  }

  return weeks;
}

/** Determine which week number the current Kenyan date falls in */
function getCurrentWeekNumber(year: number, month: number): number {
  const now = getKenyanNow();
  const weeks = getWeeksForMonth(year, month);
  for (const w of weeks) {
    if (now >= w.start && now <= w.end) return w.weekNumber;
  }
  return 1;
}

interface WeekFilterProps {
  onRangeChange: (range: WeekRange) => void;
}

export function WeekFilter({ onRangeChange }: WeekFilterProps) {
  const kenyanNow = getKenyanNow();
  const [selectedMonth, setSelectedMonth] = useState(kenyanNow.getMonth());
  const [selectedYear, setSelectedYear] = useState(kenyanNow.getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(
    getCurrentWeekNumber(kenyanNow.getFullYear(), kenyanNow.getMonth()),
  );

  const weeks = useMemo(
    () => getWeeksForMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  );

  const handleMonthChange = (v: string) => {
    const m = Number(v);
    setSelectedMonth(m);
    setSelectedWeek(1);
    const newWeeks = getWeeksForMonth(selectedYear, m);
    if (newWeeks.length > 0) onRangeChange(newWeeks[0]);
  };

  const handleYearChange = (v: string) => {
    const y = Number(v);
    setSelectedYear(y);
    setSelectedWeek(1);
    const newWeeks = getWeeksForMonth(y, selectedMonth);
    if (newWeeks.length > 0) onRangeChange(newWeeks[0]);
  };

  const handleWeekChange = (v: string) => {
    const w = Number(v);
    setSelectedWeek(w);
    const week = weeks.find((wk) => wk.weekNumber === w);
    if (week) onRangeChange(week);
  };

  // Fire initial range on mount
  useMemo(() => {
    const week = weeks.find((w) => w.weekNumber === selectedWeek);
    if (week) onRangeChange(week);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-card border border-border rounded-lg">
      <CalendarDays className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-muted-foreground">Filter:</span>
      <Select value={String(selectedMonth)} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={i} value={String(i)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(selectedYear)} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[100px] h-9">
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
      <Select value={String(selectedWeek)} onValueChange={handleWeekChange}>
        <SelectTrigger className="w-[220px] h-9">
          <SelectValue placeholder="Week" />
        </SelectTrigger>
        <SelectContent>
          {weeks.map((w) => (
            <SelectItem key={w.weekNumber} value={String(w.weekNumber)}>
              {w.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
