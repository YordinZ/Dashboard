import { motion } from "framer-motion";
import { ArrowRight, BarChart3, FileUp, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";

const features = [
  {
    icon: FileUp,
    title: "Carga de CSV",
    description: "Importa tus datos de facturación en segundos con detección automática de columnas.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description: "Visualiza KPIs, tendencias y rankings de productos en tiempo real.",
  },
  {
    icon: FileText,
    title: "Reportes Automáticos",
    description: "Genera y descarga reportes en PDF y CSV con un solo clic.",
  },
];

export default function Index() {
  const { data } = useData();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Analítica de Facturación Inteligente
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-4">
              Transforma tus datos en{" "}
              <span className="text-gradient">decisiones</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
              Carga tus archivos CSV de facturación y obtén análisis profundos, 
              visualizaciones interactivas y reportes automáticos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={data ? "/dashboard" : "/upload"}
                className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-display font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {data ? "Ver Dashboard" : "Cargar Datos"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
