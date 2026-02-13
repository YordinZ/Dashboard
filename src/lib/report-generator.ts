import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ProcessedData } from "./csv-processor";

export function exportToCSV(data: ProcessedData, filename: string) {
  const headers = ["Fecha", "Producto", "Cantidad", "Precio Unitario", "Total", "Cliente"];
  const csvRows = [headers.join(",")];

  for (const row of data.rows) {
    csvRows.push([
      row.date.toISOString().split("T")[0],
      `"${row.product}"`,
      row.quantity,
      row.unitPrice.toFixed(2),
      row.total.toFixed(2),
      `"${row.client || ""}"`,
    ].join(","));
  }

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPDF(data: ProcessedData, filename: string) {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Reporte de Facturación", 14, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString("es")}`, 14, 30);

  // KPIs
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("KPIs Principales", 14, 44);

  autoTable(doc, {
    startY: 48,
    head: [["Métrica", "Valor"]],
    body: [
      ["Ingresos Totales", `$${data.kpis.totalRevenue.toLocaleString("es", { minimumFractionDigits: 2 })}`],
      ["Total Transacciones", data.kpis.totalTransactions.toString()],
      ["Ticket Promedio", `$${data.kpis.averageTicket.toFixed(2)}`],
      ["Productos Únicos", data.kpis.totalProducts.toString()],
      ["Variación de Ventas", `${data.kpis.revenueChange.toFixed(1)}%`],
      ["Día Pico", data.kpis.peakDay],
      ["Día Más Bajo", data.kpis.lowDay],
    ],
    theme: "striped",
    headStyles: { fillColor: [20, 160, 160] },
  });

  // Top products
  const y1 = (doc as any).lastAutoTable?.finalY || 100;
  doc.setFontSize(14);
  doc.text("Top 10 Productos", 14, y1 + 12);

  autoTable(doc, {
    startY: y1 + 16,
    head: [["Producto", "Unidades Vendidas", "Ingresos"]],
    body: data.topProducts.map(p => [
      p.product,
      p.totalSold.toString(),
      `$${p.totalRevenue.toLocaleString("es", { minimumFractionDigits: 2 })}`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [20, 160, 160] },
  });

  doc.save(`${filename}.pdf`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
