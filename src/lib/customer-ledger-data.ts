
export type CustomerLedgerEntry = {
    id: string;
    date: Date;
    description: string;
    ref: string;
    debit: number;
    credit: number;
};

const descriptions = [
    "Sale of goods on credit",
    "Payment received from customer",
    "Sales return from customer",
    "Discount allowed to customer",
    "Interest charged on overdue account",
];

const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const generateCustomerLedger = (count: number): CustomerLedgerEntry[] => {
    const entries: CustomerLedgerEntry[] = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        const isDebit = Math.random() > 0.3; // More debits (sales) than credits (payments)
        const amount = Math.floor(Math.random() * 20000) + 1000;

        const entry: CustomerLedgerEntry = {
            id: `CL-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 6, 1), now),
            description: isDebit ? "Sale of goods on credit" : "Payment received for invoice",
            ref: `INV-2024-${101 + i}`,
            debit: isDebit ? amount : 0,
            credit: !isDebit ? amount : 0,
        };
        entries.push(entry);
    }
    
    // Sort by date to calculate running balance correctly
    return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
};
