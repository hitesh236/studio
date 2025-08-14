
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
  'Wireless Mouse', 'Wired Keyboard', 'HDMI Cable (3ft)', 'USB-C Hub', 'Ergonomic Laptop Stand',
  '4K Monitor', 'Webcam 1080p', 'Bluetooth Speaker', 'External SSD 1TB', 'Gaming Headset'
];

const categories = ['Electronics', 'Accessories', 'Peripherals'];
const locations = ['Main Warehouse', 'Downtown Store', 'East-Side Storage'];
const uoms = ['pcs', 'box', 'unit'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateStockListData = (count: number): StockItem[] => {
  const data: StockItem[] = [];
  for (let i = 0; i < count; i++) {
    const purchasePrice = Math.floor(Math.random() * 200) + 10;
    const sellingPrice = purchasePrice * (1 + (Math.random() * 0.5 + 0.2)); // 20% to 70% markup
    data.push({
      id: `prod-${1001 + i}`,
      productName: getRandomElement(productNames),
      sku: `SKU-${1001 + i}`,
      category: getRandomElement(categories),
      purchasePrice: purchasePrice,
      sellingPrice: sellingPrice,
      stockInHand: Math.floor(Math.random() * 200),
      uom: getRandomElement(uoms),
      location: getRandomElement(locations),
    });
  }
  return data;
};
