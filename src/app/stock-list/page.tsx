
'use client';

import * as React from 'react';
import { StockListTable } from './stock-list-table';
import { generateStockListData, type StockItem } from './data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '../loading';

export default function StockListPage() {
  const [stockItems, setStockItems] = React.useState<StockItem[] | null>(null);

  React.useEffect(() => {
    setStockItems(generateStockListData(50));
  }, []);

  if (!stockItems) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
