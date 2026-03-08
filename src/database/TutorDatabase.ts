// # Database Schema Notes for Turso (SQLite)

// This document outlines the database tables needed for the Rent Collection & Property Management System.

// ## Overview

// Total Tables: **8 main tables** + optional supporting tables

// ---

// ## 1. `buildings` Table

// Stores information about rental properties/buildings.

// ```sql
// CREATE TABLE buildings (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   code TEXT UNIQUE NOT NULL,           -- e.g., "LH", "BH", "GV", "SP"
//   name TEXT NOT NULL,                   -- e.g., "Light House", "Blue Heart"
//   address TEXT NOT NULL,
//   city TEXT NOT NULL,
//   total_units INTEGER NOT NULL DEFAULT 0,
//   occupied_units INTEGER NOT NULL DEFAULT 0,
//   manager_id TEXT,                      -- FK to users table (optional)
//   amenities TEXT,                       -- JSON array as string
//   year_built INTEGER,
//   property_type TEXT NOT NULL DEFAULT 'residential', -- 'residential', 'commercial', 'mixed'
//   status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'under-maintenance'
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now'))
// );
// ```

// ---

// ## 2. `house_units` Table

// Individual rental units within buildings.

// ```sql
// CREATE TABLE house_units (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
//   building_code TEXT NOT NULL,
//   house_number TEXT NOT NULL,           -- e.g., "A1", "B2", "101"
//   house_size TEXT NOT NULL,             -- 'bedsitter', 'one-bedroom', 'two-bedroom', 'three-bedroom'
//   rent_amount REAL NOT NULL,
//   deposit_amount REAL NOT NULL,
//   floor INTEGER,
//   is_occupied INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
//   current_tenant_id TEXT,               -- FK to tenants table
//   amenities TEXT,                       -- JSON array as string
//   notes TEXT,
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now')),
//   UNIQUE(building_id, house_number)
// );
// ```

// ---

// ## 3. `tenants` Table

// Tenant information and lease details.

// ```sql
// CREATE TABLE tenants (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   name TEXT NOT NULL,
//   email TEXT,
//   phone TEXT NOT NULL,
//   house_number TEXT NOT NULL,
//   house_size TEXT NOT NULL,             -- 'bedsitter', 'one-bedroom', 'two-bedroom', 'three-bedroom'
//   rent_amount REAL NOT NULL,
//   deposit_paid REAL NOT NULL DEFAULT 0,
//   lease_start TEXT NOT NULL,            -- ISO date string
//   lease_end TEXT NOT NULL,              -- ISO date string
//   status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'pending'
//   building_code TEXT NOT NULL,
//   building_id TEXT REFERENCES buildings(id),
//   house_unit_id TEXT REFERENCES house_units(id),
//   emergency_contact TEXT,
//   notes TEXT,
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now'))
// );
// ```

// ---

// ## 4. `payments` Table

// Rent payment records.

// ```sql
// CREATE TABLE payments (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
//   tenant_name TEXT NOT NULL,            -- Denormalized for quick access
//   amount REAL NOT NULL,
//   date TEXT NOT NULL,                   -- ISO date string
//   method TEXT NOT NULL,                 -- 'mpesa', 'bank', 'cash', 'cheque'
//   status TEXT NOT NULL DEFAULT 'pending', -- 'completed', 'pending', 'failed'
//   reference TEXT NOT NULL,              -- Transaction reference
//   house_number TEXT NOT NULL,
//   building_code TEXT NOT NULL,
//   month TEXT NOT NULL,                  -- e.g., "January", "February"
//   year INTEGER NOT NULL,
//   is_partial INTEGER DEFAULT 0,         -- 0 = false, 1 = true
//   notes TEXT,
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now'))
// );

// -- Index for common queries
// CREATE INDEX idx_payments_tenant ON payments(tenant_id);
// CREATE INDEX idx_payments_building ON payments(building_code);
// CREATE INDEX idx_payments_date ON payments(year, month);
// ```

// ---

// ## 5. `maintenance_requests` Table

// Maintenance and repair requests.

// ```sql
// CREATE TABLE maintenance_requests (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
//   tenant_name TEXT NOT NULL,
//   house_number TEXT NOT NULL,
//   building_code TEXT NOT NULL,
//   category TEXT NOT NULL,               -- 'plumbing', 'electrical', 'structural', 'appliance', 'pest', 'other'
//   priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
//   status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in-progress', 'completed', 'cancelled'
//   title TEXT NOT NULL,
//   description TEXT NOT NULL,
//   date_submitted TEXT NOT NULL,
//   date_resolved TEXT,
//   assigned_to TEXT,
//   estimated_cost REAL,
//   actual_cost REAL,
//   notes TEXT,
//   images TEXT,                          -- JSON array of image URLs
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now'))
// );

// -- Index for common queries
// CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
// CREATE INDEX idx_maintenance_building ON maintenance_requests(building_code);
// ```

