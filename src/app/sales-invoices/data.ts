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
  amountDue: number;
  createdBy: string;
};

const customerNames = ["Innovate Inc.", "Solutions Corp.", "Quantum Tech", "Synergy LLC", "Apex Industries", "Starlight Co."];
const gstTypes = ['CGST&SGST', 'IGST', 'UTGST', 'N/A'] as const;
const currencyCodes = ['USD', 'INR', 'EUR'] as const;
const createdByUsers = ['Admin', 'John Doe', 'Jane Smith', 'Peter Jones'];
const placesOfSupply = ['California', 'New York', 'Texas', 'Florida', 'Maharashtra', 'Delhi'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export function generateSalesInvoices(count: number): SalesInvoice[] {
  const invoices: SalesInvoice[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const amountForeign = Math.floor(Math.random() * 4901) + 100;
    const amountPaid = Math.floor(Math.random() * amountForeign);
    const amountDue = amountForeign - amountPaid;
    
    const invoiceDate = getRandomDate(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), now);
    const dueDate = getRandomDate(invoiceDate, new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 3, invoiceDate.getDate()));

    let paymentStatus: SalesInvoice['paymentStatus'] = 'Outstanding';
    if (amountDue <= 0) {
        paymentStatus = 'Paid';
    } else if (amountPaid > 0) {
        paymentStatus = 'Partially Paid';
    } else if (now > dueDate) {
        paymentStatus = 'Overdue';
    }

    const currencyCode = getRandomElement(currencyCodes);
    const exchangeRate = currencyCode === 'INR' ? 83.5 : (currencyCode === 'EUR' ? 0.92 : 1);

    const invoice: SalesInvoice = {
      id: `uuid-${1000 + i}`,
      invoiceNumber: `INV-${1000 + i}`,
      customerName: getRandomElement(customerNames),
      invoiceDate,
      dueDate,
      currencyCode: currencyCode,
      exchangeRate,
      amountForeign: amountForeign,
      amountBase: amountForeign * exchangeRate,
      totalTaxableValue: amountForeign * 0.9,
      totalGstAmount: amountForeign * 0.1,
      gstType: getRandomElement(gstTypes),
      placeOfSupply: getRandomElement(placesOfSupply),
      paymentStatus: paymentStatus,
      amountPaid: amountPaid,
      amountDue: amountDue,
      createdBy: getRandomElement(createdByUsers),
    };
    invoices.push(invoice);
  }
  return invoices;
}
