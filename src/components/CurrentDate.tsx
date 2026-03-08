import React from "react";
import { Calendar } from "lucide-react";

export function CurrentDate() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dayOfMonth = today.getDate();
  const isBeforeDue = dayOfMonth < 5;

  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border border-border shadow-card">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Today's Date</p>
          <p className="font-semibold text-foreground">{formattedDate}</p>
        </div>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          isBeforeDue
            ? "bg-success/20 text-success"
            : "bg-warning/20 text-warning"
        }`}
      >
        {isBeforeDue ? "Before Due Date (5th)" : "Past Due Date"}
      </div>
    </div>
  );
}
