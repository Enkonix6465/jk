import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ValidatedInput, ValidatedTextarea } from "@/components/ui/validated-input";
import { Plus, Trash2 } from "lucide-react";
import { InvoiceData, InvoiceItem } from "@/lib/currency";
import { validateField, validateNestedField, InvoiceValidationErrors } from "@/lib/validation";

interface Props {
  data: InvoiceData;
  onChange: (next: InvoiceData) => void;
}

export default function InvoiceForm({ data, onChange }: Props) {
  const [errors, setErrors] = useState<InvoiceValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Validate field on change
  const validateAndUpdate = (field: string, value: any, updateFn: () => void) => {
    updateFn();
    
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  };

  // Validate nested field on change
  const validateAndUpdateNested = (path: string, value: any, updateFn: () => void) => {
    updateFn();
    
    const error = validateNestedField(path, value);
    setErrors(prev => ({
      ...prev,
      [path]: error || undefined
    }));
  };

  // Mark field as touched
  const markTouched = (field: string) => {
    setTouched(prev => new Set(prev).add(field));
  };

  const update = (patch: Partial<InvoiceData>) => onChange({ ...data, ...patch });
  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    onChange({
      ...data,
      items: data.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  };
  const addItem = () => {
    const id = Math.random().toString(36).slice(2);
    onChange({
      ...data,
      items: [
        ...data.items,
        { id, description: "", qty: 1, unitPrice: 0 },
      ],
    });
  };
  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter((it) => it.id !== id) });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3">Header</h3>
        <div className="grid grid-cols-2 gap-3">
          <ValidatedInput
            label="Company Name"
            placeholder="Company Name"
            value={data.companyName}
            error={touched.has('companyName') ? errors.companyName : undefined}
            required
            onChange={(e) => {
              markTouched('companyName');
              validateAndUpdate('companyName', e.target.value, () => update({ companyName: e.target.value }));
            }}
          />
          <ValidatedInput
            label="Invoice Number"
            placeholder="Invoice Number"
            value={data.invoiceNumber}
            error={touched.has('invoiceNumber') ? errors.invoiceNumber : undefined}
            required
            onChange={(e) => {
              markTouched('invoiceNumber');
              validateAndUpdate('invoiceNumber', e.target.value, () => update({ invoiceNumber: e.target.value }));
            }}
          />
          <ValidatedInput
            label="Date"
            type="date"
            value={data.dateISO}
            error={touched.has('dateISO') ? errors.dateISO : undefined}
            required
            onChange={(e) => {
              markTouched('dateISO');
              validateAndUpdate('dateISO', e.target.value, () => update({ dateISO: e.target.value }));
            }}
          />
          <div>
            <label className="text-sm font-medium">
              Status
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                size="sm"
                variant={data.status === "Pending" ? "default" : "outline"}
                onClick={() => {
                  markTouched('status');
                  validateAndUpdate('status', "Pending", () => update({ status: "Pending" }));
                }}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={data.status === "Completed" ? "default" : "outline"}
                onClick={() => {
                  markTouched('status');
                  validateAndUpdate('status', "Completed", () => update({ status: "Completed" }));
                }}
              >
                Completed
              </Button>
              <Button
                size="sm"
                variant={data.status === "Approved" ? "default" : "outline"}
                onClick={() => {
                  markTouched('status');
                  validateAndUpdate('status', "Approved", () => update({ status: "Approved" }));
                }}
              >
                Approved
              </Button>
              <Button
                size="sm"
                variant={data.status === "Rejected" ? "default" : "outline"}
                onClick={() => {
                  markTouched('status');
                  validateAndUpdate('status', "Rejected", () => update({ status: "Rejected" }));
                }}
              >
                Rejected
              </Button>
            </div>
            {touched.has('status') && errors.status && (
              <p className="text-sm text-red-500 mt-1">{errors.status}</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3">Issued From / To</h3>
        <div className="space-y-6">
          {/* Issued From Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-neon-blue border-b border-neon-blue/20 pb-1">ISSUED FROM</h4>
            <div className="space-y-2">
              <ValidatedInput
                label="From: Name"
                placeholder="From: Name"
                value={data.issuedFrom.name}
                error={touched.has('issuedFrom.name') ? errors['issuedFrom.name'] : undefined}
                required
                onChange={(e) => {
                  markTouched('issuedFrom.name');
                  validateAndUpdateNested('issuedFrom.name', e.target.value, () => 
                    update({ issuedFrom: { ...data.issuedFrom, name: e.target.value } })
                  );
                }}
              />
              <ValidatedTextarea
                label="From: Address"
                placeholder="From: Address (multi-line separated by commas)"
                value={data.issuedFrom.address}
                error={touched.has('issuedFrom.address') ? errors['issuedFrom.address'] : undefined}
                required
                onChange={(e) => {
                  markTouched('issuedFrom.address');
                  validateAndUpdateNested('issuedFrom.address', e.target.value, () => 
                    update({ issuedFrom: { ...data.issuedFrom, address: e.target.value } })
                  );
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <ValidatedInput
                  label="From: GSTIN"
                  placeholder="GSTIN"
                  value={data.issuedFrom.gstin ?? ""}
                  error={touched.has('issuedFrom.gstin') ? errors['issuedFrom.gstin'] : undefined}
                  onChange={(e) => {
                    markTouched('issuedFrom.gstin');
                    validateAndUpdateNested('issuedFrom.gstin', e.target.value, () => 
                      update({ issuedFrom: { ...data.issuedFrom, gstin: e.target.value } })
                    );
                  }}
                />
                <ValidatedInput
                  label="From: PAN"
                  placeholder="PAN"
                  value={data.issuedFrom.pan ?? ""}
                  error={touched.has('issuedFrom.pan') ? errors['issuedFrom.pan'] : undefined}
                  onChange={(e) => {
                    markTouched('issuedFrom.pan');
                    validateAndUpdateNested('issuedFrom.pan', e.target.value, () => 
                      update({ issuedFrom: { ...data.issuedFrom, pan: e.target.value } })
                    );
                  }}
                />
              </div>
            </div>
          </div>

          {/* Issued To Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-neon-blue border-b border-neon-blue/20 pb-1">ISSUED TO</h4>
            <div className="space-y-2">
              <ValidatedInput
                label="To: Name"
                placeholder="To: Name"
                value={data.issuedTo.name}
                error={touched.has('issuedTo.name') ? errors['issuedTo.name'] : undefined}
                required
                onChange={(e) => {
                  markTouched('issuedTo.name');
                  validateAndUpdateNested('issuedTo.name', e.target.value, () => 
                    update({ issuedTo: { ...data.issuedTo, name: e.target.value } })
                  );
                }}
              />
              <ValidatedTextarea
                label="To: Address"
                placeholder="To: Address"
                value={data.issuedTo.address}
                error={touched.has('issuedTo.address') ? errors['issuedTo.address'] : undefined}
                required
                onChange={(e) => {
                  markTouched('issuedTo.address');
                  validateAndUpdateNested('issuedTo.address', e.target.value, () => 
                    update({ issuedTo: { ...data.issuedTo, address: e.target.value } })
                  );
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <ValidatedInput
                  label="To: GSTIN"
                  placeholder="GSTIN"
                  value={data.issuedTo.gstin ?? ""}
                  error={touched.has('issuedTo.gstin') ? errors['issuedTo.gstin'] : undefined}
                  onChange={(e) => {
                    markTouched('issuedTo.gstin');
                    validateAndUpdateNested('issuedTo.gstin', e.target.value, () => 
                      update({ issuedTo: { ...data.issuedTo, gstin: e.target.value } })
                    );
                  }}
                />
                <ValidatedInput
                  label="To: PAN"
                  placeholder="PAN"
                  value={data.issuedTo.pan ?? ""}
                  error={touched.has('issuedTo.pan') ? errors['issuedTo.pan'] : undefined}
                  onChange={(e) => {
                    markTouched('issuedTo.pan');
                    validateAndUpdateNested('issuedTo.pan', e.target.value, () => 
                      update({ issuedTo: { ...data.issuedTo, pan: e.target.value } })
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3">Project Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <ValidatedInput
            label="Project"
            placeholder="Project"
            value={data.project.project}
            error={touched.has('project.project') ? errors['project.project'] : undefined}
            required
            onChange={(e) => {
              markTouched('project.project');
              validateAndUpdateNested('project.project', e.target.value, () => 
                update({ project: { ...data.project, project: e.target.value } })
              );
            }}
          />
          <ValidatedInput
            label="Delivery"
            placeholder="Delivery"
            value={data.project.delivery}
            error={touched.has('project.delivery') ? errors['project.delivery'] : undefined}
            required
            onChange={(e) => {
              markTouched('project.delivery');
              validateAndUpdateNested('project.delivery', e.target.value, () => 
                update({ project: { ...data.project, delivery: e.target.value } })
              );
            }}
          />
          <ValidatedInput
            label="Rate Per Site"
            placeholder="Rate Per Site"
            type="number"
            value={data.project.ratePerSite}
            error={touched.has('project.ratePerSite') ? errors['project.ratePerSite'] : undefined}
            required
            onChange={(e) => {
              markTouched('project.ratePerSite');
              validateAndUpdateNested('project.ratePerSite', Number(e.target.value), () => 
                update({ project: { ...data.project, ratePerSite: Number(e.target.value) } })
              );
            }}
          />
          <ValidatedInput
            label="Total Sites"
            placeholder="Total Sites"
            type="number"
            value={data.project.totalSites}
            error={touched.has('project.totalSites') ? errors['project.totalSites'] : undefined}
            required
            onChange={(e) => {
              markTouched('project.totalSites');
              validateAndUpdateNested('project.totalSites', Number(e.target.value), () => 
                update({ project: { ...data.project, totalSites: Number(e.target.value) } })
              );
            }}
          />
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Billing Items</h3>
          <Button size="sm" onClick={addItem}>
            <Plus /> Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {data.items.map((it, idx) => (
            <div key={it.id} className="grid grid-cols-[1fr_100px_140px_auto] gap-2 items-start">
              <div className="space-y-1">
                <ValidatedInput
                  placeholder={`Description #${idx + 1}`}
                  value={it.description}
                  error={touched.has(`items.${idx}.description`) ? errors[`items.${idx}.description`] : undefined}
                  onChange={(e) => {
                    markTouched(`items.${idx}.description`);
                    updateItem(it.id, { description: e.target.value });
                  }}
                />
              </div>
              <div className="space-y-1">
                <ValidatedInput
                  type="number"
                  placeholder="Qty"
                  value={it.qty}
                  error={touched.has(`items.${idx}.qty`) ? errors[`items.${idx}.qty`] : undefined}
                  onChange={(e) => {
                    markTouched(`items.${idx}.qty`);
                    updateItem(it.id, { qty: Number(e.target.value) });
                  }}
                />
              </div>
              <div className="space-y-1">
                <ValidatedInput
                  type="number"
                  placeholder="Unit Price"
                  value={it.unitPrice}
                  error={touched.has(`items.${idx}.unitPrice`) ? errors[`items.${idx}.unitPrice`] : undefined}
                  onChange={(e) => {
                    markTouched(`items.${idx}.unitPrice`);
                    updateItem(it.id, { unitPrice: Number(e.target.value) });
                  }}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(it.id)} aria-label="delete" className="mt-1">
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3">Totals & Taxes</h3>
        <div className="grid grid-cols-3 gap-3">
          <ValidatedInput
            label="Advance (Adjustment)"
            type="number"
            value={data.advance}
            error={touched.has('advance') ? errors.advance : undefined}
            onChange={(e) => {
              markTouched('advance');
              validateAndUpdate('advance', Number(e.target.value), () => update({ advance: Number(e.target.value) }));
            }}
          />
          <ValidatedInput
            label="GST %"
            type="number"
            value={data.gstPercent}
            error={touched.has('gstPercent') ? errors.gstPercent : undefined}
            onChange={(e) => {
              markTouched('gstPercent');
              validateAndUpdate('gstPercent', Number(e.target.value), () => update({ gstPercent: Number(e.target.value) }));
            }}
          />
          <ValidatedInput
            label="TDS %"
            type="number"
            value={data.tdsPercent}
            error={touched.has('tdsPercent') ? errors.tdsPercent : undefined}
            onChange={(e) => {
              markTouched('tdsPercent');
              validateAndUpdate('tdsPercent', Number(e.target.value), () => update({ tdsPercent: Number(e.target.value) }));
            }}
          />
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          <ValidatedInput
            label="Bank Name"
            placeholder="Bank Name"
            value={data.payment.bankName}
            error={touched.has('payment.bankName') ? errors['payment.bankName'] : undefined}
            required
            onChange={(e) => {
              markTouched('payment.bankName');
              validateAndUpdateNested('payment.bankName', e.target.value, () => 
                update({ payment: { ...data.payment, bankName: e.target.value } })
              );
            }}
          />
          <ValidatedInput
            label="Account Name"
            placeholder="Account Name"
            value={data.payment.accountName}
            error={touched.has('payment.accountName') ? errors['payment.accountName'] : undefined}
            required
            onChange={(e) => {
              markTouched('payment.accountName');
              validateAndUpdateNested('payment.accountName', e.target.value, () => 
                update({ payment: { ...data.payment, accountName: e.target.value } })
              );
            }}
          />
          <ValidatedInput
            label="Account Number"
            placeholder="Account Number"
            value={data.payment.accountNumber}
            error={touched.has('payment.accountNumber') ? errors['payment.accountNumber'] : undefined}
            required
            onChange={(e) => {
              markTouched('payment.accountNumber');
              validateAndUpdateNested('payment.accountNumber', e.target.value, () => 
                update({ payment: { ...data.payment, accountNumber: e.target.value } })
              );
            }}
          />
          <ValidatedInput
            label="IFSC Code"
            placeholder="IFSC Code"
            value={data.payment.ifsc}
            error={touched.has('payment.ifsc') ? errors['payment.ifsc'] : undefined}
            required
            onChange={(e) => {
              markTouched('payment.ifsc');
              validateAndUpdateNested('payment.ifsc', e.target.value, () => 
                update({ payment: { ...data.payment, ifsc: e.target.value } })
              );
            }}
          />
          <ValidatedInput
            label="Branch"
            placeholder="Branch"
            value={data.payment.branch}
            error={touched.has('payment.branch') ? errors['payment.branch'] : undefined}
            required
            onChange={(e) => {
              markTouched('payment.branch');
              validateAndUpdateNested('payment.branch', e.target.value, () => 
                update({ payment: { ...data.payment, branch: e.target.value } })
              );
            }}
          />
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3">Terms & Conditions</h3>
        <ValidatedTextarea
          label="Terms & Conditions"
          placeholder="Enter terms"
          value={data.terms}
          error={touched.has('terms') ? errors.terms : undefined}
          required
          onChange={(e) => {
            markTouched('terms');
            validateAndUpdate('terms', e.target.value, () => update({ terms: e.target.value }));
          }}
        />
      </section>
    </div>
  );
}
