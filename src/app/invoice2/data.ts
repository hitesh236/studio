
export type SampleInvoice = {
  seller: {
    name: string;
    address: string;
    gstin: string;
    state: string;
  };
  buyer: {
    name: string;
    billingAddress: string;
    shippingAddress: string;
    gstin: string;
    placeOfSupply: string;
  };
  invoiceDetails: {
    number: string;
    date: Date;
    dueDate: Date;
    status: 'Paid' | 'Partially Paid' | 'Unpaid';
  };
  items: {
    id: number;
    name: string;
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
  }[];
  totals: {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    grandTotal: number;
    amountPaid: number;
    salesReturnAmount?: number;
    amountDue: number;
  };
  bankDetails: {
    name: string;
    accountNumber: string;
    ifsc: string;
  };
  terms: string[];
};

export const sampleInvoice: SampleInvoice = {
  seller: {
    name: 'Hicks Inc.',
    address: '123 Business Rd, Financial District, Mumbai, Maharashtra, 400001',
    gstin: '27ABCDE1234F1Z5',
    state: 'Maharashtra',
  },
  buyer: {
    name: 'Innovate Inc.',
    billingAddress: '789 Industrial Area, Andheri (E), Mumbai, Maharashtra, 400093',
    shippingAddress: '789 Industrial Area, Andheri (E), Mumbai, Maharashtra, 400093',
    gstin: '27AXYZE9876G1Z3',
    placeOfSupply: 'Maharashtra',
  },
  invoiceDetails: {
    number: 'INV-2024-07-001',
    date: new Date('2024-07-21'),
    dueDate: new Date('2024-08-20'),
    status: 'Partially Paid',
  },
  items: [
    {
      id: 1,
      name: 'Cloud Hosting Services',
      description: 'Premium Tier - Annual Subscription',
      hsn: '998315',
      quantity: 1,
      unit: 'year',
      rate: 50000,
      gstRate: 18,
    },
    {
      id: 2,
      name: 'Domain Name Registration',
      description: 'solutionscorp.com - 2 years',
      hsn: '998314',
      quantity: 1,
      unit: 'item',
      rate: 2500,
      gstRate: 18,
    },
    {
        id: 3,
        name: 'Technical Support Retainer',
        description: 'Monthly support package',
        hsn: '998313',
        quantity: 12,
        unit: 'months',
        rate: 10000,
        gstRate: 18,
    }
  ],
  totals: {
    subtotal: 172500,
    cgst: 15525,
    sgst: 15525,
    igst: 0,
    grandTotal: 203550,
    amountPaid: 100000,
    salesReturnAmount: 23600, // Example return for 2 months of support retainer
    amountDue: 79950, // 203550 (Total) - 100000 (Paid) - 23600 (Return)
  },
  bankDetails: {
    name: 'Global Bank of India',
    accountNumber: '123456789012',
    ifsc: 'GBIN0001234',
  },
  terms: [
    'Payment is due within 30 days.',
    'Please include the invoice number on your payment.',
    'A late fee of 1.5% per month will be charged on overdue invoices.',
  ],
};
