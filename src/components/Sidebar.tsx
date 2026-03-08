import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthentication";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Users,
  Clapperboard,
  Monitor,
  Gamepad2,
  Film,
  CalendarDays,
  Calculator,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/expenses", label: "Expenses", icon: TrendingDown },
  { to: "/contributions", label: "Contributions", icon: Users },
  { to: "/bookings", label: "Bookings", icon: Clapperboard },
  { to: "/cyber-services", label: "Cyber Services", icon: Monitor },
  { to: "/ps-games", label: "PS Games", icon: Gamepad2 },
  { to: "/movies-inventory", label: "Movies & Series", icon: Film },
  { to: "/daily-earnings", label: "Daily Earnings", icon: CalendarDays },
  { to: "/weekly-summary", label: "Weekly Summary", icon: Calculator },
  { to: "/computer-sessions", label: "Computer Sessions", icon: Monitor },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/ai-assistant", label: "AI Assistant", icon: Bot },
];

const adminItems = [{ to: "/settings", label: "Settings", icon: Settings }];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Only show Settings link to admins
  const allItems =
    user?.role === "admin" ? [...navItems, ...adminItems] : navItems;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-profit flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg">FinTrack</h1>
            <p className="text-xs text-muted-foreground">Business Finance</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {allItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            className={linkClass(item.to)}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </RouterNavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2 mb-3">
          <div className="w-8 h-8 rounded-full gradient-profit flex items-center justify-center text-white text-xs font-bold">
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.fullName || user?.username}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className={`w-5 h-5 ${isLoggingOut ? "animate-spin" : ""}`} />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-card shadow-md flex items-center justify-center border border-border"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-card border-r border-border h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 w-64 h-full bg-card z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
