
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

const twoEntries: JournalEntry[] = [
    {
        id: 'JE-1001',
        date: new Date('2024-07-15'),
        entryNumber: 'JRNL-2024-1001',
        voucherType: 'Journal',
        description: 'Purchase of new office computers, part paid in cash, rest on credit from Cloud Services LLC.',
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
    }
];

export const generateJournalEntries = (count: number): JournalEntry[] => {
    // Return the two correct, hardcoded entries, ignoring the count for now to ensure correctness.
    return twoEntries;
};
