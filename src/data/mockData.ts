export type HouseSize =
  | "single_room"
  | "bedsitter"
  | "1_bedroom"
  | "2_bedroom"
  | "3_bedroom";

export const GARBAGE_FEE = 150; // Fixed garbage fee per month

export interface Transaction {
  id: string;
  tenant_id: number;
  waterBill: number;
  TotalAmount: number;
  rent: number;
  water: number;
  garbage: number;
  penalty: number;
  deposit: number;
  method: string;
  reference: string;
  date: string;
  timestamp: string;
  month: string;
  year: number;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  method: "mpesa" | "equity" | "kcb" | "cooperative" | "family_bank";
  reference: string;
  type: "rent" | "penalty" | "deposit" | "water" | "garbage";
  month: string; // e.g., "2024-12"
  year: number;
}

export interface MonthlyStats {
  month: string;
  collected: number;
  expected: number;
  tenants: number;
}

export interface MaintenanceRequest {
  id: string;
  houseNumber: string;
  tenantName: string;
  issue: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  description?: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  property: string;
}

export const HOUSE_PRICES: Record<
  HouseSize,
  { min?: number; max?: number; label: string }
> = {
  single_room: { min: 3500, max: 3800, label: "Single" },
  bedsitter: { min: 5500, max: 6500, label: "Bedsitter" },
  "1_bedroom": { max: 9000, label: "1 B-room" },
  "2_bedroom": { max: 12000, label: "2 B-room" },
  "3_bedroom": { max: 18000, label: "3 B-room" },
};

export const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "John Kamau",
    mobile: "+254712345678",
    nextOfKinName: "Mary Kamau",
    nextOfKinMobile: "+254711111111",
    houseNumber: "A101",
    houseSize: "1_bedroom",
    area: "Westlands",
    monthlyRent: 8500,
    penalties: 0,
    lastPaymentDate: "2024-12-05",
    duePaymentDate: "2025-01-05",
    balanceDue: 0,
    status: "active",
    entryDate: "2023-06-15",
    leavingDate: null,
    waterBill: 450,
    garbageBill: 150,
    depositPaid: 17000,
    buildingCode: "001",
  },
  {
    id: "2",
    name: "Grace Wanjiku",
    mobile: "+254723456789",
    nextOfKinName: "Peter Wanjiku",
    nextOfKinMobile: "+254722222222",
    houseNumber: "B203",
    houseSize: "bedsitter",
    area: "Kilimani",
    monthlyRent: 6000,
    penalties: 300,
    lastPaymentDate: "2024-11-28",
    duePaymentDate: "2024-12-05",
    balanceDue: 3300,
    status: "active",
    entryDate: "2023-09-01",
    leavingDate: null,
    waterBill: 320,
    garbageBill: 150,
    depositPaid: 12000,
    buildingCode: "002",
  },
  {
    id: "3",
    name: "David Ochieng",
    mobile: "+254734567890",
    nextOfKinName: "Sarah Ochieng",
    nextOfKinMobile: "+254733333333",
    houseNumber: "C305",
    houseSize: "2_bedroom",
    area: "Lavington",
    monthlyRent: 14000,
    penalties: 2100,
    lastPaymentDate: "2024-11-15",
    duePaymentDate: "2024-12-05",
    balanceDue: 16100,
    status: "active",
    entryDate: "2022-03-10",
    leavingDate: null,
    waterBill: 680,
    garbageBill: 150,
    depositPaid: 28000,
    buildingCode: "003",
  },
  {
    id: "4",
    name: "Amina Hassan",
    mobile: "+254745678901",
    nextOfKinName: "Omar Hassan",
    nextOfKinMobile: "+254744444444",
    houseNumber: "A102",
    houseSize: "single_room",
    area: "Westlands",
    monthlyRent: 4000,
    penalties: 0,
    lastPaymentDate: "2024-12-10",
    duePaymentDate: "2025-01-05",
    balanceDue: 0,
    status: "active",
    entryDate: "2024-01-05",
    leavingDate: null,
    waterBill: 200,
    garbageBill: 150,
    depositPaid: 8000,
    buildingCode: "001",
  },
  {
    id: "5",
    name: "Samuel Mwangi",
    mobile: "+254756789012",
    nextOfKinName: "Jane Mwangi",
    nextOfKinMobile: "+254755555555",
    houseNumber: "D401",
    houseSize: "3_bedroom",
    area: "Karen",
    monthlyRent: 20000,
    penalties: 0,
    lastPaymentDate: "2024-12-01",
    duePaymentDate: "2025-01-05",
    balanceDue: 0,
    status: "active",
    entryDate: "2021-08-20",
    leavingDate: null,
    waterBill: 950,
    garbageBill: 150,
    depositPaid: 40000,
    buildingCode: "004",
  },
  {
    id: "6",
    name: "Faith Njeri",
    mobile: "+254767890123",
    nextOfKinName: "James Njeri",
    nextOfKinMobile: "+254766666666",
    houseNumber: "B204",
    houseSize: "1_bedroom",
    area: "Kilimani",
    monthlyRent: 9000,
    penalties: 450,
    lastPaymentDate: "2024-11-20",
    duePaymentDate: "2024-12-05",
    balanceDue: 4950,
    status: "active",
    entryDate: "2023-02-14",
    leavingDate: null,
    waterBill: 380,
    garbageBill: 150,
    depositPaid: 18000,
    buildingCode: "002",
  },
];

