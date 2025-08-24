
export type SalesInvoiceItem = {
  id: number;
  name: string;
  quantity: number;
  rate: number;
};

export type SalesInvoice = {
  id: string;
  invoiceNumber: string; // This will now represent the Credit Note number
  originalInvoiceNumber: string; // New field for the original invoice
  customerName: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  totalTaxableValue: number;
  totalGstAmount: number;
  gstType: 'CGST&SGST' | 'IGST' | 'UTGST' | 'N/A';
  placeOfSupply: string;
  paymentStatus: 'Outstanding' | 'Partially Paid' | 'Paid' | 'Overdue';
  amountPaid: number;
  amountDue: number;
  createdBy: string;
  items: SalesInvoiceItem[];
};

import { staticCustomers } from '@/lib/customer-data';

const customerNames = staticCustomers.map(c => c.company || `${c.firstName} ${c.lastName}`);
const gstTypes = ['CGST&SGST', 'IGST', 'UTGST', 'N/A'] as const;
const createdByUsers = ['Admin', 'John Doe', 'Jane Smith', 'Peter Jones'];
const placesOfSupply = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat'];
const itemNames = ['Cloud Hosting', 'Domain Registration', 'SSL Certificate', 'Consulting Hours', 'Support Retainer'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export function generateSalesInvoiceReturns(count: number): SalesInvoice[] {
  const invoices: SalesInvoice[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Generate items for the invoice
    const items: SalesInvoiceItem[] = [];
    const itemCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
    let amount = 0;
    for (let j = 0; j < itemCount; j++) {
        const quantity = Math.floor(Math.random() * 5) + 1;
        const rate = (Math.floor(Math.random() * 20) + 1) * 50; // Multiple of 50
        items.push({
            id: j + 1,
            name: getRandomElement(itemNames),
            quantity,
            rate,
        });
        amount += quantity * rate;
    }

    // Make some due dates in the past for 'Overdue' status
    const invoiceDate = getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + (Math.random() > 0.3 ? 30 : -15)); // 30% chance for due date to be in the past

    const paymentRandom = Math.random();
    let amountPaid: number;

    if (paymentRandom < 0.25) { // ~25% Paid
        amountPaid = amount;
    } else if (paymentRandom < 0.5) { // ~25% Partially Paid
        amountPaid = (Math.random() * 0.8 + 0.1) * amount; // 10% to 90% paid
    } else { // ~50% will have 0 paid
        amountPaid = 0;
    }
    
    const amountDue = Math.max(0, amount - amountPaid);

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
      id: `uuid-R-${1000 + i}`,
      invoiceNumber: `CN-${2000 + i}`, // This is the Credit Note number
      originalInvoiceNumber: `INV-${1000 + i}`, // This is the original Invoice number
      customerName: getRandomElement(customerNames),
      invoiceDate,
      dueDate,
      amount: amount,
      totalTaxableValue: amount * 0.9, // simplified
      totalGstAmount: amount * 0.1, // simplified
      gstType: getRandomElement(gstTypes),
      placeOfSupply: getRandomElement(placesOfSupply),
      paymentStatus: paymentStatus,
      amountPaid: amountPaid,
      amountDue: amountDue,
      createdBy: getRandomElement(createdByUsers),
      items: items,
    };
    invoices.push(invoice);
  }
  return invoices;
}
