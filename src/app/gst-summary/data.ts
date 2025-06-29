
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