// ---

// ## 6. `expenses` Table

// Property-related expenses.

// ```sql
// CREATE TABLE expenses (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   building_code TEXT NOT NULL,
//   building_id TEXT REFERENCES buildings(id),
//   category TEXT NOT NULL,               -- 'utilities', 'maintenance', 'repairs', 'insurance', 'taxes', 'management', 'supplies', 'legal', 'marketing', 'other'
//   description TEXT NOT NULL,
//   amount REAL NOT NULL,
//   date TEXT NOT NULL,
//   vendor TEXT,
//   receipt_url TEXT,
//   house_number TEXT,                    -- If expense is unit-specific
//   is_recurring INTEGER DEFAULT 0,       -- 0 = false, 1 = true
//   recurring_frequency TEXT,             -- 'monthly', 'quarterly', 'yearly'
//   notes TEXT,
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now'))
// );

// -- Index for common queries
// CREATE INDEX idx_expenses_building ON expenses(building_code);
// CREATE INDEX idx_expenses_category ON expenses(category);
// CREATE INDEX idx_expenses_date ON expenses(date);
// ```

// ---

// ## 7. `users` Table (Optional - for authentication)

// Application users (landlords, managers, admins).

// ```sql
// CREATE TABLE users (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   email TEXT UNIQUE NOT NULL,
//   name TEXT NOT NULL,
//   phone TEXT,
//   avatar_url TEXT,
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now'))
// );
// ```

// ---

// ## 8. `user_roles` Table (Optional - for authorization)

// Role-based access control.

// ```sql
// CREATE TABLE user_roles (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   role TEXT NOT NULL,                   -- 'admin', 'landlord', 'manager', 'viewer'
//   building_code TEXT,                   -- NULL = all buildings, or specific building
//   created_at TEXT DEFAULT (datetime('now')),
//   UNIQUE(user_id, role, building_code)
// );
// ```

// ---

// ## Supporting Tables (Optional)

// ### `monthly_stats` Table

// Pre-calculated monthly statistics for dashboards.

// ```sql
// CREATE TABLE monthly_stats (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   building_code TEXT,                   -- NULL = all buildings
//   month TEXT NOT NULL,
//   year INTEGER NOT NULL,
//   total_collected REAL NOT NULL DEFAULT 0,
//   total_expected REAL NOT NULL DEFAULT 0,
//   total_expenses REAL NOT NULL DEFAULT 0,
//   net_income REAL NOT NULL DEFAULT 0,
//   occupancy_rate REAL NOT NULL DEFAULT 0,
//   payment_count INTEGER NOT NULL DEFAULT 0,
//   created_at TEXT DEFAULT (datetime('now')),
//   updated_at TEXT DEFAULT (datetime('now')),
//   UNIQUE(building_code, month, year)
// );
// ```

// ### `audit_log` Table

// Track changes for compliance.

// ```sql
// CREATE TABLE audit_log (
//   id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
//   user_id TEXT REFERENCES users(id),
//   action TEXT NOT NULL,                 -- 'create', 'update', 'delete'
//   table_name TEXT NOT NULL,
//   record_id TEXT NOT NULL,
//   old_values TEXT,                      -- JSON
//   new_values TEXT,                      -- JSON
//   ip_address TEXT,
//   created_at TEXT DEFAULT (datetime('now'))
// );
// ```

// ---

// ## Relationships Summary

// ```
// buildings (1) ──────── (many) house_units
// buildings (1) ──────── (many) tenants
// buildings (1) ──────── (many) expenses
// house_units (1) ────── (1) tenants (current)
// tenants (1) ─────────── (many) payments
// tenants (1) ─────────── (many) maintenance_requests
// users (1) ────────────── (many) user_roles
// ```

// ---

// ## House Sizes & Prices Reference

// | House Size     | Price Range (KES) |
// |----------------|-------------------|
// | Bedsitter      | 8,000 - 12,000    |
// | One-Bedroom    | 12,000 - 18,000   |
// | Two-Bedroom    | 18,000 - 25,000   |
// | Three-Bedroom  | 25,000 - 35,000   |

// ---

// ## Notes for Implementation

// 1. **UUIDs**: Turso/SQLite doesn't have native UUID, so we use `hex(randomblob(16))` for ID generation.

// 2. **Booleans**: SQLite uses INTEGER (0/1) for boolean values.

// 3. **Dates**: Store as ISO 8601 strings (TEXT) for compatibility.

// 4. **JSON Arrays**: Store as TEXT and parse in application code.

// 5. **Garbage Fee**: Fixed at KES 500 per month (handled in application logic, not stored per-record).

// 6. **Indexes**: Create indexes on frequently queried columns (building_code, tenant_id, date, status).

// 7. **Soft Deletes**: Consider adding `deleted_at` column instead of hard deletes for audit trail.
