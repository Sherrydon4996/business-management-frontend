import { ReactNode, useEffect, useState } from "react";
import { Outlet } from "react-router-dom"; // ← important!
import { AppSidebar } from "./Sidebar";
import { Clock } from "lucide-react";

const getKenyanNow = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3 * 3600000); // EAT = UTC+3
};

export default function Layout() {
  const [clockTime, setClockTime] = useState(getKenyanNow());

  useEffect(() => {
    const timer = setInterval(() => setClockTime(getKenyanNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {/* Kenyan Time Clock */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 shadow-sm">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Kenyan Time (EAT)
                </p>
                <p className="text-xl font-mono font-bold text-foreground tracking-tight">
                  {clockTime.toLocaleTimeString("en-KE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {clockTime.toLocaleDateString("en-KE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* ← This is where nested route content appears */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
