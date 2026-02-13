import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, X } from "lucide-react";
import { parseCSV, detectColumns, processData } from "@/lib/csv-processor";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Step = "upload" | "mapping" | "processing" | "done";

export default function UploadPage() {
  const navigate = useNavigate();
  const { setData, setFileName } = useData();
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [mapping, setMapping] = useState({
    dateField: "",
    productField: "",
    quantityField: "",
    priceField: "",
    totalField: "",
    clientField: "",
  });

  const handleFile = useCallback(async (f: File) => {
    setError("");
    if (!f.name.endsWith(".csv")) {
      setError("Por favor sube un archivo CSV válido.");
      return;
    }

    setFile(f);
    try {
      const result = await parseCSV(f);
      if (!result.data.length) {
        setError("El archivo está vacío o no se pudo parsear.");
        return;
      }

      const hdrs = Object.keys(result.data[0]);
      setHeaders(hdrs);
      setRawRows(result.data);

      const detected = detectColumns(hdrs);
      setMapping({
        dateField: detected.dateField || "",
        productField: detected.productField || "",
        quantityField: detected.quantityField || "",
        priceField: detected.priceField || "",
        totalField: detected.totalField || "",
        clientField: detected.clientField || "",
      });

      setStep("mapping");
    } catch {
      setError("Error al leer el archivo CSV.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleProcess = () => {
    if (!mapping.dateField || !mapping.productField || !mapping.quantityField) {
      setError("Los campos Fecha, Producto y Cantidad son obligatorios.");
      return;
    }
    if (!mapping.totalField && !mapping.priceField) {
      setError("Necesitas mapear al menos Total o Precio Unitario.");
      return;
    }

    setStep("processing");
    setError("");

    setTimeout(() => {
      try {
        const processed = processData(rawRows, {
          dateField: mapping.dateField,
          productField: mapping.productField,
          quantityField: mapping.quantityField,
          priceField: mapping.priceField || undefined,
          totalField: mapping.totalField || undefined,
          clientField: mapping.clientField || undefined,
        });

        setData(processed);
        setFileName(file?.name || "data.csv");
        setStep("done");
      } catch {
        setError("Error al procesar los datos. Verifica el formato.");
        setStep("mapping");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Cargar Datos</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sube tu archivo CSV de facturación. El sistema detectará las columnas automáticamente.
              </p>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv";
                  input.onchange = e => {
                    const f = (e.target as HTMLInputElement).files?.[0];
                    if (f) handleFile(f);
                  };
                  input.click();
                }}
                className={`glass-card rounded-xl p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <UploadIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <p className="font-display font-semibold text-foreground mb-1">
                  Arrastra tu archivo CSV aquí
                </p>
                <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === "mapping" && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Mapeo de Columnas</h2>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    {file?.name} — {rawRows.length} filas detectadas
                  </p>
                </div>
                <button
                  onClick={() => { setStep("upload"); setError(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="glass-card rounded-xl p-6 space-y-4">
                {[
                  { key: "dateField", label: "Fecha *", required: true },
                  { key: "productField", label: "Producto *", required: true },
                  { key: "quantityField", label: "Cantidad *", required: true },
                  { key: "priceField", label: "Precio Unitario" },
                  { key: "totalField", label: "Total" },
                  { key: "clientField", label: "Cliente" },
                ].map(field => (
                  <div key={field.key} className="flex items-center gap-4">
                    <label className="w-36 text-sm font-medium text-foreground">{field.label}</label>
                    <Select
                      value={mapping[field.key as keyof typeof mapping]}
                      onValueChange={v =>
                        setMapping(prev => ({ ...prev, [field.key]: v }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar columna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Ninguno —</SelectItem>
                        {headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button onClick={handleProcess} className="w-full mt-6 gradient-primary text-primary-foreground">
                Procesar Datos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-12 h-12 rounded-full gradient-primary mx-auto mb-4 animate-pulse" />
              <p className="font-display font-semibold text-foreground">Procesando datos...</p>
              <p className="text-sm text-muted-foreground mt-1">Analizando patrones y calculando KPIs</p>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">¡Datos procesados!</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tu archivo ha sido analizado exitosamente. Ahora puedes explorar el dashboard.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                className="gradient-primary text-primary-foreground"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
