import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Download, FileSpreadsheet, Calendar, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { exportToPDF, exportToCSV } from "@/lib/report-generator";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function Reports() {
  const { data, fileName } = useData();

  if (!data) return <Navigate to="/upload" replace />;

  const baseName = fileName.replace(".csv", "");
  const dateRange = data.rows.length > 0
    ? `${format(data.rows[0].date, "dd/MM/yyyy")} — ${format(data.rows[data.rows.length - 1].date, "dd/MM/yyyy")}`
    : "N/A";

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Reportes</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Genera y descarga reportes automáticos a partir de los datos cargados.
        </p>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 mb-8"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Resumen del Análisis</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Período</p>
                <p className="font-semibold text-foreground">{dateRange}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Ingresos</p>
                <p className="font-semibold text-foreground">
                  ${data.kpis.totalRevenue.toLocaleString("es", { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Productos</p>
                <p className="font-semibold text-foreground">{data.kpis.totalProducts}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Registros</p>
                <p className="font-semibold text-foreground">{data.kpis.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top products table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-8"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Top 10 Productos</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">#</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Producto</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Unidades</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => (
                <tr key={p.product} className="border-b border-border/50">
                  <td className="py-2 text-muted-foreground">{i + 1}</td>
                  <td className="py-2 text-foreground">{p.product}</td>
                  <td className="py-2 text-right text-muted-foreground">{p.totalSold.toLocaleString()}</td>
                  <td className="py-2 text-right font-semibold text-foreground">
                    ${p.totalRevenue.toLocaleString("es", { minimumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Peak days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6 mb-8"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Días Pico de Facturación</h3>
          <div className="space-y-3">
            {data.peakDays.map((d, i) => (
              <div key={d.date} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">
                    {format(parseISO(d.date), "EEEE dd 'de' MMMM yyyy", { locale: es })}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">${d.value.toLocaleString("es")}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Descargar Reportes</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => exportToPDF(data, `reporte_${baseName}`)}
              className="gradient-primary text-primary-foreground flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToCSV(data, `datos_${baseName}`)}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar CSV
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
