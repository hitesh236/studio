import { kpiData } from './dashboard/data';
import { SummaryCard } from './sales-invoices/summary-card';
import { QuickActions } from './dashboard/quick-actions';
import { DashboardCharts } from './dashboard/charts';
import { InfoTabs } from './dashboard/info-tabs';

export default function Home() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiData.map(kpi => (
            <SummaryCard 
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                description={kpi.description}
                variant={kpi.variant as any}
            />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
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
