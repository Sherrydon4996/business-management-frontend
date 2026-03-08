import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    fullName: "Admin User",
    role: "admin" as UserRole,
  },
  {
    id: "2",
    username: "john",
    password: "user123",
    fullName: "John Doe",
    role: "user" as UserRole,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("fintrack_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (username: string, password: string) => {
    const found = MOCK_USERS.find(
      (u) => u.username === username && u.password === password,
    );
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem("fintrack_user", JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("fintrack_user");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
