
export type StockHistoryEntry = {
    id: string;
    date: Date;
    type: 'Purchase' | 'Sales Return' | 'Invoice' | 'Purchase Return' | 'Stock Adjustment';
    quantity: number;
    price: number;
    referenceId: string;
    supplierOrClient: string;
};

const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const suppliers = ['Jemima Hoffman', 'Amir Vega', 'Quyn Erickson', 'Carla Bender'];
const clients = ['Troy Walker', 'Ciaran Buck', 'Ruth Miles', 'Walking Customer', 'Reed Montoya'];
const transactionTypesIn: ('Purchase' | 'Sales Return')[] = ['Purchase', 'Sales Return'];
const transactionTypesOut: ('Invoice' | 'Purchase Return' | 'Stock Adjustment')[] = ['Invoice', 'Purchase Return', 'Stock Adjustment'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateStockHistory = (productName: string, initialStock: number = 100): StockHistoryEntry[] => {
    const entries: StockHistoryEntry[] = [];
    const now = new Date();
    
    // Generate Stock In entries
    for (let i = 0; i < 7; i++) {
        const type = getRandomElement(transactionTypesIn);
        const entry: StockHistoryEntry = {
            id: `STKIN-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now),
            type: type,
            quantity: Math.floor(Math.random() * 15) + 1,
            price: type === 'Purchase' ? 750 + Math.random() * 100 : 877.85,
            referenceId: type === 'Purchase' ? `PUR-${i + 1}` : `SR-${i - 4}`,
            supplierOrClient: type === 'Purchase' ? getRandomElement(suppliers) : getRandomElement(clients),
        };
        entries.push(entry);
    }

    // Generate Stock Out entries
     for (let i = 0; i < 8; i++) {
        const type = getRandomElement(transactionTypesOut);
        const entry: StockHistoryEntry = {
            id: `STKOUT-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now),
            type: type,
            quantity: -(Math.floor(Math.random() * 8) + 2), // Negative for stock out
            price: type === 'Invoice' ? 950.00 : 880.00,
            referenceId: type === 'Invoice' ? `INV-${i + 1}` : `PR-${i - 5}`,
            supplierOrClient: type === 'Invoice' ? getRandomElement(clients) : getRandomElement(suppliers),
        };
        entries.push(entry);
    }
    
    // Sort by date to ensure chronological order
    return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
};
