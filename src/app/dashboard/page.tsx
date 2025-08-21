
'use client';

import Link from 'next/link';
import * as React from 'react';
import { generateSalesInvoices, type SalesInvoice } from '../sales-invoices/data';
import { generatePurchaseBills, type PurchaseBill } from '../purchase/data';
import { kpiData } from './data';
import { SummaryCard } from '../sales-invoices/summary-card';
import { QuickActions } from './quick-actions';
import { DashboardCharts } from './charts';
import { InfoTabs } from './info-tabs';
import Loading from '../loading';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import useUserRole from '@/hooks/use-user-role';

const kpiLinks: Record<string, string> = {
    "Total Revenue": "/sales-invoices",
    "Total Payables": "/purchase",
    "Total Receivables": "/sales-invoices",
    "Net Profit": "/profit-loss"
};

export default function Home() {
  const { role } = useUserRole();
  const [salesInvoices, setSalesInvoices] = React.useState<SalesInvoice[]>([]);
  const [purchaseBills, setPurchaseBills] = React.useState<PurchaseBill[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // In a real app, you would fetch this data
    const sales = generateSalesInvoices(100);
    const purchases = generatePurchaseBills(50);
    setSalesInvoices(sales);
    setPurchaseBills(purchases);
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
    </div>
  );
}
