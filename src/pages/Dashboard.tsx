import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign, ShoppingCart, Tag, Users, TrendingUp, TrendingDown, Calendar, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useData } from "@/contexts/DataContext";
import KPICard from "@/components/KPICard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Period = "daily" | "weekly" | "monthly";

const CHART_COLORS = [
  "hsl(190, 90%, 42%)",
  "hsl(160, 70%, 40%)",
  "hsl(35, 92%, 55%)",
  "hsl(280, 65%, 55%)",
  "hsl(0, 72%, 55%)",
  "hsl(220, 60%, 55%)",
  "hsl(45, 80%, 50%)",
  "hsl(310, 60%, 50%)",
  "hsl(170, 50%, 45%)",
  "hsl(10, 70%, 50%)",
];

export default function Dashboard() {
  const { data } = useData();
  const [period, setPeriod] = useState<Period>("daily");
  const [productFilter, setProductFilter] = useState("all");

  const timeSeries = useMemo(() => {
    if (!data) return [];
    const source =
      period === "daily" ? data.dailyRevenue :
      period === "weekly" ? data.weeklyRevenue :
      data.monthlyRevenue;

    return source.map(p => ({
      ...p,
      label: period === "monthly"
        ? format(parseISO(p.date + "-01"), "MMM yyyy", { locale: es })
        : format(parseISO(p.date), "dd MMM", { locale: es }),
    }));
  }, [data, period]);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    if (productFilter === "all") return data.rows;
    return data.rows.filter(r => r.product === productFilter);
  }, [data, productFilter]);

  const filteredRevenue = useMemo(() => {
    return filteredRows.reduce((s, r) => s + r.total, 0);
  }, [filteredRows]);

  const products = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.rows.map(r => r.product))].sort();
  }, [data]);

  if (!data) return <Navigate to="/upload" replace />;


  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {data.rows.length.toLocaleString()} transacciones analizadas
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={v => setPeriod(v as Period)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Todos los productos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los productos</SelectItem>
                {products.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Ingresos Totales"
            value={`$${(productFilter === "all" ? data.kpis.totalRevenue : filteredRevenue).toLocaleString("es", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={DollarSign}
            trend={data.kpis.revenueChange}
            delay={0}
          />
          <KPICard
            title="Transacciones"
            value={(productFilter === "all" ? data.kpis.totalTransactions : filteredRows.length).toLocaleString()}
            icon={ShoppingCart}
            delay={0.05}
          />
          <KPICard
            title="Ticket Promedio"
            value={`$${data.kpis.averageTicket.toFixed(0)}`}
            icon={Tag}
            delay={0.1}
          />
          <KPICard
            title="Clientes"
            value={data.kpis.totalClients.toLocaleString()}
            icon={Users}
            delay={0.15}
          />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {/* Revenue trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-xl p-5"
          >
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tendencia de Ingresos
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(190, 90%, 42%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(190, 90%, 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 15%, 88%)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString("es")}`, "Ingresos"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(190, 90%, 42%)"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Peak / Low days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Días Destacados
            </h3>
            <div className="space-y-2 mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-accent" /> Pico
              </p>
              {data.peakDays.slice(0, 3).map(d => (
                <div key={d.date} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(parseISO(d.date), "dd MMM yyyy", { locale: es })}
                  </span>
                  <span className="font-semibold text-foreground">${d.value.toLocaleString("es")}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-destructive" /> Bajo
              </p>
              {data.lowDays.slice(0, 3).map(d => (
                <div key={d.date} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(parseISO(d.date), "dd MMM yyyy", { locale: es })}
                  </span>
                  <span className="font-semibold text-foreground">${d.value.toLocaleString("es")}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom row: Top products + Clients */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Top products chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Top Productos por Ingresos
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.topProducts.slice(0, 8)}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="product"
                  tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 15%, 88%)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString("es")}`, "Ingresos"]}
                />
                <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]}>
                  {data.topProducts.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Client table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Clientes Principales
            </h3>
            <div className="overflow-auto max-h-[280px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Cliente</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Transacciones</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clientBreakdown.slice(0, 10).map(c => (
                    <tr key={c.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2 text-foreground">{c.name}</td>
                      <td className="py-2 text-right text-muted-foreground">{c.count}</td>
                      <td className="py-2 text-right font-semibold text-foreground">
                        ${c.total.toLocaleString("es", { minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
