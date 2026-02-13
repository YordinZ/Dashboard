import Papa from "papaparse";
import { format, parseISO, startOfWeek, startOfMonth, isValid } from "date-fns";
import { es } from "date-fns/locale";

export interface InvoiceRow {
  date: Date;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  client?: string;
}

export interface ProcessedData {
  rows: InvoiceRow[];
  kpis: KPIs;
  dailyRevenue: TimeSeriesPoint[];
  weeklyRevenue: TimeSeriesPoint[];
  monthlyRevenue: TimeSeriesPoint[];
  topProducts: ProductRanking[];
  bottomProducts: ProductRanking[];
  peakDays: TimeSeriesPoint[];
  lowDays: TimeSeriesPoint[];
  clientBreakdown: { name: string; total: number; count: number }[];
}

export interface KPIs {
  totalRevenue: number;
  totalTransactions: number;
  averageTicket: number;
  totalProducts: number;
  totalClients: number;
  revenueChange: number; // percentage
  peakDay: string;
  lowDay: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  count?: number;
}

export interface ProductRanking {
  product: string;
  totalSold: number;
  totalRevenue: number;
}

const DATE_FIELDS = ["fecha", "date", "dia", "day", "fecha_factura", "invoice_date", "fecha_venta", "sale_date"];
const PRODUCT_FIELDS = ["producto", "product", "item", "articulo", "descripcion", "description", "nombre_producto", "product_name"];
const QUANTITY_FIELDS = ["cantidad", "quantity", "qty", "unidades", "units", "cant"];
const PRICE_FIELDS = ["precio", "price", "precio_unitario", "unit_price", "valor_unitario", "precio_unit"];
const TOTAL_FIELDS = ["total", "monto", "amount", "subtotal", "importe", "valor", "value", "total_venta"];
const CLIENT_FIELDS = ["cliente", "client", "customer", "nombre_cliente", "client_name", "comprador", "buyer"];

function findField(headers: string[], candidates: string[]): string | null {
  const normalized = headers.map(h => h.toLowerCase().trim().replace(/\s+/g, "_"));
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate);
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseNumber(val: string | number): number {
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.\-,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function parseDate(val: string): Date | null {
  if (!val) return null;
  // Try ISO
  const iso = parseISO(val);
  if (isValid(iso)) return iso;
  // Try dd/mm/yyyy or dd-mm-yyyy
  const parts = val.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 100) {
      const d = new Date(c, b - 1, a);
      if (isValid(d)) return d;
    }
    if (a > 100) {
      const d = new Date(a, b - 1, c);
      if (isValid(d)) return d;
    }
  }
  const fallback = new Date(val);
  return isValid(fallback) ? fallback : null;
}

export function parseCSV(file: File): Promise<Papa.ParseResult<Record<string, string>>> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: resolve,
      error: reject,
    });
  });
}

export function detectColumns(headers: string[]) {
  return {
    dateField: findField(headers, DATE_FIELDS),
    productField: findField(headers, PRODUCT_FIELDS),
    quantityField: findField(headers, QUANTITY_FIELDS),
    priceField: findField(headers, PRICE_FIELDS),
    totalField: findField(headers, TOTAL_FIELDS),
    clientField: findField(headers, CLIENT_FIELDS),
  };
}

export function processData(
  rawRows: Record<string, string>[],
  mapping: {
    dateField: string;
    productField: string;
    quantityField: string;
    priceField?: string;
    totalField?: string;
    clientField?: string;
  }
): ProcessedData {
  const rows: InvoiceRow[] = [];

  for (const raw of rawRows) {
    const date = parseDate(raw[mapping.dateField]);
    if (!date) continue;

    const quantity = parseNumber(raw[mapping.quantityField]);
    const unitPrice = mapping.priceField ? parseNumber(raw[mapping.priceField]) : 0;
    let total = mapping.totalField ? parseNumber(raw[mapping.totalField]) : 0;
    if (!total && unitPrice && quantity) total = unitPrice * quantity;

    rows.push({
      date,
      product: raw[mapping.productField] || "Sin nombre",
      quantity,
      unitPrice,
      total,
      client: mapping.clientField ? raw[mapping.clientField] : undefined,
    });
  }

  rows.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Daily revenue
  const dailyMap = new Map<string, { value: number; count: number }>();
  for (const r of rows) {
    const key = format(r.date, "yyyy-MM-dd");
    const existing = dailyMap.get(key) || { value: 0, count: 0 };
    existing.value += r.total;
    existing.count += 1;
    dailyMap.set(key, existing);
  }
  const dailyRevenue: TimeSeriesPoint[] = Array.from(dailyMap.entries())
    .map(([date, d]) => ({ date, value: d.value, count: d.count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Weekly revenue
  const weeklyMap = new Map<string, number>();
  for (const r of rows) {
    const key = format(startOfWeek(r.date, { locale: es }), "yyyy-MM-dd");
    weeklyMap.set(key, (weeklyMap.get(key) || 0) + r.total);
  }
  const weeklyRevenue: TimeSeriesPoint[] = Array.from(weeklyMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Monthly revenue
  const monthlyMap = new Map<string, number>();
  for (const r of rows) {
    const key = format(startOfMonth(r.date), "yyyy-MM");
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + r.total);
  }
  const monthlyRevenue: TimeSeriesPoint[] = Array.from(monthlyMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Product rankings
  const productMap = new Map<string, { sold: number; revenue: number }>();
  for (const r of rows) {
    const existing = productMap.get(r.product) || { sold: 0, revenue: 0 };
    existing.sold += r.quantity;
    existing.revenue += r.total;
    productMap.set(r.product, existing);
  }
  const allProducts = Array.from(productMap.entries()).map(([product, d]) => ({
    product,
    totalSold: d.sold,
    totalRevenue: d.revenue,
  }));
  const topProducts = [...allProducts].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);
  const bottomProducts = [...allProducts].sort((a, b) => a.totalRevenue - b.totalRevenue).slice(0, 10);

  // Peak & low days
  const sortedDays = [...dailyRevenue].sort((a, b) => b.value - a.value);
  const peakDays = sortedDays.slice(0, 5);
  const lowDays = sortedDays.slice(-5).reverse();

  // Client breakdown
  const clientMap = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const name = r.client || "Sin cliente";
    const existing = clientMap.get(name) || { total: 0, count: 0 };
    existing.total += r.total;
    existing.count += 1;
    clientMap.set(name, existing);
  }
  const clientBreakdown = Array.from(clientMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total);

  // KPIs
  const totalRevenue = rows.reduce((s, r) => s + r.total, 0);
  const totalTransactions = rows.length;
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Revenue change (compare first half vs second half)
  const mid = Math.floor(dailyRevenue.length / 2);
  const firstHalf = dailyRevenue.slice(0, mid).reduce((s, d) => s + d.value, 0);
  const secondHalf = dailyRevenue.slice(mid).reduce((s, d) => s + d.value, 0);
  const revenueChange = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

  return {
    rows,
    kpis: {
      totalRevenue,
      totalTransactions,
      averageTicket,
      totalProducts: productMap.size,
      totalClients: clientMap.size,
      revenueChange,
      peakDay: peakDays[0]?.date || "N/A",
      lowDay: lowDays[0]?.date || "N/A",
    },
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    topProducts,
    bottomProducts,
    peakDays,
    lowDays,
    clientBreakdown,
  };
}
