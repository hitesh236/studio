
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
            { id: 'line-6-1', account: 'Furniture A/c', debit: 10000, credit: 0 },
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
];

export const generateJournalEntries = (count: number): JournalEntry[] => {
    return entries;
};
