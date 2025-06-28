
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { id: 'company', label: 'Company Setting' },
  { id: 'gst', label: 'GST Type' },
  { id: 'payment', label: 'Payment Terms' },
  { id: 'integration', label: 'Integration' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('company');

  const renderContent = () => {
    switch (activeTab) {
      case 'company':
        return <div><h2 className="text-xl font-semibold">Company Setting</h2></div>;
      case 'gst':
        return <div><h2 className="text-xl font-semibold">GST Type</h2></div>;
      case 'payment':
        return <div><h2 className="text-xl font-semibold">Payment Terms</h2></div>;
      case 'integration':
        return <div><h2 className="text-xl font-semibold">Integration</h2></div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your company settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            <aside className="-ml-2 flex flex-col gap-1">
              {settingsTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={cn(
                    "justify-start",
                    activeTab === tab.id && "bg-muted font-semibold"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </aside>
            <main>
              {renderContent()}
            </main>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
