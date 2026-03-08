// src/App.tsx
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "@/store/store";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuthentication";
import { AuthLoadingSpinner } from "./loaders/authSpinner";
import { SessionExpiryListener } from "./Apis/SessionExpiryListener";
import { useAppSelector } from "./store/hooks";
// Public pages
import LandingPage from "./components/LandingPage2"; // or your Index / Home landing
import Login from "./pages/Login";
// Protected pages (rendered inside Layout)
import Income from "./pages/Income";

import Contributions from "./pages/Contributions";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import MovieBooking from "./pages/MovieBooking";
import CyberServices from "./pages/CyberServices";
import PSGames from "./pages/PSGames";
import MoviesInventory from "./pages/MoviesInventory";
import DailyEarnings from "./pages/DailyEarnings";
import WeeklySummary from "./pages/WeeklySummary";

// Layout (contains Sidebar, Header, main content outlet, etc.)
import Layout from "./components/Layout";
import Expenses from "./pages/Expences";
import Dashboard from "./pages";
import { AuthProvider } from "./contexts/AuthContext";
import ComputerSessions from "./pages/ComputerSessions";

const queryClient = new QueryClient();

// Runs once on app mount – initializes auth & theme
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { bootstrapAuth } = useAuth();
  const theme = useAppSelector((state) => state.settingsQ.theme);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

// Shows spinner while checking auth status
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingSpinner message="Verifying your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Redirects logged-in users away from login/landing
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingSpinner message="Loading application..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes – no layout, no sidebar */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      {/* <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      /> */}

      {/* All protected routes – wrapped in Layout (sidebar + header + outlet) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/bookings" element={<MovieBooking />} />
        <Route path="/cyber-services" element={<CyberServices />} />
        <Route path="/ps-games" element={<PSGames />} />
        <Route path="/movies-inventory" element={<MoviesInventory />} />
        <Route path="/daily-earnings" element={<DailyEarnings />} />
        <Route path="/weekly-summary" element={<WeeklySummary />} />
        <Route path="/computer-sessions" element={<ComputerSessions />} />

        <Route path="/reports" element={<Reports />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/settings" element={<Settings />} />

        {/* Optional: redirect / to dashboard when already logged in */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {" "}
        {/* 👈 ADD THIS */}
        <BrowserRouter>
          <AuthInitializer>
            <SessionExpiryListener />
            <AppRoutes />
            <Toaster />
            <Sonner />
          </AuthInitializer>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
