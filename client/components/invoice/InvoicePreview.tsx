import React, { forwardRef } from "react";
import { format } from "date-fns";
import { calcTotals, formatINR, InvoiceData } from "@/lib/currency";

// Import images so bundler resolves them correctly after deployment
import logoUrl from "@/components/asserts/logo.png";
import imgRejected from "@/components/asserts/image1.png";
import imgCompleted from "@/components/asserts/image2.png";
import imgPending from "@/components/asserts/image3.png";
import imgApproved from "@/components/asserts/image4.png";

interface Props {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { gross, netSubtotal, gst, tds, totalPayable } = calcTotals(data);
  const dateStr = data.dateISO ? format(new Date(data.dateISO), "dd/MM/yyyy") : "";

  // Map statuses to images
  const statusImages: Record<string, string> = {
    Rejected: imgRejected,
    Completed: imgCompleted,
    Pending: imgPending,
    Approved: imgApproved,
  };

  return (
    <div
      ref={ref}
      className="invoice-preview relative bg-white text-black w-[794px] shadow-xl mx-auto border border-border print:w-[794px]"
      style={{
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans",
        minHeight: "1123px", // A4 minimum height
        height: "auto", // Allow content to expand
        paddingTop: "96px", // Reserve space for top brand bar
        paddingBottom: "96px", // Reserve space for bottom brand bar
      }}
    >
      {/* Top brand bar */}
      <div className="top-brand-bar top-0 left-0 right-0 h-20 w-full flex items-center justify-between px-10 bg-gradient-to-r from-neon-blue to-neon-orange text-white absolute">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <img src={logoUrl} alt="Company Logo" className="h-10 w-10 object-contain" />
          </div>
          <div className="text-lg font-bold">ENKONIX SOFTWARE SERVICES PVT LTD</div>
        </div>
        <div className="text-lg font-bold">Service Invoice</div>
      </div>

      <div className="px-10">
        {/* Header */}
        <div className="flex items-end justify-between pt-6">
          <div className="space-y-2">
            {/* Status Image */}
            {data.status && (
              <div className="flex items-center gap-3">
                <img
                  src={statusImages[data.status] || ""}
                  alt={data.status}
                  style={{
                    width: 124,
                    height: 93,
                    opacity: 0.9,
                    pointerEvents: "none",
                    mixBlendMode: "normal",
                    display: "block",
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-right relative">
            <div className="text-2xl font-extrabold text-neon-blue tracking-wide">
              {data.serviceTitle}
            </div>
            <div className="mt-2 text-sm leading-6">
              <div>
                <span className="font-semibold">Invoice Number:</span> {data.invoiceNumber}
              </div>
              <div>
                <span className="font-semibold">DATE:</span> {dateStr}
              </div>
            </div>
          </div>
        </div>

        {/* Bill To / From Section */}
        <div className="grid grid-cols-2 gap-6 mt-10">
          <div>
            <div className="text-base font-semibold mb-2">Bill To:</div>
            <div className="text-sm leading-6 space-y-1">
              <div>{data.clientName}</div>
              <div>{data.clientAddress}</div>
              <div>{data.clientEmail}</div>
              <div>{data.clientPhone}</div>
            </div>
          </div>
          <div>
            <div className="text-base font-semibold mb-2">From:</div>
            <div className="text-sm leading-6 space-y-1">
              <div>ENKONIX SOFTWARE SERVICES PVT LTD</div>
              <div>1st Floor, MSR Tech Park, Novel Office</div>
              <div>Marathahalli, Bangalore, Karnataka, 560036</div>
              <div>info@enkonixsoft.com</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-10 border border-gray-300">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className="border-t border-gray-300">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-right">{formatINR(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatINR(netSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>{formatINR(gst)}</span>
            </div>
            <div className="flex justify-between">
              <span>TDS:</span>
              <span>{formatINR(tds)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Payable:</span>
              <span>{formatINR(totalPayable)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom brand bar */}
      <div className="bottom-brand-bar h-20 w-full flex items-center justify-between px-10 bg-gradient-to-r from-neon-orange to-neon-blue text-white absolute bottom-0 left-0 right-0">
        <div className="text-lg font-bold">
          1 st Floor, MSR Tech Park, Novel Office, Marathahalli, Bangalore, Karnataka, 560036.
        </div>
        <div className="text-lg font-bold">ENKONIX SOFTWARE SERVICES PVT LTD</div>
      </div>
    </div>
  );
});

InvoicePreview.displayName = "InvoicePreview";
export default InvoicePreview;
