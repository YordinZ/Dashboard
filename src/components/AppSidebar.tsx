import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Upload, FileText, LayoutDashboard, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Inicio" },
  { to: "/upload", icon: Upload, label: "Cargar CSV" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/reports", icon: FileText, label: "Reportes" },
];

export default function AppSidebar() {
  const location = useLocation();
  const { data } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 gradient-surface border-r border-sidebar-border flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-sm font-bold text-sidebar-accent-foreground">FacturaIQ</h1>
          <p className="text-[10px] text-sidebar-foreground">Analítica Inteligente</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const isDisabled = (item.to === "/dashboard" || item.to === "/reports") && !data;
          {/*const isDisabled = (item.to === "/" || item.to === "/dashboard" || item.to === "/reports") && !data; */}

          const tooltip =
            item.to === "/dashboard" && !data
              ? "Primero carga un archivo CSV para habilitar el dashboard 📊"
              : item.label;

          return (
            <NavLink
              key={item.to}
              to={isDisabled ? "#" : item.to}
              onClick={(e) => isDisabled && e.preventDefault()}
              title={tooltip}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <div className="rounded-xl bg-sidebar-accent px-4 py-3">
          <p className="text-xs font-medium text-sidebar-foreground">
            {data
              ? `${data.rows.length.toLocaleString()} registros cargados`
              : "Sin datos cargados"}
          </p>
        </div>

        {/* 🔒 Logout */}
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-2 text-sm font-semibold
             bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))]
             text-white
             hover:shadow-md hover:shadow-primary/20
             active:scale-[0.98]
             transition-all duration-200"
        >
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
}
