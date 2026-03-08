"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("bg-background p-3", className)}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        months: "flex flex-col md:flex-row gap-4",
        month: "space-y-4",
        nav: "flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0",
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0",
        ),
        caption_label: "text-sm font-medium",
        table: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: cn("h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50",
        day_disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeftIcon className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRightIcon className={cn("h-4 w-4", className)} {...props} />
        ),
        CaptionDropdown: ({ ...props }) => (
          <div className="flex items-center gap-1">
            {props.children}
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

export { Calendar };