export const mockPayments: Payment[] = [
  {
    id: "1",
    tenantId: "1",
    amount: 8500,
    date: "2024-12-05",
    method: "mpesa",
    reference: "QWE123456",
    type: "rent",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "2",
    tenantId: "1",
    amount: 450,
    date: "2024-12-05",
    method: "mpesa",
    reference: "QWE123457",
    type: "water",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "3",
    tenantId: "1",
    amount: 150,
    date: "2024-12-05",
    method: "mpesa",
    reference: "QWE123458",
    type: "garbage",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "4",
    tenantId: "2",
    amount: 3000,
    date: "2024-11-28",
    method: "mpesa",
    reference: "ASD789012",
    type: "rent",
    month: "2024-11",
    year: 2024,
  },
  {
    id: "5",
    tenantId: "4",
    amount: 4000,
    date: "2024-12-10",
    method: "equity",
    reference: "EQ2024001",
    type: "rent",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "6",
    tenantId: "4",
    amount: 200,
    date: "2024-12-10",
    method: "equity",
    reference: "EQ2024002",
    type: "water",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "7",
    tenantId: "4",
    amount: 150,
    date: "2024-12-10",
    method: "equity",
    reference: "EQ2024003",
    type: "garbage",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "8",
    tenantId: "5",
    amount: 20000,
    date: "2024-12-01",
    method: "kcb",
    reference: "KCB2024001",
    type: "rent",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "9",
    tenantId: "5",
    amount: 950,
    date: "2024-12-01",
    method: "kcb",
    reference: "KCB2024002",
    type: "water",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "10",
    tenantId: "5",
    amount: 150,
    date: "2024-12-01",
    method: "kcb",
    reference: "KCB2024003",
    type: "garbage",
    month: "2024-12",
    year: 2024,
  },
  {
    id: "11",
    tenantId: "1",
    amount: 8500,
    date: "2024-11-05",
    method: "mpesa",
    reference: "QWE654321",
    type: "rent",
    month: "2024-11",
    year: 2024,
  },
  {
    id: "12",
    tenantId: "1",
    amount: 400,
    date: "2024-11-05",
    method: "mpesa",
    reference: "QWE654322",
    type: "water",
    month: "2024-11",
    year: 2024,
  },
  {
    id: "13",
    tenantId: "4",
    amount: 4000,
    date: "2024-11-10",
    method: "mpesa",
    reference: "ZXC111222",
    type: "rent",
    month: "2024-11",
    year: 2024,
  },
  {
    id: "14",
    tenantId: "5",
    amount: 20000,
    date: "2024-11-01",
    method: "kcb",
    reference: "KCB2024004",
    type: "rent",
    month: "2024-11",
    year: 2024,
  },
  {
    id: "15",
    tenantId: "1",
    amount: 17000,
    date: "2023-06-15",
    method: "mpesa",
    reference: "DEP001",
    type: "deposit",
    month: "2023-06",
    year: 2023,
  },
  {
    id: "16",
    tenantId: "2",
    amount: 12000,
    date: "2023-09-01",
    method: "equity",
    reference: "DEP002",
    type: "deposit",
    month: "2023-09",
    year: 2023,
  },
  {
    id: "17",
    tenantId: "3",
    amount: 28000,
    date: "2022-03-10",
    method: "kcb",
    reference: "DEP003",
    type: "deposit",
    month: "2022-03",
    year: 2022,
  },
  {
    id: "18",
    tenantId: "1",
    amount: 8500,
    date: "2024-10-05",
    method: "mpesa",
    reference: "QWE100501",
    type: "rent",
    month: "2024-10",
    year: 2024,
  },
  {
    id: "19",
    tenantId: "1",
    amount: 8500,
    date: "2024-09-05",
    method: "mpesa",
    reference: "QWE090501",
    type: "rent",
    month: "2024-09",
    year: 2024,
  },
  {
    id: "20",
    tenantId: "1",
    amount: 8500,
    date: "2024-08-05",
    method: "mpesa",
    reference: "QWE080501",
    type: "rent",
    month: "2024-08",
    year: 2024,
  },
];

