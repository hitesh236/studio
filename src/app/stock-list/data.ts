
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
  expiryDate?: Date;
};

const groceryProducts = {
    'Rice': [
        { name: 'Basmati Rice (1kg)', uom: 'kg' },
        { name: 'Sona Masoori Rice (5kg)', uom: 'kg' },
    ],
    'Wheat & Flour': [
        { name: 'Aashirvaad Atta (10kg)', uom: 'kg' },
        { name: 'Fortune Chakki Fresh Atta (5kg)', uom: 'kg' },
    ],
    'Whole Spices': [
        { name: 'Everest Cumin Seeds (100g)', uom: 'g' },
        { name: 'MDH Turmeric Powder (200g)', uom: 'g' },
    ],
    'Powdered Spices': [
        { name: 'Catch Red Chilli Powder (100g)', uom: 'g' },
        { name: 'Tata Sampann Coriander Powder (200g)', uom: 'g' },
    ],
    'Tea & Coffee': [
        { name: 'Taj Mahal Tea (500g)', uom: 'g' },
        { name: 'Nescafe Classic Coffee (100g)', uom: 'g' },
    ],
    'Juices & Soft Drinks': [
        { name: 'Tropicana Orange Juice (1L)', uom: 'L' },
        { name: 'Coca-Cola Can (300ml)', uom: 'ml' },
    ],
    'Soaps & Shampoos': [
        { name: 'Dove Soap Bar (Pack of 3)', uom: 'pack' },
        { name: 'Head & Shoulders Shampoo (340ml)', uom: 'ml' },
    ],
    'Detergents & Cleaners': [
        { name: 'Surf Excel Matic Liquid Detergent (1L)', uom: 'L' },
        { name: 'Harpic Toilet Cleaner (500ml)', uom: 'ml' },
    ],
};

const locations = ['Main Warehouse', 'Store', 'Shop'];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateStockListData = (): StockItem[] => {
  const data: StockItem[] = [];
  let i = 0;

  for (const [category, products] of Object.entries(groceryProducts)) {
    for (const product of products) {
      const purchasePrice = Math.floor(Math.random() * 150) + 10;
      const sellingPrice = purchasePrice * (1 + (Math.random() * 0.4 + 0.1)); // 10% to 50% markup
      
      const now = new Date();
      let expiryDate: Date | undefined = new Date();
      
      // Make some items expire soon
      if (i % 4 === 0) {
        expiryDate.setDate(now.getDate() + Math.floor(Math.random() * 28) + 1); // Expires in the next 1-28 days
      } else {
        expiryDate.setMonth(now.getMonth() + Math.floor(Math.random() * 12) + 2); // Expires in 2-14 months
      }

      data.push({
        id: `prod-${1001 + i}`,
        productName: product.name,
        sku: `SKU-${1001 + i}`,
        category: category,
        purchasePrice: purchasePrice,
        sellingPrice: sellingPrice,
        stockInHand: Math.floor(Math.random() * 100),
        uom: product.uom,
        location: getRandomElement(locations),
        expiryDate: expiryDate
      });
      i++;
    }
  }
  return data;
};
