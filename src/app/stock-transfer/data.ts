
export type StockTransferItem = {
  productId: string;
  productName: string;
  quantity: number;
};


export type StockTransfer = {
  id: string;
  transferNumber: string;
  date: Date;
  fromLocation: string;
  toLocation: string;
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
  items: StockTransferItem[];
  initiatedBy: string;
  notes?: string;
};

const locations = ['Main Warehouse', 'Store', 'Shop A', 'Shop B'];
const users = ['Admin', 'John Doe', 'Jane Smith'];
const productNames = [
    'Basmati Rice (1kg)',
    'Aashirvaad Atta (10kg)',
    'MDH Turmeric Powder (200g)',
    'Taj Mahal Tea (500g)',
    'Surf Excel Matic Liquid Detergent (1L)',
];
const statuses: StockTransfer['status'][] = ['Pending', 'In Transit', 'Completed', 'Cancelled'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

export const generateStockTransfers = (count: number): StockTransfer[] => {
    const transfers: StockTransfer[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const items: StockTransferItem[] = [];
        for (let j = 0; j < itemCount; j++) {
            items.push({
                productId: `prod-100${j}`,
                productName: getRandomElement(productNames),
                quantity: Math.floor(Math.random() * 20) + 5,
            });
        }
        
        let fromLocation = getRandomElement(locations);
        let toLocation = getRandomElement(locations);
        while(fromLocation === toLocation) {
            toLocation = getRandomElement(locations);
        }

        const transfer: StockTransfer = {
            id: `ST-${1001 + i}`,
            transferNumber: `TRN-${2024}-${101 + i}`,
            date: getRandomDate(new Date(now.getFullYear(), now.getMonth() - 1, 1), now),
            fromLocation,
            toLocation,
            status: getRandomElement(statuses),
            items,
            initiatedBy: getRandomElement(users),
            notes: 'Quarterly stock balancing.'
        };
        transfers.push(transfer);
    }
    return transfers;
};
