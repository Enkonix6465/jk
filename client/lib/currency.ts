export const formatINR = (amount: number, withDecimals = false): string => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });
  return formatter.format(isNaN(amount) ? 0 : amount);
};

export const parseNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Party {
  name: string;
  address: string;
  gstin?: string;
  pan?: string;
}

export interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
}

export interface ProjectDetails {
  project: string;
  delivery: string;
  ratePerSite: number;
  totalSites: number;
}

export type InvoiceStatus = "Rejected" | "Completed" | "Pending" | "Approved";

export interface InvoiceData {
  companyName: string;
  serviceTitle: string;
  invoiceNumber: string;
  dateISO: string;
  status?: InvoiceStatus;
  issuedFrom: Party;
  issuedTo: Party;
  project: ProjectDetails;
  items: InvoiceItem[];
  advance: number; // adjustment
  gstPercent: number; // e.g., 18
  tdsPercent: number; // e.g., editable
  payment: PaymentInfo;
  terms: string;
}

export const calcTotals = (data: InvoiceData) => {
  const gross = data.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
  const netSubtotal = Math.max(gross - data.advance, 0);
  const gst = Math.round((netSubtotal * data.gstPercent) / 100);
  const tds = Math.round((netSubtotal * data.tdsPercent) / 100);
  const totalPayable = Math.max(netSubtotal + gst - tds, 0);
  return { gross, netSubtotal, gst, tds, totalPayable };
};
