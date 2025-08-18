
export type StockHistoryEntry = {
    id: string;
    date: Date;
    type: 'Purchase' | 'Invoice Return' | 'Invoice' | 'Purchase Return';
    quantity: number;
    price: number;
    code: string;
    supplierOrClient: string;
};

const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const suppliers = ['Jemima Hoffman', 'Amir Vega', 'Quyn Erickson', 'Carla Bender'];
const clients = ['Troy Walker', 'Ciaran Buck', 'Ruth Miles', 'Walking Customer', 'Reed Montoya'];

export const generateStockHistory = (productName: string, initialStock: number = 100): StockHistoryEntry[] => {
    const entries: StockHistoryEntry[] = [];
    const now = new Date();
    
    // Generate Stock In entries
    for (let i = 0; i < 7; i++) {
        const isPurchase = Math.random() > 0.2;
        const entry: StockHistoryEntry = {
            id: `STKIN-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
            type: isPurchase ? 'Purchase' : 'Invoice Return',
            quantity: Math.floor(Math.random() * 15) + 1,
            price: isPurchase ? 750 + Math.random() * 100 : 877.85,
            code: isPurchase ? `APP-${i + 1}` : `AIR-${i - 4}`,
            supplierOrClient: isPurchase ? getRandomElement(suppliers) : getRandomElement(clients),
        };
        entries.push(entry);
    }

    // Generate Stock Out entries
     for (let i = 0; i < 8; i++) {
        const isInvoice = Math.random() > 0.2;
        const entry: StockHistoryEntry = {
            id: `STKOUT-${1001 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
            type: isInvoice ? 'Invoice' : 'Purchase Return',
            quantity: -(Math.floor(Math.random() * 8) + 2), // Negative for stock out
            price: isInvoice ? 950.00 : 880.00,
            code: isInvoice ? `AI-${i + 1}` : `APR-${i - 5}`,
            supplierOrClient: isInvoice ? getRandomElement(clients) : getRandomElement(suppliers),
        };
        entries.push(entry);
    }
    
    // Sort by date to ensure chronological order
    return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
