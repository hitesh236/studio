
'use client';

import * as React from 'react';
import { StockListTable } from './stock-list-table';
import { generateStockListData, type StockItem } from './data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '../loading';
import { SummaryCard } from '../sales-invoices/summary-card';
import { Wallet, Archive, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function StockListPage() {
  const [stockItems, setStockItems] = React.useState<StockItem[] | null>(null);

  React.useEffect(() => {
    setStockItems(generateStockListData(50));
  }, []);

  const summaryStats = React.useMemo(() => {
    if (!stockItems) {
      return {
        totalStockValue: 0,
        lowStockItems: 0,
        expiringSoon: 0, // Placeholder
      };
    }

    const totalStockValue = stockItems.reduce((acc, item) => acc + (item.purchasePrice * item.stockInHand), 0);
    const lowStockItems = stockItems.filter(item => item.stockInHand < 10).length;
    const expiringSoon = 0; // Placeholder until expiry data is available

    return { totalStockValue, lowStockItems, expiringSoon };
  }, [stockItems]);


  if (!stockItems) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
          title="Total Stock Value" 
          value={formatCurrency(summaryStats.totalStockValue, 'INR')} 
          icon={Wallet}
          variant="primary"
        />
        <SummaryCard 
          title="Low Stock Items" 
          value={summaryStats.lowStockItems.toString()} 
          icon={Archive}
          description="Items with less than 10 units"
        />
        <SummaryCard 
          title="Expiring Soon" 
          value={summaryStats.expiringSoon.toString()} 
          icon={Clock}
          description="Items expiring in next 30 days"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock List</CardTitle>
          <CardDescription>An overview of all your stock items.</CardDescription>
        </CardHeader>
        <CardContent>
          <StockListTable data={stockItems} />
        </CardContent>
      </Card>
    </div>
  );
}
