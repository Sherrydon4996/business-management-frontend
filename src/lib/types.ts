//income/types

export type IncomeCategory =
  | "PS Gaming"
  | "Cyber Services"
  | "Movie Rentals"
  | "other";
export type PaymentMethod = "Cash" | "M-Pesa" | "Card" | "Bank Transfer";

export interface Income {
  id: string;
  amount: number;
  category: IncomeCategory;
  description: string | null;
  payment_method: PaymentMethod | string;
  recorded_by: string;
  date: string; // ISO 8601 e.g. "2026-03-04T14:00:00+03:00"
  created_at?: string;
}

// Payload sent to POST /api/v1/income/create
export type CreateIncomePayload = Pick<
  Income,
  "amount" | "category" | "payment_method" | "date"
> & {
  description?: string;
};

// Payload sent to PUT /api/v1/income/update/:id
export type UpdateIncomePayload = Partial<
  Pick<
    Income,
    "amount" | "category" | "payment_method" | "description" | "date"
  >
>;
//EXPENCES TYPES

// src/pages/expenses/types.ts

export type ExpenseCategory =
  | "Stock Purchase"
  | "Electricity"
  | "Internet"
  | "Rent"
  | "Salary"
  | "Equipment"
  | "Maintenance"
  | "Other";

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory | string;
  description: string | null;
  payment_method: PaymentMethod | string;
  recorded_by: string; // username (joined from users table)
  date: string; // ISO 8601 e.g. "2026-03-04T14:00:00+03:00"
  created_at?: string;
}

// POST /api/v1/expenses/create
export type CreateExpensePayload = Pick<
  Expense,
  "amount" | "category" | "payment_method" | "date"
> & { description?: string };

// PUT /api/v1/expenses/update/:id
export type UpdateExpensePayload = Partial<
  Pick<
    Expense,
    "amount" | "category" | "payment_method" | "description" | "date"
  >
>;
