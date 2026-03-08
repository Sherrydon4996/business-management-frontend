import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuthentication";
import { useToast } from "@/hooks/use-toast";

// ─── Guest credentials (read-only, no admin privileges) ─────────────────────
const GUEST_USERNAME = "guest_viewer";
const GUEST_PASSWORD = "my_business@Guest2024";

// ─── Generate a random 6-char alphanumeric code ──────────────────────────────
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous I/O/1/0
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean; // pass true to show admin-only view (no guest option)
}

export function LoginModal({
  isOpen,
  onClose,
  isAdmin = false,
}: LoginModalProps) {
  // ── Core form state ────────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Modal animation state ──────────────────────────────────────────────────
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // ── Guest-access flow state ────────────────────────────────────────────────
  const [isGuestChecked, setIsGuestChecked] = useState(false);
  const [guestCode, setGuestCode] = useState<string>(() => generateCode());
  const [codeInput, setCodeInput] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [credentialsVisible, setCredentialsVisible] = useState(false);
  const [credentialCountdown, setCredentialCountdown] = useState(0);

  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const credCountdownRef = useRef<NodeJS.Timeout | null>(null);

  const { login } = useAuth();
  const { toast } = useToast();

  // ── Modal open/close animation ─────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsAnimating(true)),
      );
    } else {
      setIsAnimating(false);
      const t = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Reset guest state whenever modal opens/closes ─────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setIsGuestChecked(false);
      setCodeInput("");
      setCodeVerified(false);
      setCodeAttempts(0);
      setCooldownSeconds(0);
      setCredentialsVisible(false);
      setCredentialCountdown(0);
      setGuestCode(generateCode());
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (credCountdownRef.current) clearInterval(credCountdownRef.current);
    }
  }, [isOpen]);

  // ── Cooldown timer ─────────────────────────────────────────────────────────
  const startCooldown = useCallback(() => {
    setCooldownSeconds(60);
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!);
          setCodeAttempts(0);
          setGuestCode(generateCode());
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // ── Credential visibility countdown (15 s) ────────────────────────────────
  const startCredentialCountdown = useCallback(() => {
    setCredentialsVisible(true);
    setCredentialCountdown(15);
    credCountdownRef.current = setInterval(() => {
      setCredentialCountdown((s) => {
        if (s <= 1) {
          clearInterval(credCountdownRef.current!);
          setCredentialsVisible(false);
          setCodeVerified(false);
          setCodeInput("");
          setGuestCode(generateCode());
          setCodeAttempts(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // ── Verify the entered code ────────────────────────────────────────────────
  const handleVerifyCode = () => {
    if (cooldownSeconds > 0) return;
    if (codeInput.trim().toUpperCase() === guestCode) {
      setCodeVerified(true);
      setCodeAttempts(0);
      startCredentialCountdown();
    } else {
      const newAttempts = codeAttempts + 1;
      setCodeAttempts(newAttempts);
      setCodeInput("");
      if (newAttempts >= 3) {
        toast({
          title: "Too many attempts",
          description: "Please wait 60 seconds before trying again.",
          variant: "destructive",
        });
        startCooldown();
      } else {
        toast({
          title: "Incorrect code",
          description: `${3 - newAttempts} attempt${3 - newAttempts !== 1 ? "s" : ""} remaining.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleGuestToggle = () => {
    if (isGuestChecked) {
      setIsGuestChecked(false);
      setCodeInput("");
      setCodeVerified(false);
      setCodeAttempts(0);
      setCooldownSeconds(0);
      setCredentialsVisible(false);
      setCredentialCountdown(0);
      setGuestCode(generateCode());
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (credCountdownRef.current) clearInterval(credCountdownRef.current);
    } else {
      setIsGuestChecked(true);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        toast({
          variant: "success",
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        setUsername("");
        setPassword("");
        onClose();
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full
          max-w-[88%] sm:max-w-[400px] md:max-w-[380px]
          rounded-2xl bg-card
          px-5 py-5 sm:px-7 sm:py-6
          shadow-2xl border border-border
          transition-all duration-300
          ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        {/* Subtle gradient background – using theme colors */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-primary/5 opacity-60 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary/70 rounded-full" />

        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-md">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Welcome Back
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to BizFinance
          </p>
        </div>

        {/* ── Guest access section (hidden for admin) ── */}
        {!isAdmin && (
          <div className="mb-5">
            {/* Checkbox row */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div
                role="checkbox"
                aria-checked={isGuestChecked}
                onClick={handleGuestToggle}
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0
                  ${
                    isGuestChecked
                      ? "bg-primary border-primary"
                      : "border-border group-hover:border-primary/70"
                  }
                `}
              >
                {isGuestChecked && (
                  <svg
                    className="w-3.5 h-3.5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                I am a regular user (view-only access)
              </span>
            </label>

            {/* Expandable guest verification panel */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isGuestChecked
                  ? "max-h-80 opacity-100 mt-3"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                {!codeVerified ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        Enter this code to reveal guest credentials:
                      </p>
                      <button
                        onClick={() => {
                          if (cooldownSeconds === 0) {
                            setGuestCode(generateCode());
                            setCodeInput("");
                            setCodeAttempts(0);
                          }
                        }}
                        disabled={cooldownSeconds > 0}
                        className="text-muted-foreground hover:text-primary disabled:opacity-40 transition-colors"
                        title="Generate new code"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex justify-center gap-2 mb-4">
                      {guestCode.split("").map((char, i) => (
                        <div
                          key={i}
                          className="w-10 h-11 rounded-lg bg-card border border-border flex items-center justify-center font-mono font-bold text-lg text-primary shadow-sm"
                        >
                          {char}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={codeInput}
                        onChange={(e) =>
                          setCodeInput(e.target.value.toUpperCase().slice(0, 6))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyCode()
                        }
                        placeholder="Enter code above"
                        disabled={cooldownSeconds > 0}
                        className="h-10 text-base font-mono tracking-widest text-center uppercase"
                        maxLength={6}
                      />
                      <Button
                        onClick={handleVerifyCode}
                        disabled={codeInput.length < 6 || cooldownSeconds > 0}
                        size="sm"
                        className="px-4"
                      >
                        Verify
                      </Button>
                    </div>

                    {cooldownSeconds > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                        <Clock className="h-4 w-4" />
                        <span>
                          Too many attempts. Try again in {cooldownSeconds}s
                        </span>
                      </div>
                    )}
                    {codeAttempts > 0 && cooldownSeconds === 0 && (
                      <p className="mt-2 text-sm text-destructive">
                        {3 - codeAttempts} attempt
                        {3 - codeAttempts !== 1 ? "s" : ""} remaining
                      </p>
                    )}
                  </>
                ) : (
                  /* Credentials revealed */
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Code verified!
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-warning">
                        <Clock className="h-4 w-4" />
                        <span>Hides in {credentialCountdown}s</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          label: "Username",
                          value: GUEST_USERNAME,
                          icon: User,
                        },
                        {
                          label: "Password",
                          value: GUEST_PASSWORD,
                          icon: KeyRound,
                        },
                      ].map(({ label, value, icon: Icon }) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2 border border-border"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground w-20 flex-shrink-0">
                            {label}:
                          </span>
                          <span className="text-sm font-mono font-medium text-foreground truncate flex-1">
                            {value}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                            onClick={() => {
                              navigator.clipboard.writeText(value);
                              toast({
                                title: `${label} copied!`,
                                description: "Pasted into the field below.",
                                variant: "success",
                              });
                              if (label === "Username") setUsername(value);
                              else setPassword(value);
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{
                          width: `${(credentialCountdown / 15) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin badge */}
        {isAdmin && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-warning bg-warning/10 rounded-lg py-2 px-4 border border-warning/20">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-medium">Administrator login</span>
          </div>
        )}

        {/* ── Login form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isSubmitting}
                required
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                required
                className="pl-9 pr-10 h-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 text-base font-medium mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Secure login · BizFinance
        </p>
      </div>
    </div>
  );
}
