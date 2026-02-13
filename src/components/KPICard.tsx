import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  delay?: number;
}

export default function KPICard({ title, value, subtitle, icon: Icon, trend, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-xl p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              trend >= 0 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
            )}
          >
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{title}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}
