
'use client';

import Link from 'next/link';
import * as React from 'react';
import { generateSalesInvoices, type SalesInvoice } from '../sales-invoices/data';
import { generatePurchaseBills, type PurchaseBill } from '../purchase/data';
import { generateStockListData, type StockItem } from '../stock-list/data';
import { kpiData } from './data';
import { SummaryCard } from '../sales-invoices/summary-card';
import { QuickActions } from './quick-actions';
import { DashboardCharts } from './charts';
import { InfoTabs } from './info-tabs';
import Loading from '../loading';
import { formatCurrency, cn } from '@/lib/utils';
import { DollarSign, Wallet, TrendingUp, TrendingDown, PackageX, CalendarX2 } from "lucide-react";
import useUserRole from '@/hooks/use-user-role';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { differenceInDays, format } from 'date-fns';

const kpiLinks: Record<string, string> = {
    "Total Revenue": "/sales-invoices",
    "Total Payables": "/purchase",
    "Total Receivables": "/sales-invoices",
    "Net Profit": "/profit-loss"
};

const LowStockCard = ({ items }: { items: StockItem[] }) => (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <PackageX className="h-5 w-5 text-destructive" />
                    <CardTitle>Low Stock Items</CardTitle>
                </div>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/stock-list">View All</Link>
                </Button>
            </div>
            <CardDescription>Items that have fallen below their minimum stock level.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.slice(0, 5).map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-right font-mono text-destructive">{item.stockInHand} {item.uom}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const ExpiryCard = ({ items }: { items: (StockItem & { daysToExpiry: number })[] }) => (
    <Card>
        <CardHeader>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <CalendarX2 className="h-5 w-5 text-destructive" />
                    <CardTitle>Expiring Soon</CardTitle>
                </div>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/reports/expiry-report">View Full Report</Link>
                </Button>
            </div>
            <CardDescription>Products that are approaching their expiration date.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Expires In</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.slice(0, 5).map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant="destructive">{item.daysToExpiry} days</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);


export default function Home() {
  const { role } = useUserRole();
  const [salesInvoices, setSalesInvoices] = React.useState<SalesInvoice[]>([]);
  const [purchaseBills, setPurchaseBills] = React.useState<PurchaseBill[]>([]);
  const [stockItems, setStockItems] = React.useState<StockItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // In a real app, you would fetch this data
    const sales = generateSalesInvoices(100);
    const purchases = generatePurchaseBills(50);
    const stock = generateStockListData(50);
    setSalesInvoices(sales);
    setPurchaseBills(purchases);
    setStockItems(stock);
    setLoading(false);
  }, []);

  const dynamicKpiData = React.useMemo(() => {
    if (loading) return [];
    
    const totalRevenue = salesInvoices.reduce((acc, inv) => acc + inv.amountBase, 0);
    const totalReceivables = salesInvoices.reduce((acc, inv) => acc + inv.amountDue, 0);
    const totalPayables = purchaseBills.reduce((acc, bill) => acc + bill.amountDue, 0);
    // Net profit is a complex calculation, so we'll use a placeholder for now
    const netProfit = totalRevenue - (purchaseBills.reduce((acc, bill) => acc + bill.amount, 0)) * 0.7;

    return [
      { title: "Total Revenue", value: formatCurrency(totalRevenue, 'INR'), icon: DollarSign, variant: "primary" },
      { title: "Total Payables", value: formatCurrency(totalPayables, 'INR'), icon: Wallet },
      { title: "Total Receivables", value: formatCurrency(totalReceivables, 'INR'), icon: TrendingUp },
      { title: "Net Profit", value: formatCurrency(netProfit, 'INR'), icon: TrendingUp },
    ];

  }, [salesInvoices, purchaseBills, loading]);

  const lowStockItems = React.useMemo(() => {
    if (loading || !stockItems) return [];
    return stockItems.filter(item => item.status === 'Low Stock');
  }, [stockItems, loading]);

  const expiringSoonItems = React.useMemo(() => {
    if (loading || !stockItems) return [];
    const now = new Date();
    return stockItems
      .filter(item => item.expiryDate && differenceInDays(item.expiryDate, now) <= 30 && differenceInDays(item.expiryDate, now) >= 0)
      .sort((a, b) => (a.expiryDate?.getTime() || 0) - (b.expiryDate?.getTime() || 0))
      .map(item => ({ ...item, daysToExpiry: differenceInDays(item.expiryDate!, now) }));
  }, [stockItems, loading]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dynamicKpiData.map(kpi => (
            <Link href={kpiLinks[kpi.title] || '/'} key={kpi.title}>
                <SummaryCard
                    title={kpi.title}
                    value={kpi.value}
                    icon={kpi.icon}
                    variant={kpi.variant as any}
                />
            </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <QuickActions />
        </div>
        <div className="md:col-span-2">
          <DashboardCharts salesData={salesInvoices} purchaseData={purchaseBills} />
        </div>
      </div>
      <div>
        <InfoTabs salesData={salesInvoices} purchaseData={purchaseBills} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LowStockCard items={lowStockItems} />
        <ExpiryCard items={expiringSoonItems} />
      </div>
    </div>
  );
}
