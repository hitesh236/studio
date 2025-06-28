
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
    createdBy: string;
};

const accounts = ['Cash', "Owner's Equity", 'Office Supplies', 'Accounts Payable', 'Rent Expense', 'Accounts Receivable', 'Sales Revenue', 'Salaries', 'Inventory', 'Prepaid Insurance', 'Equipment', 'Accumulated Depreciation', 'Wages Payable', 'Unearned Revenue', 'Common Stock', 'Service Revenue', 'Advertising Expense', 'Utilities Expense'];
const descriptions = [
    'Initial capital contribution',
    'Purchase of office supplies on credit',
    'Payment of rent for the month',
    'Sales revenue on account to a customer',
    'Received cash from a customer on account',
    'Paid bi-weekly employee salaries',
    'Purchased inventory for cash',
    'Sold goods for cash',
    'Paid for a one-year insurance policy',
    'Purchased new office equipment on account',
    'Recorded monthly depreciation on equipment',
    'Paid for advertising campaign',
    'Utility bill payment for the month'
];
const users = ['Admin', 'Jane Doe', 'John Smith', 'Alice Cooper', 'Bob Vance'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const generateJournalEntries = (count: number): JournalEntry[] => {
    const entries: JournalEntry[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const amount = Math.floor(Math.random() * 49001) + 1000;
        
        let debitAccount = getRandomElement(accounts);
        let creditAccount = getRandomElement(accounts);
        // Ensure debit and credit accounts are not the same
        while (debitAccount === creditAccount) {
            creditAccount = getRandomElement(accounts);
        }

        const entry: JournalEntry = {
            id: `JE-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), now),
            entryNumber: `JRNL-${now.getFullYear()}-${1001 + i}`,
            description: getRandomElement(descriptions),
            lines: [
                { id: `${i}-1`, account: debitAccount, debit: amount, credit: 0 },
                { id: `${i}-2`, account: creditAccount, debit: 0, credit: amount },
            ],
            createdBy: getRandomElement(users)
        };
        entries.push(entry);
    }
    return entries;
};


export const journalEntries: JournalEntry[] = generateJournalEntries(50);
