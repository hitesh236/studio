
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

const accounts = ['Cash', "Owner's Equity", 'Office Supplies', 'Accounts Payable', 'Rent Expense', 'Accounts Receivable', 'Sales Revenue', 'Salaries', 'Inventory', 'Prepaid Insurance', 'Equipment', 'Accumulated Depreciation', 'Wages Payable', 'Unearned Revenue', 'Common Stock', 'Service Revenue', 'Advertising Expense', 'Utilities Expense'];
const descriptions = [
    'Initial capital contribution and office setup',
    'Purchase of office supplies and equipment on credit',
    'Payment of rent and utilities for the month',
    'Complex sales transaction with multiple revenue streams',
    'Received cash from various customers on account',
    'Paid bi-weekly employee salaries and wages',
    'Purchased inventory for cash and on credit',
    'Sold goods for cash and recorded COGS',
    'Paid for multiple insurance policies',
    'Acquired new office equipment and furniture',
    'Recorded monthly depreciation and amortization',
    'Paid for advertising campaign and marketing services',
    'Utility bill payments and other misc expenses'
];
const users = ['Admin', 'Jane Doe', 'John Smith', 'Alice Cooper', 'Bob Vance'];
const voucherTypes = ['Journal', 'Payment', 'Receipt', 'Sales', 'Purchase'];
const statuses = ['Approved', 'Pending'] as const;


const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generateRandomLines = (totalAmount: number): JournalEntryLine[] => {
    const lines: JournalEntryLine[] = [];
    let remainingDebit = totalAmount;
    let remainingCredit = totalAmount;
    let lineId = 1;

    // Generate debit lines
    while (remainingDebit > 0) {
        const numDebitLines = Math.floor(Math.random() * 2) + 1; // 1 or 2 debit lines
        const debitAmount = remainingDebit / numDebitLines;
        for(let i = 0; i < numDebitLines; i++) {
             if (remainingDebit <= 0) break;
             const amount = (i === numDebitLines - 1) ? remainingDebit : Math.floor(Math.random() * remainingDebit * 0.8) + 1;
             lines.push({ id: `line-${lineId++}`, account: getRandomElement(accounts), debit: amount, credit: 0 });
             remainingDebit -= amount;
        }
    }

    // Generate credit lines
    while (remainingCredit > 0) {
        const numCreditLines = Math.floor(Math.random() * 2) + 1; // 1 or 2 credit lines
        const creditAmount = remainingCredit / numCreditLines;
        for(let i = 0; i < numCreditLines; i++) {
            if (remainingCredit <= 0) break;
            const amount = (i === numCreditLines - 1) ? remainingCredit : Math.floor(Math.random() * remainingCredit * 0.8) + 1;
            let creditAccount = getRandomElement(accounts);
            // Ensure credit account is not already used in a debit line
            while (lines.some(l => l.account === creditAccount)) {
                creditAccount = getRandomElement(accounts);
            }
            lines.push({ id: `line-${lineId++}`, account: creditAccount, debit: 0, credit: amount });
            remainingCredit -= amount;
        }
    }

    return lines;
};


export const generateJournalEntries = (count: number): JournalEntry[] => {
    const entries: JournalEntry[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const totalAmount = Math.floor(Math.random() * 49001) + 1000;
        const entry: JournalEntry = {
            id: `JE-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 3, 1), now),
            entryNumber: `JRNL-${now.getFullYear()}-${1001 + i}`,
            voucherType: getRandomElement(voucherTypes),
            description: getRandomElement(descriptions),
            lines: generateRandomLines(totalAmount),
            createdBy: getRandomElement(users),
            status: getRandomElement(statuses)
        };
        entries.push(entry);
    }
    return entries;
};
