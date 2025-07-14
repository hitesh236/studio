
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
        id: 'JE-1001',
        date: new Date('2024-07-15'),
        entryNumber: 'JRNL-2024-1001',
        voucherType: 'Journal',
        description: 'Purchase of new office computers, part paid in bank, rest on credit from Cloud Services LLC.',
        lines: [
            { id: 'line-1-1', account: 'Computers', debit: 150000, credit: 0 },
            { id: 'line-1-2', account: 'HDFC Bank', debit: 0, credit: 50000 },
            { id: 'line-1-3', account: 'Cloud Services LLC', debit: 0, credit: 100000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1002',
        date: new Date('2024-07-20'),
        entryNumber: 'JRNL-2024-1002',
        voucherType: 'Sales',
        description: 'Sale of services to Innovate Inc. with 18% GST.',
        lines: [
            { id: 'line-2-1', account: 'Innovate Inc.', debit: 59000, credit: 0 },
            { id: 'line-2-2', account: 'Domestic Sales', debit: 0, credit: 50000 },
            { id: 'line-2-3', account: 'GST Payable', debit: 0, credit: 9000 },
        ],
        createdBy: 'Jane Doe',
        status: 'Pending'
    },
    {
        id: 'JE-1003',
        date: new Date('2024-07-01'),
        entryNumber: 'JRNL-2024-1003',
        voucherType: 'Payment',
        description: 'Paid for office supplies in cash.',
        lines: [
            { id: 'line-3-1', account: 'Printing & Stationery', debit: 2500, credit: 0 },
            { id: 'line-3-2', account: 'Cash', debit: 0, credit: 2500 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1004',
        date: new Date('2024-07-02'),
        entryNumber: 'JRNL-2024-1004',
        voucherType: 'Receipt',
        description: 'Cash sales of old scrap material.',
        lines: [
            { id: 'line-4-1', account: 'Cash', debit: 1200, credit: 0 },
            { id: 'line-4-2', account: 'Other Direct Income', debit: 0, credit: 1200 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1005',
        date: new Date('2024-07-03'),
        entryNumber: 'JRNL-2024-1005',
        voucherType: 'Contra',
        description: 'Cash deposited into HDFC Bank.',
        lines: [
            { id: 'line-5-1', account: 'HDFC Bank', debit: 10000, credit: 0 },
            { id: 'line-5-2', account: 'Cash', debit: 0, credit: 10000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1006',
        date: new Date('2024-07-05'),
        entryNumber: 'JRNL-2024-1006',
        voucherType: 'Contra',
        description: 'Cash withdrawn from HDFC Bank for office expenses.',
        lines: [
            { id: 'line-6-1', account: 'Cash', debit: 5000, credit: 0 },
            { id: 'line-6-2', account: 'HDFC Bank', debit: 0, credit: 5000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1007',
        date: new Date('2024-07-08'),
        entryNumber: 'JRNL-2024-1007',
        voucherType: 'Payment',
        description: 'Paid for miscellaneous office tea and snacks.',
        lines: [
            { id: 'line-7-1', account: 'Miscellaneous Operating Expenses', debit: 850, credit: 0 },
            { id: 'line-7-2', account: 'Cash', debit: 0, credit: 850 },
        ],
        createdBy: 'Jane Doe',
        status: 'Pending'
    },
    {
        id: 'JE-1008',
        date: new Date('2024-07-10'),
        entryNumber: 'JRNL-2024-1008',
        voucherType: 'Payment',
        description: 'Paid conveyance expenses to staff in cash.',
        lines: [
            { id: 'line-8-1', account: 'Other Indirect Expenses', debit: 1500, credit: 0 },
            { id: 'line-8-2', account: 'Cash', debit: 0, credit: 1500 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1009',
        date: new Date('2024-07-12'),
        entryNumber: 'JRNL-2024-1009',
        voucherType: 'Receipt',
        description: 'Received cash from a customer (Innovate Inc.) against their due.',
        lines: [
            { id: 'line-9-1', account: 'Cash', debit: 10000, credit: 0 },
            { id: 'line-9-2', account: 'Innovate Inc.', debit: 0, credit: 10000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1010',
        date: new Date('2024-07-16'),
        entryNumber: 'JRNL-2024-1010',
        voucherType: 'Payment',
        description: 'Paid salary advance to an employee in cash.',
        lines: [
            { id: 'line-10-1', account: 'Loans & Advances (Asset)', debit: 5000, credit: 0 },
            { id: 'line-10-2', account: 'Cash', debit: 0, credit: 5000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1011',
        date: new Date('2024-07-18'),
        entryNumber: 'JRNL-2024-1011',
        voucherType: 'Payment',
        description: 'Paid cash for freight on purchases.',
        lines: [
            { id: 'line-11-1', account: 'Other Direct Expenses', debit: 3000, credit: 0 },
            { id: 'line-11-2', account: 'Cash', debit: 0, credit: 3000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    },
    {
        id: 'JE-1012',
        date: new Date('2024-07-22'),
        entryNumber: 'JRNL-2024-1012',
        voucherType: 'Payment',
        description: 'Cash payment to a vendor (Office Supplies R Us).',
        lines: [
            { id: 'line-12-1', account: 'Office Supplies R Us', debit: 5000, credit: 0 },
            { id: 'line-12-2', account: 'Cash', debit: 0, credit: 5000 },
        ],
        createdBy: 'Admin',
        status: 'Approved'
    }
];

export const generateJournalEntries = (count: number): JournalEntry[] => {
    return entries;
};
