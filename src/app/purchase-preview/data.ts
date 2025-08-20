
export type PurchaseBill = {
  vendor: {
    name: string;
    address: string;
    gstin: string;
  };
  buyer: {
    name: string;
    address: string;
    gstin: string;
    state: string;
  };
  billDetails: {
    number: string;
    date: Date;
    dueDate: Date;
  };
  items: {
    id: number;
    name: string;
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
  };
};

export const samplePurchaseBill: PurchaseBill = {
  vendor: {
    name: 'Cloud Services LLC',
    address: '456 Tech Park, Silicon Valley, CA 94025, USA',
    gstin: 'N/A',
  },
  buyer: {
    name: 'Hicks Inc.',
    address: '123 Business Rd, Financial District, Mumbai, Maharashtra, 400001',
    gstin: '27ABCDE1234F1Z5',
    state: 'Maharashtra',
  },
  billDetails: {
    number: 'BILL-2024-101',
    date: new Date('2024-07-15'),
    dueDate: new Date('2024-08-14'),
  },
  items: [
    {
      id: 1,
      name: 'Monthly Cloud Hosting',
      description: 'Server S-2, Premium Tier',
      hsn: '998315',
      quantity: 1,
      unit: 'month',
      rate: 7500,
      gstRate: 18,
    },
    {
      id: 2,
      name: 'Domain Name Renewal',
      description: 'hicks.inc - 1 year',
      hsn: '998314',
      quantity: 1,
      unit: 'year',
      rate: 1200,
      gstRate: 18,
    },
  ],
  totals: {
    subtotal: 8700,
    igst: 1566,
    cgst: 0,
    sgst: 0,
    grandTotal: 10266,
  },
};
