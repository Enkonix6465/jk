import React, { forwardRef } from "react";
import { format } from "date-fns";
import { calcTotals, formatINR, InvoiceData } from "@/lib/currency";

// ✅ Import all images instead of using hardcoded paths
import logoUrl from "@/components/asserts/logo.png";
import imgRejected from "@/components/asserts/image1.png";
import imgCompleted from "@/components/asserts/image2.png";
import imgPending from "@/components/asserts/image3.png";
import imgApproved from "@/components/asserts/image4.png";

interface Props {
  data: InvoiceData;
}

// This component renders the invoice document in an A4 portrait frame so it can be exported as PDF
const InvoicePreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const { gross, netSubtotal, gst, tds, totalPayable } = calcTotals(data);
  const dateStr = data.dateISO ? format(new Date(data.dateISO), "dd/MM/yyyy") : "";

  // ✅ Map status to imported images
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
        paddingTop: "96px", // Reserve space for top brand bar (no overlap)
        paddingBottom: "96px", // Reserve space for bottom brand bar (no overlap)
      }}
    >
      {/* Top brand bar with logo */}
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
            {/* ✅ Status image now loads correctly */}
            {data.status && (
              <div className="flex items-center gap-3">
                <img
                  src={statusImages[data.status] || ""}
                  alt={data.status}
                  style={{
                    width: 142,
                    height: 124,
                    opacity: 0.9,
                    pointerEvents: "none",
                    mixBlendMode: "normal",
                    display: "block",
                  }}
                />
              </div>
            )}
            <div className="text-sm text-muted-foreground" />
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

        {/* Issued From / To */}
        <div className="invoice-section space-y-6 mt-8">
          {/* Issued From */}
          <div>
            <div className="font-semibold uppercase tracking-wider text-xs text-neon-blue">
              ISSUED FROM:
            </div>
            <div className="mt-1 font-extrabold">{data.issuedFrom.name}</div>
            <div className="text-sm whitespace-pre-line leading-6">{data.issuedFrom.address}</div>
            {(data.issuedFrom.gstin || data.issuedFrom.pan) && (
              <div className="text-sm mt-1 space-y-1">
                {data.issuedFrom.gstin && (
                  <div>
                    <span className="font-semibold">GSTIN:</span> {data.issuedFrom.gstin}
                  </div>
                )}
                {data.issuedFrom.pan && (
                  <div>
                    <span className="font-semibold">PAN:</span> {data.issuedFrom.pan}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Issued To */}
          <div>
            <div className="font-semibold uppercase tracking-wider text-xs text-neon-blue">
              ISSUED TO:
            </div>
            <div className="mt-1 font-extrabold">{data.issuedTo.name}</div>
            <div className="text-sm whitespace-pre-line leading-6">{data.issuedTo.address}</div>
            {(data.issuedTo.gstin || data.issuedTo.pan) && (
              <div className="text-sm mt-1 space-y-1">
                {data.issuedTo.gstin && (
                  <div>
                    <span className="font-semibold">GSTIN:</span> {data.issuedTo.gstin}
                  </div>
                )}
                {data.issuedTo.pan && (
                  <div>
                    <span className="font-semibold">PAN:</span> {data.issuedTo.pan}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="invoice-section mt-8">
          <div className="font-semibold uppercase tracking-wider text-xs text-neon-blue">
            PROJECT DETAILS:
          </div>
          <div className="mt-2 text-sm leading-7">
            <div>
              <span className="font-semibold">Project:</span> {data.project.project}
            </div>
            <div>
              <span className="font-semibold">Delivery:</span> {data.project.delivery}
            </div>
            <div>
              <span className="font-semibold">Rate:</span> {formatINR(data.project.ratePerSite)} Per site
            </div>
            <div>
              <span className="font-semibold">Total Sites:</span> {data.project.totalSites}
            </div>
          </div>
        </div>

        {/* Billing Table */}
        <div className="invoice-section mt-6">
          <div className="font-semibold uppercase tracking-wider text-xs mb-2 text-neon-blue">
            BILLING DETAILS:
          </div>
          <table className="invoice-table w-full text-sm border-t border-b">
            <thead>
              <tr className="text-left bg-gradient-to-r from-neon-blue/10 to-neon-orange/10">
                <th className="py-3 w-12 text-neon-blue font-semibold">No</th>
                <th className="py-3 text-neon-blue font-semibold">Description</th>
                <th className="py-3 w-20 text-center text-neon-blue font-semibold">Qty</th>
                <th className="py-3 w-32 text-right text-neon-blue font-semibold">Unit Price</th>
                <th className="py-3 w-40 text-right text-neon-blue font-semibold">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, idx) => (
                <tr
                  key={it.id}
                  className="border-t hover:bg-gradient-to-r hover:from-neon-blue/5 hover:to-neon-orange/5"
                >
                  <td className="py-3">{idx + 1}</td>
                  <td className="py-3">{it.description}</td>
                  <td className="py-3 text-center">{it.qty}</td>
                  <td className="py-3 text-right">{formatINR(it.unitPrice)}</td>
                  <td className="py-3 text-right font-semibold">{formatINR(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div />
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <div>Gross Total:</div>
                <div className="font-semibold">{formatINR(gross)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Less: Adjustment for advance</div>
                <div className="font-semibold">{formatINR(data.advance)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-semibold">Net Subtotal</div>
                <div className="font-semibold">{formatINR(netSubtotal)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>GST @{data.gstPercent}%</div>
                <div className="font-semibold">{formatINR(gst)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>TDS</div>
                <div className="font-semibold">{formatINR(tds)}</div>
              </div>
            </div>
          </div>

          <div className="mt-3 bg-gradient-to-r from-neon-blue to-neon-orange text-white py-4 px-6 text-right font-bold tracking-wide text-lg">
            <span className="mr-3">TOTAL PAYABLE:</span>
            <span>{formatINR(totalPayable)}</span>
          </div>
        </div>

        {/* Payment and Terms */}
        <div className="invoice-section grid grid-cols-2 gap-8 mt-8">
          <div>
            <div className="uppercase tracking-wider text-xs font-semibold mb-2 text-neon-blue">
              PAYMENT METHOD:
            </div>
            <div className="h-1.5 w-28 bg-gradient-to-r from-neon-blue to-neon-orange mb-2" />
            <dl className="text-sm leading-7">
              <div className="grid grid-cols-[130px_1fr]">
                <dt>Bank Name</dt>
                <dd>: {data.payment.bankName}</dd>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <dt>Account Name</dt>
                <dd>: {data.payment.accountName}</dd>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <dt>Account Number</dt>
                <dd>: {data.payment.accountNumber}</dd>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <dt>IFSC Code</dt>
                <dd>: {data.payment.ifsc}</dd>
              </div>
              <div className="grid grid-cols-[130px_1fr]">
                <dt>Branch</dt>
                <dd>: {data.payment.branch}</dd>
              </div>
            </dl>
          </div>
          <div>
            <div className="uppercase tracking-wider text-xs font-semibold mb-2 text-neon-blue">
              TERM AND CONDITIONS:
            </div>
            <div className="h-1.5 w-28 bg-gradient-to-r from-neon-blue to-neon-orange mb-2" />
            <p className="text-sm leading-6 whitespace-pre-line">{data.terms}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-sm">
          <div className="font-medium">Thank you for business with us !</div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mt-3">
            <span>+ 91 9108191003</span>
          </div>
        </div>
      </div>

      {/* Bottom brand bar - fixed */}
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
