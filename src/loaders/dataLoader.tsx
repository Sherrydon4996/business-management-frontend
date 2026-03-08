import React from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CurrentDate } from "./../components/CurrentDate";

export function LoadingState({
  title = "Loading Tenants",
  text = "Please wait while we fetch your data...",
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 shadow-card">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{text}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function LoadingDataState({
  title = "Loading...",
  text = "Preparing your payment history",
}) {
  return (
    <div className="space-y-6 animate-fade-in min-h-[60vh] flex flex-col items-center justify-center">
      <CurrentDate />

      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary via-primary/70 to-primary/40 animate-pulse-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-background animate-bounce [animation-delay:0.3s]"></div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xl font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
