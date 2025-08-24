
export type SalesInvoiceItem = {
  id: number;
  name: string;
  quantity: number;
  rate: number;
  gstRate?: number;
  hsn?: string;
  unit?: string;
};

export type SalesInvoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: Date;
  dueDate: Date;
  currencyCode: 'USD' | 'INR' | 'EUR';
  exchangeRate: number;
  amountForeign: number;
  amountBase: number;
  totalTaxableValue: number;
  totalGstAmount: number;
  gstType: 'CGST&SGST' | 'IGST' | 'UTGST' | 'N/A';
  placeOfSupply: string;
  paymentStatus: 'Outstanding' | 'Partially Paid' | 'Paid' | 'Overdue';
  amountPaid: number;
  salesReturnAmount?: number;
  amountDue: number;
  createdBy: string;
  items: SalesInvoiceItem[];
  invoiceType: 'Item' | 'Service';
};

import { staticCustomers } from '@/lib/customer-data';

const customerNames = staticCustomers.map(c => c.company || `${c.firstName} ${c.lastName}`);
const gstTypes = ['CGST&SGST', 'IGST', 'UTGST', 'N/A'] as const;
const currencyCodes = ['USD', 'INR', 'EUR'] as const;
const createdByUsers = ['Admin', 'John Doe', 'Jane Smith', 'Peter Jones'];
const placesOfSupply = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat'];
const itemNames = ['Cloud Hosting', 'Domain Registration', 'SSL Certificate', 'Consulting Hours', 'Support Retainer'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export function generateSalesInvoices(count: number): SalesInvoice[] {
  const invoices: SalesInvoice[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const currencyCode = getRandomElement(currencyCodes);
    
    let exchangeRate: number;
    switch(currencyCode) {
        case 'USD':
            exchangeRate = 83.50;
            break;
        case 'EUR':
            exchangeRate = 90.75;
            break;
        case 'INR':
        default:
            exchangeRate = 1;
            break;
    }

    // Generate items for the invoice
    const items: SalesInvoiceItem[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
    let amountForeign = 0;
    for (let j = 0; j < itemCount; j++) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const rate = (Math.floor(Math.random() * 20) + 1) * 50; // Multiple of 50
        items.push({
            id: j + 1,
            name: getRandomElement(itemNames),
            quantity,
            rate,
        });
        amountForeign += quantity * rate;
    }

    const amountBase = amountForeign * exchangeRate;

    // Make some due dates in the past for 'Overdue' status
    const invoiceDate = getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + (Math.random() > 0.3 ? 30 : -15)); // 30% chance for due date to be in the past

    const paymentRandom = Math.random();
    let amountPaid: number;

    if (paymentRandom < 0.25) { // ~25% Paid
        amountPaid = amountBase;
    } else if (paymentRandom < 0.5) { // ~25% Partially Paid
        amountPaid = (Math.random() * 0.8 + 0.1) * amountBase; // 10% to 90% paid
    } else { // ~50% will have 0 paid
        amountPaid = 0;
    }
    
    const hasReturn = Math.random() < 0.2; // 20% chance of having a sales return
    const salesReturnAmount = hasReturn ? Math.floor(Math.random() * (amountBase / 4)) : 0; // Return up to 25% of base amount

    const amountDue = Math.max(0, amountBase - amountPaid - salesReturnAmount);

    let paymentStatus: SalesInvoice['paymentStatus'];
    if (amountDue <= 0.01) { // Use a small epsilon for float comparison
        paymentStatus = 'Paid';
    } else { // Not fully paid
        if (now > dueDate) {
            paymentStatus = 'Overdue';
        } else if (amountPaid > 0) {
            paymentStatus = 'Partially Paid';
        } else {
            paymentStatus = 'Outstanding';
        }
    }

    const invoice: SalesInvoice = {
      id: `uuid-${1000 + i}`,
      invoiceNumber: `INV-${1000 + i}`,
      customerName: getRandomElement(customerNames),
      invoiceDate,
      dueDate,
      currencyCode: currencyCode,
      exchangeRate,
      amountForeign: amountForeign,
      amountBase: amountBase,
      totalTaxableValue: amountBase * 0.9, // simplified
      totalGstAmount: amountBase * 0.1, // simplified
      gstType: getRandomElement(gstTypes),
      placeOfSupply: getRandomElement(placesOfSupply),
      paymentStatus: paymentStatus,
      amountPaid: amountPaid,
      salesReturnAmount: salesReturnAmount > 0 ? salesReturnAmount : undefined,
      amountDue: amountDue,
      createdBy: getRandomElement(createdByUsers),
      items: items,
      invoiceType: Math.random() > 0.5 ? 'Item' : 'Service',
    };
    invoices.push(invoice);
  }
  return invoices;
}
