
export type StockAdjustment = {
  id: string;
  adjustmentNumber: string;
  date: Date;
  reason: 'Stock Take' | 'Damaged Goods' | 'Internal Consumption' | 'Opening Stock' | 'Other';
  itemsAdjusted: number;
  adjustedBy: string;
  notes?: string;
};

const reasons: StockAdjustment['reason'][] = ['Stock Take', 'Damaged Goods', 'Internal Consumption'];
const users = ['Admin', 'John Doe', 'Jane Smith'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const generateStockAdjustments = (count: number): StockAdjustment[] => {
    const adjustments: StockAdjustment[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const adjustment: StockAdjustment = {
            id: `SA-${1001 + i}`,
            adjustmentNumber: `ADJ-${2024}-${101 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now),
            reason: getRandomElement(reasons),
            itemsAdjusted: Math.floor(Math.random() * 5) + 1,
            adjustedBy: getRandomElement(users),
            notes: 'Physical stock count reconciliation.'
        };
        adjustments.push(adjustment);
    }
    return adjustments;
};
