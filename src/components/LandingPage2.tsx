// src/pages/Index.tsx

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";
import heroImage from "@/assets/hero-finance.jpg";

// ───────────────────────────────────────────────
//   Typewriter Hook
// ───────────────────────────────────────────────
function useTypewriter(
  phrases: string[],
  typingSpeed = 80,
  deletingSpeed = 50,
  pauseTime = 1800,
) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      timeout = setTimeout(
        () =>
          setText(
            currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)),
          ),
        isDeleting ? deletingSpeed : typingSpeed,
      );
    }
    return () => clearTimeout(timeout);
  }, [
    text,
    isDeleting,
    phraseIndex,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseTime,
  ]);

  return text;
}

// ───────────────────────────────────────────────
//   Animated Section
// ───────────────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ───────────────────────────────────────────────
//   Data
// ───────────────────────────────────────────────

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Real-time charts for income, expenses, and profit trends.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Role-based access keeps your financial data protected.",
  },
  {
    icon: Zap,
    title: "AI Assistant",
    desc: "Personalized advice powered by AI — always on call.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    desc: "Monitor savings goals, weekly contributions, and growth.",
  },
];

const stats = [
  {
    label: "Total Income",
    value: "KES 53,500",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    label: "Total Expenses",
    value: "KES 32,500",
    icon: DollarSign,
    color: "text-red-400",
  },
  {
    label: "Net Profit",
    value: "KES 19,000",
    icon: BarChart3,
    color: "text-blue-400",
  },
  {
    label: "Savings",
    value: "KES 8,000",
    icon: PiggyBank,
    color: "text-amber-400",
  },
];

// ───────────────────────────────────────────────
//   Main Component
// ───────────────────────────────────────────────

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const typedText = useTypewriter([
    "Track Every KSh Effortlessly",
    "Grow Your Business Smarter",
    "Know Your Cash Flow",
    "Make Better Decisions",
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[100svh] flex flex-col">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Business finance"
            className="w-full h-full object-cover object-center brightness-90"
          />
          {/* Gradient overlay — stronger at bottom so stats cards are readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/75" />
        </div>

        {/* ── Nav ── */}
        <nav className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow">
            BizFinance
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLoginOpen(true)}
              className="text-white/90 hover:text-white hover:bg-white/10 text-sm px-3"
            >
              Login
            </Button>
            <Button
              size="sm"
              onClick={() => setIsLoginOpen(true)}
              className="bg-white text-gray-900 hover:bg-white/90 font-semibold text-sm px-4 rounded-lg shadow"
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* ── Hero body ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-5 pt-6 pb-10 sm:px-8 sm:pt-10 sm:pb-16 max-w-2xl mx-auto w-full">
          <AnimatedSection>
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-medium text-white mb-5">
              🇰🇪 Built for Kenyan Small Businesses
            </span>

            {/* Headline */}
            <h2 className="text-[2rem] leading-[1.15] sm:text-5xl font-extrabold text-white mb-4 drop-shadow-md">
              Manage Your{" "}
              <span className="text-white/95">Business Finances</span>
            </h2>

            {/* Typewriter line — fixed height so it never reflows the layout */}
            <div className="h-9 sm:h-11 mb-5 flex items-center">
              <span className="text-lg sm:text-2xl font-semibold text-amber-300 border-r-2 border-amber-300/80 pr-1 animate-blink leading-none">
                {typedText || "\u00A0"}
              </span>
            </div>

            {/* Sub-copy */}
            <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-7 max-w-sm sm:max-w-md">
              Track income from PS Gaming, Cyber Services &amp; Movie Rentals.
              Monitor expenses, savings, and get AI-powered financial advice.
            </p>

            {/* CTA */}
            <Button
              onClick={() => setIsLoginOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-lg transition-all"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </AnimatedSection>
        </div>

        {/* ── Stats Cards ─────────────────────────────────────────── */}
        {/* Pinned to the bottom of the hero, never overlapping anything above */}
        <div className="relative z-10 px-4 pb-6 sm:px-8 sm:pb-10 max-w-2xl mx-auto w-full">
          <AnimatedSection delay={0.25}>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2 pl-1">
              Example figures
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <s.icon className={`w-3.5 h-3.5 shrink-0 ${s.color}`} />
                    <p className="text-[10px] text-white/60 leading-none truncate">
                      {s.label}
                    </p>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white tabular-nums leading-none">
                    {s.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <section className="px-5 py-14 sm:px-8 sm:py-20 max-w-4xl mx-auto w-full">
        <AnimatedSection className="text-center mb-10 sm:mb-14">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Everything You Need
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            A complete financial management solution designed for small
            businesses in Kenya.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-card rounded-xl p-5 border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 h-full"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-semibold mb-1.5 text-foreground">
                  {f.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────────────── */}
      <section className="px-5 pb-14 sm:px-8 sm:pb-20 max-w-4xl mx-auto w-full">
        <AnimatedSection>
          <div className="rounded-2xl bg-primary/8 border border-primary/15 p-7 sm:p-10 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Ready to take control?
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Join and start tracking your business finances in minutes.
            </p>
            <Button
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition-all"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </AnimatedSection>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-6 mt-auto">
        <p className="text-center text-xs text-muted-foreground px-5">
          © {new Date().getFullYear()} BizFinance — Built for Kenyan small
          businesses. <br />
          Developed by{" "}
          <a
            href="https://www.harrytechservices.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Harry Tech Services
          </a>
        </p>
      </footer>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
