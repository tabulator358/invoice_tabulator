export interface InvoiceData {
  invoiceNumber: string;
  supplier: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  bankAccount: string;
  description: string;
  quantity: number;
  price: number;
  currencyCode: string;
  comment?: string;
}

export interface TemplateConfig {
  id: number;
  name: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  layout: "modern" | "classic" | "minimal" | "bold";
}
