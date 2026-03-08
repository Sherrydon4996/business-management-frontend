// src/pages/Index.tsx  (or wherever your landing page lives)

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BarChart3, Shield, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";
import heroImage from "@/assets/hero-finance.jpg";
import { LandingPage } from "@/components/LandingPage";

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
        () => {
          setText(
            currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)),
          );
        },
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
//   Animated Section Wrapper
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
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Track income & expenses with beautiful charts and real-time insights.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Role-based access control keeps your financial data safe.",
  },
  {
    icon: Zap,
    title: "AI Assistant",
    desc: "Get personalized financial advice powered by artificial intelligence.",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    desc: "Monitor profit trends, savings goals, and weekly contributions.",
  },
];

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const typedText = useTypewriter([
    "Track Every KSh Effortlessly",
    "Grow Your Business Smarter",
    "Understand Your Cash Flow",
    "Make Better Financial Decisions",
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        {/* Background image – sharper, no heavy opacity wash */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Business finance background"
            className="w-full h-full object-cover brightness-95 contrast-[1.08]"
          />
          {/* Very light overlay to improve text readability */}
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
          <nav className="flex items-center justify-between mb-16">
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow-sm">
              BizFinance
            </h1>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsLoginOpen(true)}
                className="text-primary-foreground hover:text-primary-foreground/90"
              >
                Login
              </Button>
              <Button
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </div>
          </nav>

          <AnimatedSection>
            <span className="inline-block px-5 py-2 rounded-full bg-white/15 text-sm font-medium mb-6 backdrop-blur-none border border-white/20">
              🇰🇪 Built for Kenyan Small Businesses
            </span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
              Manage Your Business Finances
              <br />
              <span className="text-accent inline-block min-w-[18ch] border-r-4 border-accent/80 pr-1 animate-blink">
                {typedText}
              </span>
            </h2>

            <p className="text-lg md:text-xl mb-10 max-w-xl text-white/95 font-light drop-shadow">
              Track income from Movie Sales, Cyber Services & PS Gaming. Monitor
              expenses, savings, and get AI-powered financial advice — all in
              one place.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-lg hover:shadow-xl text-base"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </AnimatedSection>

          {/* Stats – clean, no blur */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-16">
            {[
              { label: "Total Income", value: "KES 53,500" },
              { label: "Total Expenses", value: "KES 32,500" },
              { label: "Net Profit", value: "KES 19,000" },
              { label: "Savings", value: "KES 8,000" },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={0.1 + i * 0.1}>
                <div className="bg-white/10 rounded-xl p-5 text-center border border-white/15">
                  <p className="text-sm text-white/70">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20">
        <AnimatedSection className="text-center mb-14">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A complete financial management solution designed for small
            businesses in Kenya.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition-all duration-300 h-full border border-border/50"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BizFinance. Built for Kenyan small
          businesses.
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
