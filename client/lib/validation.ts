import { z } from "zod";

// Validation schema for invoice data
export const invoiceValidationSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  serviceTitle: z.string().min(1, "Service title is required").max(50, "Service title must be less than 50 characters"),
  invoiceNumber: z.string().min(1, "Invoice number is required").max(50, "Invoice number must be less than 50 characters"),
  dateISO: z.string().min(1, "Date is required"),
  status: z.enum(["Rejected", "Completed", "Pending", "Approved"], { required_error: "Status is required" }),
  
  issuedFrom: z.object({
    name: z.string().min(1, "Issued from name is required").max(100, "Name must be less than 100 characters"),
    address: z.string().min(1, "Issued from address is required").max(500, "Address must be less than 500 characters"),
    gstin: z.string().optional().refine((val) => {
      if (!val) return true;
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val);
    }, "Invalid GSTIN format"),
    pan: z.string().optional().refine((val) => {
      if (!val) return true;
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val);
    }, "Invalid PAN format"),
  }),
  
  issuedTo: z.object({
    name: z.string().min(1, "Issued to name is required").max(100, "Name must be less than 100 characters"),
    address: z.string().min(1, "Issued to address is required").max(500, "Address must be less than 500 characters"),
    gstin: z.string().optional().refine((val) => {
      if (!val) return true;
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val);
    }, "Invalid GSTIN format"),
    pan: z.string().optional().refine((val) => {
      if (!val) return true;
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val);
    }, "Invalid PAN format"),
  }),
  
  project: z.object({
    project: z.string().min(1, "Project name is required").max(200, "Project name must be less than 200 characters"),
    delivery: z.string().min(1, "Delivery details are required").max(200, "Delivery details must be less than 200 characters"),
    ratePerSite: z.number().min(0, "Rate per site must be non-negative").max(1000000, "Rate per site is too high"),
    totalSites: z.number().min(1, "Total sites must be at least 1").max(10000, "Total sites is too high"),
  }),
  
  items: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, "Item description is required").max(200, "Description must be less than 200 characters"),
    qty: z.number().min(0.01, "Quantity must be greater than 0").max(10000, "Quantity is too high"),
    unitPrice: z.number().min(0, "Unit price must be non-negative").max(1000000, "Unit price is too high"),
  })).min(1, "At least one item is required"),
  
  advance: z.number().min(0, "Advance amount must be non-negative").max(10000000, "Advance amount is too high"),
  gstPercent: z.number().min(0, "GST percentage must be non-negative").max(100, "GST percentage cannot exceed 100%"),
  tdsPercent: z.number().min(0, "TDS percentage must be non-negative").max(100, "TDS percentage cannot exceed 100%"),
  
  payment: z.object({
    bankName: z.string().min(1, "Bank name is required").max(100, "Bank name must be less than 100 characters"),
    accountName: z.string().min(1, "Account name is required").max(100, "Account name must be less than 100 characters"),
    accountNumber: z.string().min(1, "Account number is required").refine((val) => {
      return /^[0-9]{9,18}$/.test(val);
    }, "Account number must be 9-18 digits"),
    ifsc: z.string().min(1, "IFSC code is required").refine((val) => {
      return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val);
    }, "Invalid IFSC code format"),
    branch: z.string().min(1, "Branch name is required").max(100, "Branch name must be less than 100 characters"),
  }),
  
  terms: z.string().min(1, "Terms and conditions are required").max(1000, "Terms must be less than 1000 characters"),
});

export type InvoiceValidationErrors = Partial<Record<keyof z.infer<typeof invoiceValidationSchema>, string>>;

// Helper function to validate individual fields
export const validateField = (field: string, value: any): string | null => {
  try {
    const fieldSchema = invoiceValidationSchema.shape[field as keyof typeof invoiceValidationSchema.shape];
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid value";
    }
    return "Invalid value";
  }
};

// Helper function to validate nested objects
export const validateNestedField = (path: string, value: any): string | null => {
  try {
    const [parent, child] = path.split('.');
    const parentSchema = invoiceValidationSchema.shape[parent as keyof typeof invoiceValidationSchema.shape];
    
    if (parentSchema && 'shape' in parentSchema) {
      const childSchema = (parentSchema as any).shape[child];
      if (childSchema) {
        childSchema.parse(value);
      }
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid value";
    }
    return "Invalid value";
  }
};
