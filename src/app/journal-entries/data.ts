
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
    description: string;
    lines: JournalEntryLine[];
};

export const journalEntries: JournalEntry[] = [
    {
        id: 'JE-001',
        date: new Date('2024-07-01'),
        entryNumber: 'JRNL-2024-001',
        description: 'Initial capital contribution',
        lines: [
            { id: '1-1', account: 'Cash', debit: 50000, credit: 0 },
            { id: '1-2', account: "Owner's Equity", debit: 0, credit: 50000 },
        ]
    },
    {
        id: 'JE-002',
        date: new Date('2024-07-05'),
        entryNumber: 'JRNL-2024-002',
        description: 'Purchase of office supplies on credit',
        lines: [
            { id: '2-1', account: 'Office Supplies', debit: 2500, credit: 0 },
            { id: '2-2', account: 'Accounts Payable', debit: 0, credit: 2500 },
        ]
    },
    {
        id: 'JE-003',
        date: new Date('2024-07-10'),
        entryNumber: 'JRNL-2024-003',
        description: 'Payment of rent',
        lines: [
            { id: '3-1', account: 'Rent Expense', debit: 10000, credit: 0 },
            { id: '3-2', account: 'Cash', debit: 0, credit: 10000 },
        ]
    },
    {
        id: 'JE-004',
        date: new Date('2024-07-15'),
        entryNumber: 'JRNL-2024-004',
        description: 'Sales revenue on account',
        lines: [
            { id: '4-1', account: 'Accounts Receivable', debit: 15000, credit: 0 },
            { id: '4-2', account: 'Sales Revenue', debit: 0, credit: 15000 },
        ]
    },
    {
        id: 'JE-005',
        date: new Date('2024-07-20'),
        entryNumber: 'JRNL-2024-005',
        description: 'Collection from customer',
        lines: [
            { id: '5-1', account: 'Cash', debit: 7500, credit: 0 },
            { id: '5-2', account: 'Accounts Receivable', debit: 0, credit: 7500 },
        ]
    }
];
