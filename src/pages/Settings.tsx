// src/pages/settingsQ/Settings.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Users,
  Plus,
  Shield,
  UserCog,
  Trash2,
  Loader2,
  BadgeCheck,
  Phone,
  Hash,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuthentication";
import { useSettingsApi } from "@/hooks/useSettingsApi";
import type { User } from "@/slices/authSlice";
import { LoadingDataState } from "@/loaders/dataLoader";

// ─── Add User Form ────────────────────────────────────────────────────────────

interface AddUserForm {
  username: string;
  mobile: string;
  role: User["role"];
  password: string;
}

const EMPTY_FORM: AddUserForm = {
  username: "",
  mobile: "",
  role: "user",
  password: "",
};

// ─── Profile Field ────────────────────────────────────────────────────────────

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground w-4 flex-shrink-0">{icon}</span>
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground truncate">
        {value ?? "—"}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Settings() {
  // AuthUser shape: { id, username, mobile, role, status }
  // Populated from /api/v1/auth/login and /api/v1/auth/refresh via setCredentials
  const { user } = useAuth();

  const {
    users,
    usersLoading,
    addUser,
    deleteUser,
    toggleUserStatus,
    isAddingUser,
    isTogglingStatus,
    isDeletingUser,
  } = useSettingsApi();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddUserForm>(EMPTY_FORM);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await addUser({
      username: form.username,
      mobile: form.mobile,
      role: form.role,
      password: form.password,
    });
    setForm(EMPTY_FORM);
    setOpen(false);
  };

  const handleToggleStatus = async (u: User) => {
    setTogglingId(u.id);
    try {
      await toggleUserStatus(u);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteUser(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users and app preferences
        </p>
      </motion.div>

      {/* ── My Profile ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-primary" /> My Profile
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar — first letter of username */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full gradient-profit flex items-center justify-center text-white text-2xl font-bold shadow select-none">
              {(user?.username ?? "U").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Profile fields — all from Redux state.auth.user (AuthUser) */}
          <div className="flex-1 w-full">
            <ProfileField
              icon={<Hash className="w-4 h-4" />}
              label="ID"
              value={user?.id}
            />
            <ProfileField
              icon={<AtSign className="w-4 h-4" />}
              label="Username"
              value={user?.username}
            />
            <ProfileField
              icon={<Phone className="w-4 h-4" />}
              label="Mobile"
              value={user?.mobile}
            />
            <ProfileField
              icon={<Shield className="w-4 h-4" />}
              label="Role"
              value={user?.role}
            />
            <ProfileField
              icon={
                <span
                  className={`inline-block w-2 h-2 rounded-full mt-0.5 ${
                    user?.status === "active" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              }
              label="Status"
              value={user?.status}
            />
          </div>
        </div>
      </motion.div>

      {/* ── User Management ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" /> User Management
          </h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-profit border-0 text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input
                    placeholder="username"
                    value={form.username}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, username: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile *</Label>
                  <Input
                    placeholder="+254 700 000 000"
                    value={form.mobile}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mobile: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, role: v as User["role"] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    placeholder="Set password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isAddingUser}
                >
                  {isAddingUser && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {usersLoading ? (
          <LoadingDataState title="settings" text="preparing settings..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Mobile
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Active
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {/* Username + avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-profit flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {u.username}
                        </span>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {u.mobile}
                    </td>

                    {/* Role badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <UserCog className="w-3 h-3" />
                        )}
                        {u.role}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    {/* Toggle active / suspended */}
                    <td className="py-3 px-4 text-right">
                      {togglingId === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin ml-auto text-muted-foreground" />
                      ) : (
                        <Switch
                          checked={u.status === "active"}
                          disabled={isTogglingStatus}
                          onCheckedChange={() => handleToggleStatus(u)}
                        />
                      )}
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={isDeletingUser}
                        onClick={() => handleDelete(u.id)}
                      >
                        {deletingId === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground text-sm"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── App Preferences ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">
          App Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">Currency</p>
              <p className="text-sm text-muted-foreground">
                Default currency for all transactions
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-muted text-sm font-medium text-foreground">
              KES
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">AI Assistant</p>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered financial insights
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-foreground">
                Auto-record Recurring Expenses
              </p>
              <p className="text-sm text-muted-foreground">
                Automatically record weekly group contribution
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
