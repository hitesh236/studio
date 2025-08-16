
export type StockItem = {
  id: string;
  productName: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockInHand: number;
  uom: string;
  location: string;
};

const productNames = [
  'Amul Taaza Milk', 'Britannia Brown Bread', 'Farm Fresh Eggs', 'Kashmiri Apples', 'Basmati Rice (1kg)',
  'Tata Salt', 'Surf Excel Detergent', 'Maggi 2-Minute Noodles', 'Brooke Bond Red Label Tea', 'Nescafe Classic Coffee',
  'Parle-G Biscuits', 'Cadbury Dairy Milk Chocolate', 'Coca-Cola (500ml)', 'Onion (1kg)', 'Tomato (1kg)', 'Potato (1kg)'
];

const categories = ['Dairy & Bakery', 'Produce', 'Pantry Staples', 'Snacks & Beverages', 'Household'];
const locations = ['Aisle 1', 'Aisle 2', 'Aisle 3', 'Refrigerated Section', 'Front Counter'];
const uoms = ['ltr', 'pack', 'dozen', 'kg', 'pcs', 'g', 'unit'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateStockListData = (count: number): StockItem[] => {
  const data: StockItem[] = [];
  for (let i = 0; i < count; i++) {
    const purchasePrice = Math.floor(Math.random() * 150) + 10;
    const sellingPrice = purchasePrice * (1 + (Math.random() * 0.4 + 0.1)); // 10% to 50% markup
    data.push({
      id: `prod-${1001 + i}`,
      productName: getRandomElement(productNames),
      sku: `SKU-${1001 + i}`,
      category: getRandomElement(categories),
      purchasePrice: purchasePrice,
      sellingPrice: sellingPrice,
      stockInHand: Math.floor(Math.random() * 100),
      uom: getRandomElement(uoms),
      location: getRandomElement(locations),
    });
  }
  return data;
};
