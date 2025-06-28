
export type SampleInvoiceFC = {
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
    country: string;
  };
  invoiceDetails: {
    number: string;
    date: Date;
    dueDate: Date;
  };
  items: {
    id: number;
    name: string;
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    rate: number; // in FCY
  }[];
  totals: {
    subtotalFC: number;
    igstFC: number;
    gstRate: number;
    grandTotalFC: number;
    grandTotalBCY: number;
    exchangeRate: number;
    currency: 'USD' | 'EUR';
  };
  bankDetails: {
    name: string;
    accountNumber: string;
    ifsc: string;
    swiftCode: string;
  };
  terms: string[];
};

const items = [
    {
      id: 1,
      name: 'Software Development Services',
      description: 'Q3 2024 Retainer',
      hsn: '998314',
      quantity: 3,
      unit: 'months',
      rate: 2500, // USD
    },
    {
      id: 2,
      name: 'Cloud Infrastructure Management',
      description: 'Managed Kubernetes Cluster',
      hsn: '998315',
      quantity: 1,
      unit: 'service',
      rate: 1500, // USD
    },
    {
        id: 3,
        name: 'API Integration Project',
        description: 'Integration with third-party payment gateway',
        hsn: '998313',
        quantity: 40,
        unit: 'hours',
        rate: 100, // USD
    }
];

const subtotalFC = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
const gstRate = 18; // IGST for export of services
const igstFC = subtotalFC * (gstRate / 100);
const grandTotalFC = subtotalFC + igstFC;
const exchangeRate = 83.50;
const grandTotalBCY = grandTotalFC * exchangeRate;


export const sampleInvoiceFC: SampleInvoiceFC = {
  seller: {
    name: 'Hicks Inc.',
    address: '123 Business Rd, Financial District, Mumbai, Maharashtra, 400001, India',
    gstin: '27ABCDE1234F1Z5',
    state: 'Maharashtra',
  },
  buyer: {
    name: 'Global Tech Solutions',
    billingAddress: '1 International Drive, Suite 500, Silicon Valley, CA 94025',
    shippingAddress: '1 International Drive, Suite 500, Silicon Valley, CA 94025',
    country: 'USA',
  },
  invoiceDetails: {
    number: 'INV-FC-2024-07-002',
    date: new Date('2024-07-22'),
    dueDate: new Date('2024-08-21'),
  },
  items,
  totals: {
    subtotalFC,
    igstFC,
    gstRate,
    grandTotalFC,
    grandTotalBCY,
    exchangeRate,
    currency: 'USD',
  },
  bankDetails: {
    name: 'Global Bank of India',
    accountNumber: '123456789012',
    ifsc: 'GBIN0001234',
    swiftCode: 'GBININBBXXX'
  },
  terms: [
    'This invoice is for export of services and is subject to IGST.',
    'Payment is due in USD within 30 days.',
    'Please include the invoice number on your payment.',
  ],
};
