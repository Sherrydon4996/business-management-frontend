import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, hsl(226 71% 18%) 0%, hsl(226 71% 28%) 50%, hsl(226 71% 22%) 100%)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-16 py-5">
        <span className="font-extrabold text-2xl text-white tracking-tight">
          FinTrack
        </span>
        <Button
          onClick={() => navigate("/login")}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 rounded-lg"
        >
          Login
        </Button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center px-6 md:px-16 py-12 md:py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/90 text-sm font-medium mb-8">
              <span className="font-bold text-xs tracking-wider">KE</span> Built
              for Kenyan Small Businesses
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Manage Your <br />
              <span className="text-destructive">Business Finances</span>
              <br />
              With Confidence
            </h1>

            <p className="mt-6 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
              Track income from Movie Sales, Cyber Services &amp; PS Gaming.
              Monitor expenses, savings, and get AI-powered financial advice —
              all in one place.
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="mt-8 bg-destructive hover:bg-destructive/90 text-white font-semibold text-base px-8 py-6 rounded-lg"
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-5 border-t border-white/10 text-center text-sm text-white/40">
        © {new Date().getFullYear()} FinTrack — Built for Kenyan entrepreneurs
      </footer>
    </div>
  );
}
