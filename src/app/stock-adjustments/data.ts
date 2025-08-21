

export type StockAdjustmentItem = {
  productId: string;
  productName: string;
  adjustmentType: 'addition' | 'reduction';
  quantity: number;
};


export type StockAdjustment = {
  id: string;
  adjustmentNumber: string;
  date: Date;
  reason: 'Stock Take' | 'Damaged Goods' | 'Internal Consumption' | 'Opening Stock' | 'Other';
  items: StockAdjustmentItem[];
  adjustedBy: string;
  notes?: string;
};

const reasons: StockAdjustment['reason'][] = ['Stock Take', 'Damaged Goods', 'Internal Consumption'];
const users = ['Admin', 'John Doe', 'Jane Smith'];
const productNames = [
    'Basmati Rice (1kg)',
    'Aashirvaad Atta (10kg)',
    'MDH Turmeric Powder (200g)',
    'Taj Mahal Tea (500g)',
    'Surf Excel Matic Liquid Detergent (1L)',
];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const generateStockAdjustments = (count: number): StockAdjustment[] => {
    const adjustments: StockAdjustment[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const items: StockAdjustmentItem[] = [];
        for (let j = 0; j < itemCount; j++) {
            items.push({
                productId: `prod-100${j}`,
                productName: getRandomElement(productNames),
                adjustmentType: Math.random() > 0.5 ? 'addition' : 'reduction',
                quantity: Math.floor(Math.random() * 5) + 1,
            });
        }

        const adjustment: StockAdjustment = {
            id: `SA-${1001 + i}`,
            adjustmentNumber: `ADJ-${2024}-${101 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 2, 1), now),
            reason: getRandomElement(reasons),
            items,
            adjustedBy: getRandomElement(users),
            notes: 'Physical stock count reconciliation.'
        };
        adjustments.push(adjustment);
    }
    return adjustments;
};
