

export type StockItem = {
    id: string;
    productName: string;
    sku: string;
    category: string;
    stockInHand: number;
    purchasePrice: number;
    sellingPrice: number;
    uom: string; // Unit of Measurement
    location: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    expiryDate?: Date;
};

const productNames = [
    'Basmati Rice (1kg)',
    'Aashirvaad Atta (10kg)',
    'Tata Salt (1kg)',
    'MDH Turmeric Powder (200g)',
    'Everest Garam Masala (100g)',
    'Taj Mahal Tea (500g)',
    'Bru Instant Coffee (100g)',
    'Amul Butter (500g)',
    'Britannia Marie Gold Biscuits',
    'Maggi 2-Minute Noodles',
    'Kissan Mixed Fruit Jam (500g)',
    'Saffola Gold Edible Oil (5L)',
    'Dettol Antiseptic Liquid (550ml)',
    'Harpic Toilet Cleaner (1L)',
    'Surf Excel Matic Liquid Detergent (1L)',
];

const categories = ['Staples', 'Spices', 'Beverages', 'Dairy', 'Snacks', 'Oils', 'Home Care'];
const locations = ['Main Warehouse', 'Store Shelf A', 'Store Shelf B', 'Cold Storage'];
const uoms = ['pcs', 'kg', 'g', 'L', 'ml', 'pkt'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));


export function generateStockListData(count: number = 20): StockItem[] {
  const items: StockItem[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const stockInHand = Math.floor(Math.random() * 200);
    const purchasePrice = Math.floor(Math.random() * 500) + 50;
    const sellingPrice = purchasePrice * (1 + (Math.random() * 0.2 + 0.1)); // 10-30% markup
    
    let status: StockItem['status'];
    if (stockInHand === 0) {
        status = 'Out of Stock';
    } else if (stockInHand < 20) {
        status = 'Low Stock';
    } else {
        status = 'In Stock';
    }
    
    const hasExpiry = Math.random() > 0.3;
    const expiryDate = hasExpiry ? getRandomDate(now, new Date(now.getFullYear() + 2, now.getMonth(), now.getDate())) : undefined;

    items.push({
      id: `prod-${1001 + i}`,
      productName: getRandomElement(productNames),
      sku: `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
      category: getRandomElement(categories),
      stockInHand,
      purchasePrice,
      sellingPrice,
      uom: getRandomElement(uoms),
      location: getRandomElement(locations),
      status,
      expiryDate,
    });
  }
  return items;
}
