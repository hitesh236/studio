
export type JournalEntryLine = {
    id: string;
    account: string;
    debit: number;
    credit: number;
}

export type JournalEntry = {
    id: string;
    date: Date;
    entryNumber: string;
    voucherType: string;
    description: string;
    lines: JournalEntryLine[];
    createdBy: string;
    status: 'Approved' | 'Pending';
};

const entries: JournalEntry[] = [
    {
        id: 'JE-0401-1',
        date: new Date('2024-04-01'),
        entryNumber: 'JRNL-2024-0401',
        voucherType: 'Receipt',
        description: 'Being the common stock issued worth $100,000',
        lines: [
            { id: 'line-1-1', account: 'Cash A/c', debit: 100000, credit: 0 },
            { id: 'line-1-2', account: 'Common Stock A/c', debit: 0, credit: 100000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0401-2',
        date: new Date('2024-04-01'),
        entryNumber: 'JRNL-2024-0402',
        voucherType: 'Payment',
        description: 'Being the rent for the current month paid amounting $10,000',
        lines: [
            { id: 'line-2-1', account: 'Rent A/c', debit: 10000, credit: 0 },
            { id: 'line-2-2', account: 'Cash A/c', debit: 0, credit: 10000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0401-3',
        date: new Date('2024-04-01'),
        entryNumber: 'JRNL-2024-0403',
        voucherType: 'Payment',
        description: 'Being the advance rent for the next 5 months paid amounting $50,000',
        lines: [
            { id: 'line-3-1', account: 'Prepaid Rent A/c', debit: 50000, credit: 0 },
            { id: 'line-3-2', account: 'Cash A/c', debit: 0, credit: 50000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0403-1',
        date: new Date('2024-04-03'),
        entryNumber: 'JRNL-2024-0404',
        voucherType: 'Journal',
        description: 'Being Office supplies purchased on account having cost of $12,500',
        lines: [
            { id: 'line-4-1', account: 'Office Supplies A/c', debit: 12500, credit: 0 },
            { id: 'line-4-2', account: 'Accounts Payable A/c', debit: 0, credit: 12500 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0405-1',
        date: new Date('2024-04-05'),
        entryNumber: 'JRNL-2024-0405',
        voucherType: 'Receipt',
        description: 'Being the cash received against the provision of the services',
        lines: [
            { id: 'line-5-1', account: 'Cash A/c', debit: 45000, credit: 0 },
            { id: 'line-5-2', account: 'Revenue from Services', debit: 0, credit: 45000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0407-1',
        date: new Date('2024-04-07'),
        entryNumber: 'JRNL-2024-0406',
        voucherType: 'Payment',
        description: 'Being the Furniture worth $10,000 purchased with 10% trade discount',
        lines: [
            { id: 'line-6-1', account: 'Furniture & Fixtures', debit: 10000, credit: 0 },
            { id: 'line-6-2', account: 'Cash A/c', debit: 0, credit: 9000 },
            { id: 'line-6-3', account: 'Trade Discount A/c', debit: 0, credit: 1000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0409-1',
        date: new Date('2024-04-09'),
        entryNumber: 'JRNL-2024-0407',
        voucherType: 'Payment',
        description: 'Being amount paid against the office supplies purchased on account on 03-April',
        lines: [
            { id: 'line-7-1', account: 'Accounts Payable A/c', debit: 12500, credit: 0 },
            { id: 'line-7-2', account: 'Cash A/c', debit: 0, credit: 12500 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0411-1',
        date: new Date('2024-04-11'),
        entryNumber: 'JRNL-2024-0408',
        voucherType: 'Journal',
        description: 'Being the Equipment worth $50,000 purchased by paying in cash and in notes payable',
        lines: [
            { id: 'line-8-1', account: 'Equipment A/c', debit: 50000, credit: 0 },
            { id: 'line-8-2', account: 'Cash A/c', debit: 0, credit: 30000 },
            { id: 'line-8-3', account: 'Notes Payable A/c', debit: 0, credit: 20000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0413-1',
        date: new Date('2024-04-13'),
        entryNumber: 'JRNL-2024-0409',
        voucherType: 'Sales',
        description: 'Being the services worth $50,000 provided to customers on account',
        lines: [
            { id: 'line-9-1', account: 'Accounts Receivable A/c', debit: 50000, credit: 0 },
            { id: 'line-9-2', account: 'Revenue from Services', debit: 0, credit: 50000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0415-1',
        date: new Date('2024-04-15'),
        entryNumber: 'JRNL-2024-0410',
        voucherType: 'Receipt',
        description: 'Being amount received against the services provided on account on 13-April',
        lines: [
            { id: 'line-10-1', account: 'Cash A/c', debit: 15000, credit: 0 },
            { id: 'line-10-2', account: 'Accounts Receivable A/c', debit: 0, credit: 15000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0417-1',
        date: new Date('2024-04-17'),
        entryNumber: 'JRNL-2024-0411',
        voucherType: 'Payment',
        description: 'Being stationary worth $500 purchased',
        lines: [
            { id: 'line-11-1', account: 'Stationary A/c', debit: 500, credit: 0 },
            { id: 'line-11-2', account: 'Cash A/c', debit: 0, credit: 500 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0423-1',
        date: new Date('2024-04-23'),
        entryNumber: 'JRNL-2024-0412',
        voucherType: 'Receipt',
        description: 'Being amount received against the services provided on account on 13-April',
        lines: [
            { id: 'line-12-1', account: 'Cash A/c', debit: 35000, credit: 0 },
            { id: 'line-12-2', account: 'Accounts Receivable A/c', debit: 0, credit: 35000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0430-1',
        date: new Date('2024-04-30'),
        entryNumber: 'JRNL-2024-0413',
        voucherType: 'Payment',
        description: 'Being Electricity Expenses for the month paid',
        lines: [
            { id: 'line-13-1', account: 'Electricity Expense A/c', debit: 2000, credit: 0 },
            { id: 'line-13-2', account: 'Cash A/c', debit: 0, credit: 2000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0430-2',
        date: new Date('2024-04-30'),
        entryNumber: 'JRNL-2024-0414',
        voucherType: 'Payment',
        description: 'Being Telephone Expenses for the month paid',
        lines: [
            { id: 'line-14-1', account: 'Telephone Expense A/c', debit: 1500, credit: 0 },
            { id: 'line-14-2', account: 'Cash A/c', debit: 0, credit: 1500 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0430-3',
        date: new Date('2024-04-30'),
        entryNumber: 'JRNL-2024-0415',
        voucherType: 'Payment',
        description: 'Being Miscellaneous Expenses for the month paid',
        lines: [
            { id: 'line-15-1', account: 'Miscellaneous Expense A/c', debit: 5300, credit: 0 },
            { id: 'line-15-2', account: 'Cash A/c', debit: 0, credit: 5300 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-0430-4',
        date: new Date('2024-04-30'),
        entryNumber: 'JRNL-2024-0416',
        voucherType: 'Payment',
        description: 'Being Wages for the month paid',
        lines: [
            { id: 'line-16-1', account: 'Wages Expense A/c', debit: 40000, credit: 0 },
            { id: 'line-16-2', account: 'Cash A/c', debit: 0, credit: 40000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    // Add more entries to ensure all ledgers have enough data
    { id: 'JE-0501-1', date: new Date('2024-05-01'), entryNumber: 'JRNL-2024-0501', voucherType: 'Payment', description: 'Paid for office supplies', lines: [{ id: 'l1', account: 'Office Supplies A/c', debit: 5000, credit: 0 }, { id: 'l2', account: 'HDFC Bank', debit: 0, credit: 5000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0502-1', date: new Date('2024-05-02'), entryNumber: 'JRNL-2024-0502', voucherType: 'Payment', description: 'Paid for computer equipment', lines: [{ id: 'l1', account: 'Computers', debit: 25000, credit: 0 }, { id: 'l2', account: 'HDFC Bank', debit: 0, credit: 25000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0503-1', date: new Date('2024-05-03'), entryNumber: 'JRNL-2024-0503', voucherType: 'Receipt', description: 'Received payment from Innovate Inc.', lines: [{ id: 'l1', account: 'ICICI Bank', debit: 10000, credit: 0 }, { id: 'l2', account: 'Innovate Inc.', debit: 0, credit: 10000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0504-1', date: new Date('2024-05-04'), entryNumber: 'JRNL-2024-0504', voucherType: 'Receipt', description: 'Received payment from Solutions Corp.', lines: [{ id: 'l1', account: 'HDFC Bank', debit: 20000, credit: 0 }, { id: 'l2', account: 'Solutions Corp.', debit: 0, credit: 20000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0505-1', date: new Date('2024-05-05'), entryNumber: 'JRNL-2024-0505', voucherType: 'Payment', description: 'Paid to Cloud Services LLC', lines: [{ id: 'l1', account: 'Cloud Services LLC', debit: 15000, credit: 0 }, { id: 'l2', account: 'HDFC Bank', debit: 0, credit: 15000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0506-1', date: new Date('2024-05-06'), entryNumber: 'JRNL-2024-0506', voucherType: 'Payment', description: 'Paid to Office Supplies R Us', lines: [{ id: 'l1', account: 'Office Supplies R Us', debit: 5000, credit: 0 }, { id: 'l2', account: 'ICICI Bank', debit: 0, credit: 5000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0507-1', date: new Date('2024-05-07'), entryNumber: 'JRNL-2024-0507', voucherType: 'Journal', description: 'GST Payable adjustment', lines: [{ id: 'l1', account: 'GST Payable', debit: 10000, credit: 0 }, { id: 'l2', account: 'HDFC Bank', debit: 0, credit: 10000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0508-1', date: new Date('2024-05-08'), entryNumber: 'JRNL-2024-0508', voucherType: 'Journal', description: 'Capital infusion', lines: [{ id: 'l1', account: 'HDFC Bank', debit: 500000, credit: 0 }, { id: 'l2', account: 'Retained Earnings', debit: 0, credit: 500000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0509-1', date: new Date('2024-05-09'), entryNumber: 'JRNL-2024-0509', voucherType: 'Sales', description: 'Sales to Innovate Inc.', lines: [{ id: 'l1', account: 'Innovate Inc.', debit: 30000, credit: 0 }, { id: 'l2', account: 'Domestic Sales', debit: 0, credit: 30000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0510-1', date: new Date('2024-05-10'), entryNumber: 'JRNL-2024-0510', voucherType: 'Payment', description: 'Purchase of Furniture', lines: [{ id: 'l1', account: 'Furniture & Fixtures', debit: 50000, credit: 0 }, { id: 'l2', account: 'HDFC Bank', debit: 0, credit: 50000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0511-1', date: new Date('2024-05-11'), entryNumber: 'JRNL-2024-0511', voucherType: 'Payment', description: 'Salary payment', lines: [{ id: 'l1', account: 'Salaries & Wages', debit: 150000, credit: 0 }, { id: 'l2', account: 'HDFC Bank', debit: 0, credit: 150000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0512-1', date: new Date('2024-05-12'), entryNumber: 'JRNL-2024-0512', voucherType: 'Payment', description: 'Rent payment', lines: [{ id: 'l1', account: 'Rent & Rates', debit: 60000, credit: 0 }, { id: 'l2', account: 'HDFC Bank', debit: 0, credit: 60000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0513-1', date: new Date('2024-05-13'), entryNumber: 'JRNL-2024-0513', voucherType: 'Sales', description: 'Sales to Solutions Corp.', lines: [{ id: 'l1', account: 'Solutions Corp.', debit: 40000, credit: 0 }, { id: 'l2', account: 'Domestic Sales', debit: 0, credit: 40000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0514-1', date: new Date('2024-05-14'), entryNumber: 'JRNL-2024-0514', voucherType: 'Journal', description: 'Purchase from Cloud Services LLC', lines: [{ id: 'l1', account: 'Purchases', debit: 25000, credit: 0 }, { id: 'l2', account: 'Cloud Services LLC', debit: 0, credit: 25000 }], createdBy: 'Admin', status: 'Approved' },
    { id: 'JE-0515-1', date: new Date('2024-05-15'), entryNumber: 'JRNL-2024-0515', voucherType: 'Journal', description: 'Depreciation on Computers', lines: [{ id: 'l1', account: 'Depreciation on Computers', debit: 10000, credit: 0 }, { id: 'l2', account: 'Computers', debit: 0, credit: 10000 }], createdBy: 'Admin', status: 'Approved' },
];

export const generateJournalEntries = (count: number): JournalEntry[] => {
    return entries;
};
