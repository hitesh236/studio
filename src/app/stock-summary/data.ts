
import type { StockItem } from '@/app/stock-list/data';
import type { StockHistoryEntry } from '@/app/stock-history/data';

export type StockSummaryRow = {
  order: number;
  commodityCode: string;
  commodityName: string;
  unitName: string;
  category: string;
  openingStock: {
    quantity: number;
    amount: number;
  };
  importInPeriod: {
    quantity: number;
    amount: number;
  };
  exportInPeriod: {
    quantity: number;
    amount: number;
  };
  closingStock: {
    quantity: number;
    amount: number;
  };
};


export const generateStockSummaryData = (stockItems: StockItem[], stockHistory: StockHistoryEntry[]): StockSummaryRow[] => {
    return stockItems.map((item, index) => {
        const historyForItem = stockHistory.filter(h => h.id.startsWith('STK'));
        
        const openingStockQty = item.stockInHand - historyForItem.reduce((acc, h) => acc + h.quantity, 0);
        const openingStockAmt = openingStockQty * item.purchasePrice;
        
        const importQty = historyForItem.filter(h => h.quantity > 0).reduce((acc, h) => acc + h.quantity, 0);
        const importAmt = importQty * item.purchasePrice;

        const exportQty = Math.abs(historyForItem.filter(h => h.quantity < 0).reduce((acc, h) => acc + h.quantity, 0));
        const exportAmt = exportQty * item.sellingPrice;
        
        const closingStockQty = openingStockQty + importQty - exportQty;
        const closingStockAmt = closingStockQty * item.purchasePrice;

        return {
            order: index + 1,
            commodityCode: item.sku,
            commodityName: item.productName,
            unitName: item.uom,
            category: item.category,
            openingStock: {
                quantity: openingStockQty,
                amount: openingStockAmt
            },
            importInPeriod: {
                quantity: importQty,
                amount: importAmt
            },
            exportInPeriod: {
                quantity: exportQty,
                amount: exportAmt
            },
            closingStock: {
                quantity: closingStockQty,
                amount: closingStockAmt
            }
        };
    });
};
