
export type StockHistoryEntry = {
    id: string;
    date: Date;
    type: 'IN' | 'OUT';
    quantity: number;
    reference: string;
    notes: string;
};

const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const generateStockHistory = (productName: string, initialStock: number = 100): StockHistoryEntry[] => {
    const entries: StockHistoryEntry[] = [];
    const now = new Date();
    
    // Initial stock entry
    entries.push({
        id: `STK-${1000}`,
        date: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        type: 'IN',
        quantity: initialStock,
        reference: 'Opening Stock',
        notes: 'Initial stock count'
    });

    for (let i = 1; i <= 25; i++) {
        const type = Math.random() > 0.4 ? 'OUT' : 'IN'; // More sales than purchases
        const quantity = Math.floor(Math.random() * 20) + 1;
        const reference = type === 'IN' ? `PUR-2024-${100 + i}` : `INV-2024-${500 + i}`;
        const notes = type === 'IN' ? 'Goods received from supplier' : 'Sale to customer';

        const entry: StockHistoryEntry = {
            id: `STK-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 2), now),
            type,
            quantity,
            reference,
            notes
        };
        entries.push(entry);
    }
    
    // Sort by date to ensure chronological order
    return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
};

    