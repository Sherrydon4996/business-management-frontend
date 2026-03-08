import type { Tenant, HouseSize } from "@/data/mockData";

import {
  Plus,
  Search,
  Filter,
  Phone,
  Edit2,
  Edit,
  Eye,
  Printer,
  AlertCircle,
  Calendar,
  CreditCard,
  Droplets,
  Trash2,
  Building2,
  DollarSign,
  AlertTriangle,
  Save,
  RefreshCw,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  TrendingUp,
  Download,
  Home,
  Users,
  Wifi,
  WifiOff,
  MapPin,
  ArrowLeft,
  User,
  Mail,
  Settings,
  Wrench,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Loader,
  Wallet,
  Calculator,
  Info,
} from "lucide-react";

export const icons = {
  plus: Plus,
  search: Search,
  filter: Filter,
  phone: Phone,
  edit2: Edit2,
  loader: Loader,
  eye: Eye,
  printer: Printer,
  alertCircle: AlertCircle,
  calendar: Calendar,
  creditcard: CreditCard,
  droplets: Droplets,
  trash2: Trash2,
  building2: Building2,
  dollarSign: DollarSign,
  alertTriangle: AlertTriangle,
  save: Save,
  refreshCw: RefreshCw,
  clock: Clock,
  checkCircle: CheckCircle,
  fileText: FileText,
  userPlus: UserPlus,
  trendingUp: TrendingUp,
  home: Home,
  Users,
  Edit,
  Wifi,
  WifiOff,
  MapPin,
  ArrowLeft,
  User,
  Mail,
  Settings,
  Wrench,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Wallet,
  Calculator,
  Info,
};

export const formatTime = (d: Date): string =>
  d.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const formatDate = (dateKey: string): string =>
  new Date(dateKey + "T00:00:00Z").toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export function formatMoney(amountKES: number, currency: "KES" | "USD") {
  if (currency === "USD") {
    const rate = 0.0075; // example rate
    const usd = amountKES * rate;
    return `$${usd.toFixed(2)}`;
  }

  return `KES ${amountKES?.toLocaleString()}`;
}

// Generate years from 2025 to 2040
export const generateYears = () => {
  const years = [];
  for (let year = 2025; year <= 2040; year++) {
    years.push(year);
  }
  return years;
};

export const MONTHS_LABELS = [
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

export const formatKenyanDateTime = (isoString: string) => {
  const d = new Date(isoString);
  return d.toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
