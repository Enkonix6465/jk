import React, { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import DownloadPDFButton from "@/components/invoice/DownloadPDFButton";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { InvoiceData } from "@/lib/currency";
import logoUrl from "@/components/asserts/logo.png";

export default function Index() {
  const initialData: InvoiceData = useMemo(
    () => ({
      companyName: "ENKONIX SOFTWARE SERVICES PVT LTD",
      serviceTitle: "SERVICE INVOICE",
      invoiceNumber: "WP/2025/011",
      dateISO: format(new Date(2025, 7, 6), "yyyy-MM-dd"),
      issuedFrom: {
        name: "ENKONIX SOFTWARE SERVICES PVT LTD",
        address: "1st Floor, MSR PARK, NOVEL OFFICE\nMARATHAHALLI, BENGALORE, KARNATAKA, 560036.",
        gstin: "29ABCDE1234F1Z5",
        pan: "ABCDE1234F",
      },
      issuedTo: {
        name: "PREYFOX TECHNOLOGY PRIVATE LIMITED",
        address:
          "125/4 MMR COMPLEX,\nCHINNATHIRUPATHI,RAMANATHAPURAM,SALEM,636008",
        gstin: "33AANCP5973H1ZZ",
        pan: "AANCP5973H",
      },
      project: {
        project: "WordPress Website Development (3 Slots)",
        delivery: "45 WordPress Websites",
        ratePerSite: 12000,
        totalSites: 45,
      },
      items: [
        {
          id: "1",
          description: "WordPress - Slot 1 (15 sites)",
          qty: 15,
          unitPrice: 12000,
        },
        {
          id: "2",
          description: "WordPress - Slot 2 (15 sites)",
          qty: 15,
          unitPrice: 12000,
        },
        {
          id: "3",
          description: "WordPress - Slot 3 (15 sites)",
          qty: 15,
          unitPrice: 12000,
        },
      ],
      advance: 150000,
      gstPercent: 18,
      tdsPercent: 11.8,
      payment: {
        bankName: "HDFC BANK Account",
        accountName: "ENKONIX SOFTWARE SERVICES PVT LTD",
        accountNumber: "50200099397088",
        ifsc: "HDFCINBB",
        branch: "JP Nagar",
      },
      terms:
        "Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice.",
    }),
    [],
  );

  const [data, setData] = useState<InvoiceData>(initialData);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const reset = () => setData(initialData);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-neon-blue to-neon-orange shadow-lg border-b border-neon-blue-glow neon-glow-blue">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center neon-glow-orange">
              <img
                src={logoUrl}
                alt="Company Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="font-bold tracking-tight text-white text-xl drop-shadow-lg neon-text-glow">
              Invoice Generator
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={reset}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white neon-glow-orange"
            >
              <FilePlus /> New Invoice
            </Button>
            <DownloadPDFButton targetRef={invoiceRef} fileName={`invoice-${data.invoiceNumber}.pdf`} />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <InvoiceForm data={data} onChange={setData} />
        <div className="bg-muted/40 rounded-lg border p-4 overflow-auto">
          <InvoicePreview ref={invoiceRef} data={data} />
        </div>
      </main>
    </div>
  );
}
