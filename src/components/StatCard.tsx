import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "income" | "expense" | "profit" | "total";
  prefix?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  variant,
  prefix = "KES",
  delay = 0,
}: StatCardProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = 1000;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const gradientClass = {
    income: "gradient-income",
    expense: "gradient-expense",
    profit: "gradient-profit",
    total: "gradient-total",
  }[variant];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className={`${gradientClass} rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white/80">{title}</p>
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold">
        {prefix} {count.toLocaleString()}
      </p>
    </motion.div>
  );
}
