
import { initialCategoriesData } from '@/lib/categories';
import type { Category } from '@/lib/types';

export type StockItem = {
    id: string;
    productName: string;
    sku: string;
    category: string;
    brand?: string;
    uom: string; 
    attributes?: Record<string, string>;
    hsnCode?: string;
    defaultTaxRate?: number;
    mrp: number;
    sellingPrice: number;
    purchasePrice: number;
    reorderLevel?: number;
    suppliers?: string[];
    barcode?: string;
    status: 'Active' | 'Inactive';
    
    // Inventory specific, might be moved later
    stockInHand: number;
    location: string;
    expiryDate?: Date;
};

const productNames = [
    'Basmati Rice (1kg)', 'Aashirvaad Atta (10kg)', 'Tata Salt (1kg)',
    'MDH Turmeric Powder (200g)', 'Everest Garam Masala (100g)', 'Taj Mahal Tea (500g)',
    'Bru Instant Coffee (100g)', 'Amul Butter (500g)', 'Britannia Marie Gold Biscuits',
    'Maggi 2-Minute Noodles', 'Kissan Mixed Fruit Jam (500g)', 'Saffola Gold Edible Oil (5L)',
    'Dettol Antiseptic Liquid (550ml)', 'Harpic Toilet Cleaner (1L)', 'Surf Excel Matic Liquid Detergent (1L)',
];

const brands = ['HicksBrand', 'Generic', 'LocalFarm', 'Organic+', 'DailyNeeds'];
const uoms = ['pcs', 'kg', 'g', 'L', 'ml', 'pkt'];
const suppliers = ['Global Imports', 'Local Distributors Inc.', 'Farm Fresh Co.'];

const flattenCategories = (categories: Category[]): string[] => {
    const flatList: string[] = [];
    categories.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
            flatList.push(...flattenCategories(cat.children));
        } else {
            flatList.push(cat.name);
        }
    });
    return flatList;
};

const categories = flattenCategories(initialCategoriesData);

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));


export function generateStockListData(count: number = 80): StockItem[] {
  const items: StockItem[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const purchasePrice = Math.floor(Math.random() * 500) + 50;
    const sellingPrice = purchasePrice * (1 + (Math.random() * 0.2 + 0.1));
    const stockInHand = Math.random() < 0.15 ? 0 : Math.floor(Math.random() * 200);

    items.push({
      id: `prod-${1001 + i}`,
      productName: getRandomElement(productNames),
      sku: `SKU-${Math.floor(Math.random() * 9000) + 1000}`,
      category: getRandomElement(categories),
      brand: getRandomElement(brands),
      uom: getRandomElement(uoms),
      attributes: {
          'Pack Size': '1kg',
          'Dietary': 'Vegetarian',
      },
      hsnCode: String(Math.floor(Math.random() * 900000) + 100000),
      defaultTaxRate: getRandomElement([5, 12, 18]),
      mrp: sellingPrice * 1.1, // 10% above selling price
      sellingPrice,
      purchasePrice,
      reorderLevel: Math.floor(Math.random() * 20) + 5,
      suppliers: [getRandomElement(suppliers)],
      barcode: `BRC${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      
      // Inventory specific
      stockInHand: stockInHand,
      location: 'Main Warehouse',
      expiryDate: Math.random() > 0.3 ? getRandomDate(now, new Date(now.getFullYear() + 2, now.getMonth(), now.getDate())) : undefined,
    });
  }
  return items;
}
