

export type GstSummary = {
  id: string;
  month: string;
  year: number;
  gstr1: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    status: 'Filed' | 'Pending';
    filingDate: Date;
  };
  gstr3b: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    itc: number;
    status: 'Filed' | 'Pending';
    filingDate: Date;
  };
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getRandomDateInMonth = (year: number, month: number): Date => {
    const date = new Date(year, month, 1);
    const day = Math.floor(Math.random() * 20) + 1; // Filing date between 1st and 20th
    date.setDate(day);
    return date;
}

export const generateGstSummary = (count: number): GstSummary[] => {
  const summaries: GstSummary[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const taxableValue = Math.floor(Math.random() * 500000) + 100000;
    const isIntraState = Math.random() > 0.5;
    const gstRate = 0.18;

    const cgst = isIntraState ? (taxableValue * gstRate) / 2 : 0;
    const sgst = isIntraState ? (taxableValue * gstRate) / 2 : 0;
    const igst = !isIntraState ? taxableValue * gstRate : 0;
    const itc = (taxableValue / 2) * gstRate * (Math.random() * 0.5 + 0.3); // ITC between 30-80% of tax on purchases

    summaries.push({
      id: `gst-${year}-${date.getMonth()}`,
      month,
      year,
      gstr1: {
        taxableValue: taxableValue,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        status: 'Filed',
        filingDate: getRandomDateInMonth(year, date.getMonth() + 1),
      },
      gstr3b: {
        taxableValue: taxableValue,
        cgst: cgst,
        sgst: sgst,
        igst: igst,
        itc: itc,
        status: 'Filed',
        filingDate: getRandomDateInMonth(year, date.getMonth() + 1),
      },
    });
  }
  return summaries;
};

export const gstSummaryData = generateGstSummary(12); // Last 12 months


// --- GSTR-1 Data ---
export type Gstr1Data = {
    b2b: {
        gstin: string;
        invoiceValue: number;
        taxableValue: number;
        rate: number;
        igst: number;
        cgst: number;
        sgst: number;
    }[];
    b2cLarge: {
        pos: string;
        invoiceValue: number;
        taxableValue: number;
        rate: number;
        igst: number;
    }[];
};
export const generateGstr1Data = (): Gstr1Data => ({
    b2b: [
        { gstin: '27ABCDE1234F1Z5', invoiceValue: 118000, taxableValue: 100000, rate: 18, igst: 18000, cgst: 0, sgst: 0 },
        { gstin: '29AABCS1234A1Z5', invoiceValue: 59000, taxableValue: 50000, rate: 18, igst: 0, cgst: 4500, sgst: 4500 },
        { gstin: '07AAAAA0000A1Z5', invoiceValue: 29500, taxableValue: 25000, rate: 18, igst: 4500, cgst: 0, sgst: 0 },
    ],
    b2cLarge: [
        { pos: 'Maharashtra-27', invoiceValue: 300000, taxableValue: 254237, rate: 18, igst: 45763, },
    ],
});


// --- GSTR-3B Data ---
export type Gstr3bData = {
    outwardSupplies: {
        taxableValue: number;
        igst: number;
        cgst: number;
        sgst: number;
    };
    inwardSuppliesRCM: {
        taxableValue: number;
        igst: number;
        cgst: number;
        sgst: number;
    };
    itcAvailable: {
        importGoods: number;
        importServices: number;
        inwardRCM: number;
        inwardISD: number;
        allOther: number;
    };
};
export const generateGstr3bData = (): Gstr3bData => ({
    outwardSupplies: {
        taxableValue: 585000.50,
        igst: 54900.09,
        cgst: 25425.05,
        sgst: 25425.05,
    },
    inwardSuppliesRCM: {
        taxableValue: 75000,
        igst: 0,
        cgst: 6750,
        sgst: 6750,
    },
    itcAvailable: {
        importGoods: 12000,
        importServices: 5000,
        inwardRCM: 13500,
        inwardISD: 2500,
        allOther: 45000,
    },
});
