
'use client';

import * as React from 'react';
import { StockListTable } from './stock-list-table';
import { generateStockListData, type StockItem } from './data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '../loading';
import { SummaryCard } from '../sales-invoices/summary-card';
import { Wallet, Archive, Clock, PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function StockListPage() {
  const [stockItems, setStockItems] = React.useState<StockItem[] | null>(null);

  React.useEffect(() => {
    setStockItems(generateStockListData());
  }, []);

  const summaryStats = React.useMemo(() => {
    if (!stockItems) {
      return {
        totalStockValue: 0,
        lowStockItems: 0,
        expiringSoon: 0,
      };
    }

    const totalStockValue = stockItems.reduce((acc, item) => acc + (item.purchasePrice * item.stockInHand), 0);
    const lowStockItems = stockItems.filter(item => item.stockInHand < 10).length;
    
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    const expiringSoon = stockItems.filter(item => item.expiryDate && item.expiryDate <= thirtyDaysFromNow).length;

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Stock List</CardTitle>
              <CardDescription>An overview of all your stock items.</CardDescription>
            </div>
            <Link href="/products/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <StockListTable data={stockItems} />
        </CardContent>
      </Card>
    </div>
  );
}