export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: "1",
    houseNumber: "A101",
    tenantName: "John Kamau",
    issue: "Leaking faucet in kitchen",
    priority: "medium",
    status: "pending",
    createdAt: "2024-12-10",
    description: "Kitchen sink faucet is leaking and needs replacement.",
  },
  {
    id: "2",
    houseNumber: "B203",
    tenantName: "Grace Wanjiku",
    issue: "Broken window lock",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-12-08",
    description:
      "Window lock in bedroom is broken and needs urgent repair for security.",
  },
  {
    id: "3",
    houseNumber: "C305",
    tenantName: "David Ochieng",
    issue: "AC not cooling properly",
    priority: "medium",
    status: "completed",
    createdAt: "2024-12-05",
    description: "Air conditioning unit needs servicing.",
  },
];

export const mockExpenses: Expense[] = [
  {
    id: "1",
    category: "Repairs",
    description: "Plumbing fix - Unit A101",
    amount: 5000,
    date: "2024-12-10",
    property: "Westlands Apartments",
  },
  {
    id: "2",
    category: "Utilities",
    description: "Water bill - December",
    amount: 15000,
    date: "2024-12-08",
    property: "All Properties",
  },
  {
    id: "3",
    category: "Maintenance",
    description: "Garden service",
    amount: 8000,
    date: "2024-12-05",
    property: "Karen Estate",
  },
  {
    id: "4",
    category: "Insurance",
    description: "Property insurance renewal",
    amount: 45000,
    date: "2024-12-01",
    property: "All Properties",
  },
];

export const monthlyStats: MonthlyStats[] = [
  { month: "Jan", collected: 245000, expected: 280000, tenants: 45 },
  { month: "Feb", collected: 268000, expected: 280000, tenants: 46 },
  { month: "Mar", collected: 275000, expected: 285000, tenants: 47 },
  { month: "Apr", collected: 282000, expected: 290000, tenants: 48 },
  { month: "May", collected: 295000, expected: 295000, tenants: 49 },
  { month: "Jun", collected: 288000, expected: 300000, tenants: 50 },
  { month: "Jul", collected: 310000, expected: 310000, tenants: 52 },
  { month: "Aug", collected: 305000, expected: 315000, tenants: 53 },
  { month: "Sep", collected: 320000, expected: 320000, tenants: 54 },
  { month: "Oct", collected: 318000, expected: 325000, tenants: 54 },
  { month: "Nov", collected: 335000, expected: 340000, tenants: 56 },
  { month: "Dec", collected: 298000, expected: 345000, tenants: 56 },
];
