
import Link from 'next/link';
import { kpiData } from './data';
import { SummaryCard } from '../sales-invoices/summary-card';
import { QuickActions } from './quick-actions';
import { DashboardCharts } from './charts';
import { InfoTabs } from './info-tabs';

const kpiLinks: Record<string, string> = {
    "Total Revenue": "/sales-invoices",
    "Total Payables": "/purchase",
    "Total Receivables": "/sales-invoices",
    "Net Profit": "/profit-loss"
};

export default function Home() {
  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiData.map(kpi => (
            <Link href={kpiLinks[kpi.title] || '/'} key={kpi.title}>
                <SummaryCard
                    title={kpi.title}
                    value={kpi.value}
                    icon={kpi.icon}
                    description={kpi.description}
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
          <DashboardCharts />
        </div>
      </div>
      <div>
        <InfoTabs />
      </div>
    </div>
  );
}
